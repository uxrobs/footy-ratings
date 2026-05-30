import { NextRequest, NextResponse } from "next/server";
import { getDeviceIdFromCookies } from "@/lib/device";
import { canSubmitRating } from "@/lib/ratings";
import {
  getGameById,
  getGamesForRound,
  getUserRatingsForGame,
  submitRating,
} from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

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
    return NextResponse.json({ expectation: null, reality: null });
  }

  try {
    const ratings = await getUserRatingsForGame(gameId, deviceId);
    return NextResponse.json(ratings);
  } catch (error) {
    console.error("GET /api/ratings/me", error);
    return NextResponse.json({ error: "Failed to load ratings" }, { status: 500 });
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
      phase?: "expectation" | "reality";
      overallScore?: number;
      factorScores?: Record<string, number>;
    };

    const { gameId, phase, overallScore, factorScores } = body;

    if (!gameId || !phase || overallScore === undefined) {
      return NextResponse.json(
        { error: "gameId, phase, and overallScore are required" },
        { status: 400 },
      );
    }

    if (overallScore < 1 || overallScore > 10 || !Number.isInteger(overallScore)) {
      return NextResponse.json(
        { error: "overallScore must be an integer between 1 and 10" },
        { status: 400 },
      );
    }

    const game = await getGameById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const roundGames = await getGamesForRound(game.round_id);

    if (!canSubmitRating(game, phase, roundGames)) {
      return NextResponse.json(
        {
          error: roundGames.every((roundGame) => roundGame.status === "complete")
            ? "Submissions for this round are closed"
            : `Cannot submit ${phase} rating for this game status`,
        },
        { status: 400 },
      );
    }

    const result = await submitRating({
      gameId,
      deviceId,
      phase,
      overallScore,
      factorScores,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("POST /api/ratings", error);
    return NextResponse.json({ error: "Failed to submit rating" }, { status: 500 });
  }
}
