import type { Game, GameAggregates, RatingPhase } from "@/types/database";
import { isRoundOpenForSubmissions } from "@/lib/rounds";

export interface DeltaLabel {
  label: string;
  tone: "positive" | "neutral" | "negative";
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function computeAggregates(
  expectationScores: number[],
  realityScores: number[],
): GameAggregates {
  const expectation_avg = average(expectationScores);
  const reality_avg = average(realityScores);
  const delta =
    expectation_avg !== null && reality_avg !== null
      ? reality_avg - expectation_avg
      : null;

  return {
    expectation_avg,
    reality_avg,
    expectation_count: expectationScores.length,
    reality_count: realityScores.length,
    delta,
  };
}

export function getDeltaLabel(delta: number | null): DeltaLabel | null {
  if (delta === null) return null;

  if (delta >= 1.5) {
    return { label: "Massively over-delivered", tone: "positive" };
  }
  if (delta >= 0.5) {
    return { label: "Better than expected", tone: "positive" };
  }
  if (delta > -0.5) {
    return { label: "Met expectations", tone: "neutral" };
  }
  if (delta > -1.5) {
    return { label: "Underwhelmed", tone: "negative" };
  }
  return { label: "Total flop", tone: "negative" };
}

export function formatScore(value: number | null, digits = 1): string {
  if (value === null) return "—";
  return value.toFixed(digits);
}

export function formatDelta(value: number | null, digits = 1): string {
  if (value === null) return "—";
  const formatted = value.toFixed(digits);
  return value > 0 ? `+${formatted}` : formatted;
}

export function getRatingPhaseForGame(
  status: "upcoming" | "live" | "complete",
): RatingPhase | null {
  if (status === "upcoming") return "expectation";
  if (status === "complete") return "reality";
  return null;
}

export function canRatePhase(
  status: "upcoming" | "live" | "complete",
  phase: RatingPhase,
): boolean {
  if (phase === "expectation") return status === "upcoming";
  if (phase === "reality") return status === "complete";
  return false;
}

export function canSubmitRating(
  game: Pick<Game, "status">,
  phase: RatingPhase,
  roundGames: Game[],
): boolean {
  if (!isRoundOpenForSubmissions(roundGames)) return false;
  return canRatePhase(game.status, phase);
}

export function canSubmitReview(
  game: Pick<Game, "status">,
  roundGames: Game[],
): boolean {
  if (!isRoundOpenForSubmissions(roundGames)) return false;
  return game.status === "complete";
}

export function getPhaseLabel(phase: RatingPhase): string {
  return phase === "expectation" ? "Expectation" : "Reality";
}
