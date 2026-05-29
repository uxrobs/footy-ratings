import { NextResponse } from "next/server";
import { getDeviceIdFromCookies } from "@/lib/device";
import {
  getActiveRound,
  getGamesWithAggregates,
  getRoundSummary,
} from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  try {
    const round = await getActiveRound();
    if (!round) {
      return NextResponse.json({ round: null, games: [], summary: null });
    }

    const deviceId = await getDeviceIdFromCookies();
    const games = await getGamesWithAggregates(round.id, deviceId);
    const summary = await getRoundSummary(games);

    return NextResponse.json({ round, games, summary });
  } catch (error) {
    console.error("GET /api/round/current", error);
    return NextResponse.json({ error: "Failed to load round" }, { status: 500 });
  }
}
