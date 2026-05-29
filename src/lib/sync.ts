import { fetchSquiggleGames, mapSquiggleGame } from "@/lib/squiggle";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getActiveRound } from "@/lib/queries";

const DEFAULT_SYNC_INTERVAL_MINUTES = 30;

function isSyncSkippedInDev(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.SKIP_SYNC_IN_DEV === "true"
  );
}

function getSyncIntervalMs(): number {
  const minutes = Number(
    process.env.SYNC_INTERVAL_MINUTES ?? DEFAULT_SYNC_INTERVAL_MINUTES,
  );
  return Math.max(5, minutes) * 60 * 1000;
}

/** Sync fixtures when data is stale. Used instead of Vercel cron on free tier. */
export async function syncActiveRoundIfStale(): Promise<{
  ran: boolean;
  skipped?: boolean;
  reason?: string;
  synced?: number;
  round?: string;
  message?: string;
}> {
  if (isSyncSkippedInDev()) {
    return { ran: false, skipped: true, reason: "dev_skip" };
  }

  const round = await getActiveRound();
  if (!round) {
    return { ran: false, skipped: true, reason: "no_active_round" };
  }

  const supabase = getSupabaseAdmin();
  const { data: latestGame, error } = await supabase
    .from("games")
    .select("updated_at")
    .eq("round_id", round.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  const intervalMs = getSyncIntervalMs();
  if (latestGame?.updated_at) {
    const ageMs = Date.now() - new Date(latestGame.updated_at).getTime();
    if (ageMs < intervalMs) {
      return { ran: false, skipped: true, reason: "fresh" };
    }
  }

  const result = await syncActiveRoundFixtures();
  return { ran: true, ...result };
}

export async function syncActiveRoundFixtures() {
  const round = await getActiveRound();
  if (!round) {
    return { synced: 0, message: "No active round configured" };
  }

  const squiggleGames = await fetchSquiggleGames(round.year, round.round_number);
  const supabase = getSupabaseAdmin();
  let synced = 0;

  for (const squiggleGame of squiggleGames) {
    const mapped = mapSquiggleGame(squiggleGame);
    const { error } = await supabase.from("games").upsert(
      {
        round_id: round.id,
        ...mapped,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "squiggle_id" },
    );

    if (error) throw error;
    synced += 1;
  }

  const advance = await maybeAdvanceToNextRound();

  return {
    synced,
    round: round.name,
    advanced: advance.advanced,
    message: advance.advanced
      ? `Synced ${synced} games. ${advance.message}`
      : `Synced ${synced} games for ${round.name}`,
  };
}

function isAutoAdvanceEnabled(): boolean {
  return process.env.AUTO_ADVANCE_ROUNDS !== "false";
}

/** When every game in the active round is complete, seed the next round from Squiggle. */
export async function maybeAdvanceToNextRound(): Promise<{
  advanced: boolean;
  message?: string;
}> {
  if (!isAutoAdvanceEnabled()) {
    return { advanced: false };
  }

  const round = await getActiveRound();
  if (!round) {
    return { advanced: false };
  }

  const supabase = getSupabaseAdmin();
  const { data: games, error } = await supabase
    .from("games")
    .select("status")
    .eq("round_id", round.id);

  if (error) throw error;
  if (!games?.length) {
    return { advanced: false };
  }

  const allComplete = games.every((game) => game.status === "complete");
  if (!allComplete) {
    return { advanced: false };
  }

  const nextRoundNumber = round.round_number + 1;

  try {
    const squiggleGames = await fetchSquiggleGames(round.year, nextRoundNumber);
    if (squiggleGames.length === 0) {
      return {
        advanced: false,
        message: `${round.name} is complete; Round ${nextRoundNumber} is not on Squiggle yet.`,
      };
    }

    const result = await seedRound(round.year, nextRoundNumber, true);
    return {
      advanced: true,
      message: `Auto-advanced to ${result.round.name} (${result.games} games).`,
    };
  } catch (error) {
    console.error("Auto-advance failed:", error);
    return { advanced: false };
  }
}

export async function seedRound(
  year: number,
  roundNumber: number,
  setActive = true,
) {
  const squiggleGames = await fetchSquiggleGames(year, roundNumber);
  if (squiggleGames.length === 0) {
    throw new Error(`No games found for ${year} round ${roundNumber}`);
  }

  const supabase = getSupabaseAdmin();
  const roundName = squiggleGames[0]?.roundname ?? `Round ${roundNumber}`;

  if (setActive) {
    await supabase.from("rounds").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");
  }

  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .upsert(
      {
        year,
        round_number: roundNumber,
        name: roundName,
        is_active: setActive,
        unlocked_at: setActive ? new Date().toISOString() : null,
      },
      { onConflict: "year,round_number" },
    )
    .select("*")
    .single();

  if (roundError) throw roundError;

  for (const squiggleGame of squiggleGames) {
    const mapped = mapSquiggleGame(squiggleGame);
    const { error } = await supabase.from("games").upsert(
      {
        round_id: round.id,
        ...mapped,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "squiggle_id" },
    );

    if (error) throw error;
  }

  return {
    round,
    games: squiggleGames.length,
  };
}
