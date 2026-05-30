import type { GameStatus } from "@/types/database";
import { parseSquiggleKickoff } from "@/lib/datetime";

export interface SquiggleGame {
  id: number;
  complete: number;
  hteam: string;
  ateam: string;
  venue: string;
  date: string;
  localtime: string;
  hscore: number;
  ascore: number;
  round: number;
  year: number;
  roundname: string;
}

export interface SquiggleResponse {
  games: SquiggleGame[];
}

const SQUIGGLE_USER_AGENT =
  process.env.SQUIGGLE_USER_AGENT ?? "FootyRatings/1.0 (https://github.com/footy-ratings)";

export async function fetchSquiggleGames(
  year: number,
  roundNumber: number,
): Promise<SquiggleGame[]> {
  const url = `https://api.squiggle.com.au/?q=games;year=${year};round=${roundNumber};format=json`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": SQUIGGLE_USER_AGENT,
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Squiggle API error: ${response.status}`);
  }

  const data = (await response.json()) as SquiggleResponse;
  return data.games ?? [];
}

export function mapSquiggleStatus(complete: number): GameStatus {
  if (complete >= 100) return "complete";
  if (complete > 0) return "live";
  return "upcoming";
}

export function mapSquiggleGame(game: SquiggleGame) {
  const status = mapSquiggleStatus(game.complete);
  const homeScore = status === "complete" ? game.hscore : null;
  const awayScore = status === "complete" ? game.ascore : null;
  const margin =
    homeScore !== null && awayScore !== null
      ? Math.abs(homeScore - awayScore)
      : null;

  return {
    squiggle_id: game.id,
    home_team: game.hteam,
    away_team: game.ateam,
    venue: game.venue,
    kickoff_at: parseSquiggleKickoff(game.localtime || game.date),
    status,
    home_score: homeScore,
    away_score: awayScore,
    margin,
  };
}
