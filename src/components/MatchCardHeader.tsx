import { GameStatusBadge } from "@/components/GameStatusBadge";
import { TeamAvatar } from "@/components/TeamAvatar";
import { formatGameKickoff } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { GameStatus } from "@/types/database";

interface MatchCardHeaderProps {
  venue: string;
  kickoffAt: string;
  status: GameStatus;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number | null;
  awayScore?: number | null;
  className?: string;
}

function MatchScore({
  homeScore,
  awayScore,
}: {
  homeScore: number;
  awayScore: number;
}) {
  const homeWon = homeScore > awayScore;
  const awayWon = awayScore > homeScore;

  return (
    <p className="text-center text-base font-medium whitespace-nowrap text-[#8c8c8c] @min-[560px]/match-header:text-[19px]">
      <span className={cn(homeWon && "font-bold text-[#010101]")}>{homeScore}</span>
      <span className="mx-1">vs</span>
      <span className={cn(awayWon && "font-bold text-[#010101]")}>{awayScore}</span>
    </p>
  );
}

function TeamBlock({
  team,
  align = "start",
}: {
  team: string;
  align?: "start" | "end";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2.5",
        align === "end" && "justify-end",
      )}
    >
      <TeamAvatar team={team} />
      <p
        className={cn(
          "min-w-0 truncate text-[15px] leading-none font-medium whitespace-nowrap text-[#1d1d1d]",
          "@min-[560px]/match-header:text-[17px] @min-[700px]/match-header:text-[22px]",
        )}
      >
        {team}
      </p>
    </div>
  );
}

export function MatchCardHeader({
  venue,
  kickoffAt,
  status,
  homeTeam,
  awayTeam,
  homeScore = null,
  awayScore = null,
  className,
}: MatchCardHeaderProps) {
  const hasScores = homeScore !== null && awayScore !== null;

  return (
    <div className={cn("@container/match-header flex w-full min-w-0 flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="truncate text-[15px] font-medium whitespace-nowrap text-[#757575]">
          {venue}
        </p>
        <p className="truncate text-[15px] font-medium whitespace-nowrap text-[#757575]">
          {formatGameKickoff(kickoffAt, status === "upcoming" || status === "live")}
        </p>
        <GameStatusBadge status={status} className="ml-auto shrink-0" />
      </div>

      <div className="flex w-full min-w-0 items-center gap-1.5 @min-[400px]/match-header:gap-2">
        <TeamBlock team={homeTeam} />

        <div className="shrink-0 px-0.5">
          {hasScores ? (
            <MatchScore homeScore={homeScore} awayScore={awayScore} />
          ) : (
            <p className="text-base font-medium whitespace-nowrap text-[#8c8c8c] @min-[560px]/match-header:text-[19px]">
              vs
            </p>
          )}
        </div>

        <TeamBlock team={awayTeam} align="end" />
      </div>
    </div>
  );
}
