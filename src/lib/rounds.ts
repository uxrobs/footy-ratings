import type { Game, Round } from "@/types/database";

/** First round available on Footy Ratings (2026 launch). */
export const LAUNCH_ROUND_NUMBER = 12;

export const SUBMISSION_GRACE_MS = 24 * 60 * 60 * 1000;

export function getSeasonYear(): number {
  return Number(process.env.SEED_YEAR ?? 2026);
}

export function isRoundViewable(
  roundNumber: number,
  activeRoundNumber: number,
): boolean {
  return (
    roundNumber >= LAUNCH_ROUND_NUMBER && roundNumber <= activeRoundNumber
  );
}

/** When the active round has not started, default to the previous round. */
export function getDefaultDisplayRoundNumber(
  activeRound: Round,
  activeRoundGames: Game[],
): number {
  const hasStarted = activeRoundGames.some((game) => game.status !== "upcoming");
  if (!hasStarted && activeRound.round_number > LAUNCH_ROUND_NUMBER) {
    return activeRound.round_number - 1;
  }
  return activeRound.round_number;
}

export function getRoundSubmissionsCloseAt(games: Game[]): Date | null {
  if (games.length === 0) return null;
  if (!games.every((game) => game.status === "complete")) return null;

  const lastUpdatedMs = games.reduce((latest, game) => {
    const timestamp = new Date(game.updated_at).getTime();
    return timestamp > latest ? timestamp : latest;
  }, 0);

  return new Date(lastUpdatedMs + SUBMISSION_GRACE_MS);
}

export function isRoundOpenForSubmissions(games: Game[]): boolean {
  const closeAt = getRoundSubmissionsCloseAt(games);
  if (!closeAt) return true;
  return Date.now() < closeAt.getTime();
}

export function getRoundHref(
  roundNumber: number,
  defaultRoundNumber: number,
): string {
  return roundNumber === defaultRoundNumber ? "/" : `/round/${roundNumber}`;
}

export function formatSubmissionsCloseAt(closeAt: Date): string {
  return closeAt.toLocaleString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Australia/Melbourne",
  });
}
