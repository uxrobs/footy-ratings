import { NextRequest, NextResponse } from "next/server";
import { getDeviceIdFromCookies } from "@/lib/device";
import { canSubmitReview } from "@/lib/ratings";
import {
  getGameById,
  getGamesForRound,
  getUserReviewForGame,
  submitReview,
} from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";

const MAX_REVIEW_LENGTH = 500;
const MAX_NAME_LENGTH = 40;

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return false;
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const gameId = request.nextUrl.searchParams.get("gameId");
  if (!gameId) {
    return NextResponse.json({ error: "gameId is required" }, { status: 400 });
  }

  const deviceId = await getDeviceIdFromCookies();
  if (!deviceId) {
    return NextResponse.json({ review: null });
  }

  try {
    const review = await getUserReviewForGame(gameId, deviceId);
    return NextResponse.json({ review });
  } catch (error) {
    console.error("GET /api/reviews", error);
    return NextResponse.json({ error: "Failed to load review" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const deviceId = await getDeviceIdFromCookies();
  if (!deviceId) {
    return NextResponse.json({ error: "Device not identified" }, { status: 401 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`${deviceId}:${ip}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = (await request.json()) as {
      gameId?: string;
      authorName?: string;
      body?: string;
    };

    const { gameId, authorName, body: reviewBody } = body;

    if (!gameId || authorName === undefined || reviewBody === undefined) {
      return NextResponse.json(
        { error: "gameId, authorName, and body are required" },
        { status: 400 },
      );
    }

    const trimmedName = authorName.trim();
    if (trimmedName.length < 1) {
      return NextResponse.json({ error: "Your name is required" }, { status: 400 });
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Name must be ${MAX_NAME_LENGTH} characters or fewer` },
        { status: 400 },
      );
    }

    const trimmedBody = reviewBody.trim();
    if (trimmedBody.length < 1) {
      return NextResponse.json({ error: "Review cannot be empty" }, { status: 400 });
    }
    if (trimmedBody.length > MAX_REVIEW_LENGTH) {
      return NextResponse.json(
        { error: `Review must be ${MAX_REVIEW_LENGTH} characters or fewer` },
        { status: 400 },
      );
    }

    const game = await getGameById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const roundGames = await getGamesForRound(game.round_id);

    if (!canSubmitReview(game, roundGames)) {
      return NextResponse.json(
        {
          error: game.status !== "complete"
            ? "Reviews are only available after full time"
            : "Submissions for this round are closed",
        },
        { status: 400 },
      );
    }

    const result = await submitReview({
      gameId,
      deviceId,
      authorName: trimmedName,
      body: trimmedBody,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("POST /api/reviews", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
