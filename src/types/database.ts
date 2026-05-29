export type GameStatus = "upcoming" | "live" | "complete";
export type RatingPhase = "expectation" | "reality";

export interface Round {
  id: string;
  year: number;
  round_number: number;
  name: string;
  is_active: boolean;
  unlocked_at: string | null;
}

export interface Game {
  id: string;
  round_id: string;
  squiggle_id: number;
  home_team: string;
  away_team: string;
  venue: string;
  kickoff_at: string;
  status: GameStatus;
  home_score: number | null;
  away_score: number | null;
  margin: number | null;
}

export interface RatingFactor {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
  active: boolean;
}

export interface Rating {
  id: string;
  game_id: string;
  device_id: string;
  phase: RatingPhase;
  overall_score: number;
  created_at: string;
  updated_at: string;
}

export interface RatingFactorScore {
  rating_id: string;
  factor_id: string;
  score: number;
}

export interface GameAggregates {
  expectation_avg: number | null;
  reality_avg: number | null;
  expectation_count: number;
  reality_count: number;
  delta: number | null;
}

export interface FactorAggregate {
  factor_id: string;
  slug: string;
  label: string;
  expectation_avg: number | null;
  reality_avg: number | null;
  delta: number | null;
}

export interface GameWithAggregates extends Game {
  aggregates: GameAggregates;
  user_expectation: number | null;
  user_reality: number | null;
}

export interface ScoreDistribution {
  score: number;
  expectation_count: number;
  reality_count: number;
}

export interface RoundSummary {
  expectation_avg: number | null;
  reality_avg: number | null;
  delta: number | null;
  games_with_both_phases: number;
}
