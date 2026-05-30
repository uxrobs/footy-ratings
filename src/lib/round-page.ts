import { getDeviceIdFromCookies } from "@/lib/device";
import {
  getDefaultDisplayRoundNumber,
  getRoundHref,
  getRoundSubmissionsCloseAt,
  isRoundOpenForSubmissions,
  isRoundViewable,
  LAUNCH_ROUND_NUMBER,
} from "@/lib/rounds";
import {
  getActiveRound,
  getGamesForRound,
  getGamesWithAggregates,
  getRoundByNumber,
  getRoundSummary,
  getRoundsInRange,
} from "@/lib/queries";
import type { GameWithAggregates, Round, RoundSummary } from "@/types/database";

export interface RoundNavItem {
  roundNumber: number;
  name: string;
  isActive: boolean;
  submissionsOpen: boolean;
  href: string;
  isCurrent: boolean;
}

export interface RoundPageData {
  round: Round;
  games: GameWithAggregates[];
  summary: RoundSummary;
  activeRound: Round;
  defaultRoundNumber: number;
  submissionsOpen: boolean;
  submissionsCloseAt: Date | null;
  roundNavItems: RoundNavItem[];
}

export async function loadRoundPageData(
  roundNumber: number,
): Promise<RoundPageData | null> {
  const activeRound = await getActiveRound();
  if (!activeRound) return null;

  if (!isRoundViewable(roundNumber, activeRound.round_number)) {
    return null;
  }

  const round = await getRoundByNumber(activeRound.year, roundNumber);
  if (!round) return null;

  const deviceId = await getDeviceIdFromCookies();
  const [games, activeRoundGames, allRounds] = await Promise.all([
    getGamesWithAggregates(round.id, deviceId),
    getGamesForRound(activeRound.id),
    getRoundsInRange(
      activeRound.year,
      LAUNCH_ROUND_NUMBER,
      activeRound.round_number,
    ),
  ]);

  const defaultRoundNumber = getDefaultDisplayRoundNumber(
    activeRound,
    activeRoundGames,
  );
  const submissionsOpen = isRoundOpenForSubmissions(games);
  const submissionsCloseAt = getRoundSubmissionsCloseAt(games);
  const summary = await getRoundSummary(games);

  const gamesByRound = await Promise.all(
    allRounds.map(async (navRound) => ({
      roundNumber: navRound.round_number,
      games: await getGamesForRound(navRound.id),
    })),
  );
  const gamesByRoundNumber = new Map(
    gamesByRound.map(({ roundNumber: num, games: roundGames }) => [
      num,
      roundGames,
    ]),
  );

  const roundNavItems: RoundNavItem[] = allRounds.map((navRound) => ({
    roundNumber: navRound.round_number,
    name: navRound.name,
    isActive: navRound.is_active,
    submissionsOpen: isRoundOpenForSubmissions(
      gamesByRoundNumber.get(navRound.round_number) ?? [],
    ),
    href: getRoundHref(navRound.round_number, defaultRoundNumber),
    isCurrent: navRound.round_number === roundNumber,
  }));

  return {
    round,
    games,
    summary,
    activeRound,
    defaultRoundNumber,
    submissionsOpen,
    submissionsCloseAt,
    roundNavItems,
  };
}

export async function loadDefaultRoundPageData(): Promise<RoundPageData | null> {
  const activeRound = await getActiveRound();
  if (!activeRound) return null;

  const activeRoundGames = await getGamesForRound(activeRound.id);
  const defaultRoundNumber = getDefaultDisplayRoundNumber(
    activeRound,
    activeRoundGames,
  );

  return loadRoundPageData(defaultRoundNumber);
}
