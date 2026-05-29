import { fetchSquiggleGames, mapSquiggleGame } from "@/lib/squiggle";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getActiveRound } from "@/lib/queries";

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

  return {
    synced,
    round: round.name,
    message: `Synced ${synced} games for ${round.name}`,
  };
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
