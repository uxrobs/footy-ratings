import { getSupabaseAdmin } from "@/lib/supabase";
import { computeAggregates } from "@/lib/ratings";
import type {
  FactorAggregate,
  Game,
  GameWithAggregates,
  RatingFactor,
  Round,
  RoundSummary,
  ScoreDistribution,
} from "@/types/database";

export async function getActiveRound(): Promise<Round | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("rounds")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getGamesForRound(roundId: string): Promise<Game[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("round_id", roundId)
    .order("kickoff_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getGameById(gameId: string): Promise<Game | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getRatingFactors(): Promise<RatingFactor[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("rating_factors")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

async function getRatingsForGames(gameIds: string[]) {
  if (gameIds.length === 0) return [];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ratings")
    .select("game_id, phase, overall_score, device_id")
    .in("game_id", gameIds);

  if (error) throw error;
  return data ?? [];
}

export async function getGamesWithAggregates(
  roundId: string,
  deviceId?: string | null,
): Promise<GameWithAggregates[]> {
  const games = await getGamesForRound(roundId);
  const ratings = await getRatingsForGames(games.map((game) => game.id));

  return games.map((game) => {
    const gameRatings = ratings.filter((rating) => rating.game_id === game.id);
    const expectationScores = gameRatings
      .filter((rating) => rating.phase === "expectation")
      .map((rating) => rating.overall_score);
    const realityScores = gameRatings
      .filter((rating) => rating.phase === "reality")
      .map((rating) => rating.overall_score);

    const userRatings = deviceId
      ? gameRatings.filter((rating) => rating.device_id === deviceId)
      : [];

    return {
      ...game,
      aggregates: computeAggregates(expectationScores, realityScores),
      user_expectation:
        userRatings.find((rating) => rating.phase === "expectation")
          ?.overall_score ?? null,
      user_reality:
        userRatings.find((rating) => rating.phase === "reality")?.overall_score ??
        null,
    };
  });
}

export async function getRoundSummary(
  games: GameWithAggregates[],
): Promise<RoundSummary> {
  const gamesWithBoth = games.filter(
    (game) =>
      game.aggregates.expectation_avg !== null &&
      game.aggregates.reality_avg !== null,
  );

  const expectationValues = gamesWithBoth.map(
    (game) => game.aggregates.expectation_avg as number,
  );
  const realityValues = gamesWithBoth.map(
    (game) => game.aggregates.reality_avg as number,
  );

  const expectation_avg =
    expectationValues.length > 0
      ? expectationValues.reduce((sum, value) => sum + value, 0) /
        expectationValues.length
      : null;
  const reality_avg =
    realityValues.length > 0
      ? realityValues.reduce((sum, value) => sum + value, 0) / realityValues.length
      : null;

  return {
    expectation_avg,
    reality_avg,
    delta:
      expectation_avg !== null && reality_avg !== null
        ? reality_avg - expectation_avg
        : null,
    games_with_both_phases: gamesWithBoth.length,
  };
}

export async function getUserRatingsForGame(
  gameId: string,
  deviceId: string,
) {
  const supabase = getSupabaseAdmin();
  const { data: ratings, error } = await supabase
    .from("ratings")
    .select("id, phase, overall_score")
    .eq("game_id", gameId)
    .eq("device_id", deviceId);

  if (error) throw error;
  if (!ratings?.length) return { expectation: null, reality: null, factorScores: {} };

  const ratingIds = ratings.map((rating) => rating.id);
  const { data: factorScores, error: factorError } = await supabase
    .from("rating_factor_scores")
    .select("rating_id, factor_id, score")
    .in("rating_id", ratingIds);

  if (factorError) throw factorError;

  const factorScoresByRating = new Map<string, Record<string, number>>();
  for (const row of factorScores ?? []) {
    const existing = factorScoresByRating.get(row.rating_id) ?? {};
    existing[row.factor_id] = row.score;
    factorScoresByRating.set(row.rating_id, existing);
  }

  const expectationRating = ratings.find((rating) => rating.phase === "expectation");
  const realityRating = ratings.find((rating) => rating.phase === "reality");

  return {
    expectation: expectationRating
      ? {
          overall_score: expectationRating.overall_score,
          factor_scores: factorScoresByRating.get(expectationRating.id) ?? {},
        }
      : null,
    reality: realityRating
      ? {
          overall_score: realityRating.overall_score,
          factor_scores: factorScoresByRating.get(realityRating.id) ?? {},
        }
      : null,
    factorScores: {},
  };
}

export async function getFactorAggregatesForGame(
  gameId: string,
): Promise<FactorAggregate[]> {
  const supabase = getSupabaseAdmin();
  const factors = await getRatingFactors();

  const { data: ratings, error } = await supabase
    .from("ratings")
    .select("id, phase")
    .eq("game_id", gameId);

  if (error) throw error;
  if (!ratings?.length) {
    return factors.map((factor) => ({
      factor_id: factor.id,
      slug: factor.slug,
      label: factor.label,
      expectation_avg: null,
      reality_avg: null,
      delta: null,
    }));
  }

  const ratingIds = ratings.map((rating) => rating.id);
  const { data: factorScores, error: factorError } = await supabase
    .from("rating_factor_scores")
    .select("rating_id, factor_id, score")
    .in("rating_id", ratingIds);

  if (factorError) throw factorError;

  const ratingPhaseById = new Map(
    ratings.map((rating) => [rating.id, rating.phase]),
  );

  return factors.map((factor) => {
    const scoresForFactor = (factorScores ?? []).filter(
      (row) => row.factor_id === factor.id,
    );

    const expectationScores = scoresForFactor
      .filter((row) => ratingPhaseById.get(row.rating_id) === "expectation")
      .map((row) => row.score);
    const realityScores = scoresForFactor
      .filter((row) => ratingPhaseById.get(row.rating_id) === "reality")
      .map((row) => row.score);

    const expectation_avg =
      expectationScores.length > 0
        ? expectationScores.reduce((sum, value) => sum + value, 0) /
          expectationScores.length
        : null;
    const reality_avg =
      realityScores.length > 0
        ? realityScores.reduce((sum, value) => sum + value, 0) /
          realityScores.length
        : null;

    return {
      factor_id: factor.id,
      slug: factor.slug,
      label: factor.label,
      expectation_avg,
      reality_avg,
      delta:
        expectation_avg !== null && reality_avg !== null
          ? reality_avg - expectation_avg
          : null,
    };
  });
}

export async function getScoreDistribution(
  gameId: string,
): Promise<ScoreDistribution[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ratings")
    .select("phase, overall_score")
    .eq("game_id", gameId);

  if (error) throw error;

  return Array.from({ length: 10 }, (_, index) => {
    const score = index + 1;
    const rows = data ?? [];
    return {
      score,
      expectation_count: rows.filter(
        (row) => row.phase === "expectation" && row.overall_score === score,
      ).length,
      reality_count: rows.filter(
        (row) => row.phase === "reality" && row.overall_score === score,
      ).length,
    };
  });
}

export interface SubmitRatingInput {
  gameId: string;
  deviceId: string;
  phase: "expectation" | "reality";
  overallScore: number;
  factorScores?: Record<string, number>;
}

export async function submitRating(input: SubmitRatingInput) {
  const supabase = getSupabaseAdmin();
  const game = await getGameById(input.gameId);
  if (!game) throw new Error("Game not found");

  const { data: existing, error: existingError } = await supabase
    .from("ratings")
    .select("id")
    .eq("game_id", input.gameId)
    .eq("device_id", input.deviceId)
    .eq("phase", input.phase)
    .maybeSingle();

  if (existingError) throw existingError;

  let ratingId = existing?.id;

  if (ratingId) {
    const { error } = await supabase
      .from("ratings")
      .update({
        overall_score: input.overallScore,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ratingId);

    if (error) throw error;

    await supabase.from("rating_factor_scores").delete().eq("rating_id", ratingId);
  } else {
    const { data, error } = await supabase
      .from("ratings")
      .insert({
        game_id: input.gameId,
        device_id: input.deviceId,
        phase: input.phase,
        overall_score: input.overallScore,
      })
      .select("id")
      .single();

    if (error) throw error;
    ratingId = data.id;
  }

  const factorEntries = Object.entries(input.factorScores ?? {}).filter(
    ([, score]) => score >= 1 && score <= 10,
  );

  if (factorEntries.length > 0) {
    const { error } = await supabase.from("rating_factor_scores").insert(
      factorEntries.map(([factorId, score]) => ({
        rating_id: ratingId,
        factor_id: factorId,
        score,
      })),
    );

    if (error) throw error;
  }

  return { ratingId };
}
