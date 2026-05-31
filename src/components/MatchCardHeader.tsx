import { MatchHeaderStatusRow } from "@/components/MatchHeaderStatusRow";
import { MatchScoreCenter } from "@/components/MatchScoreCenter";
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
  return (
    <div className={cn("@container/match-header flex w-full min-w-0 flex-col gap-5", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="truncate text-[15px] font-medium whitespace-nowrap text-[#757575]">
          {venue}
        </p>
        <p className="truncate text-[15px] font-medium whitespace-nowrap text-[#757575]">
          {formatGameKickoff(kickoffAt, status === "upcoming" || status === "live")}
        </p>
        <MatchHeaderStatusRow status={status} />
      </div>

      <div className="flex w-full min-w-0 items-center gap-1.5 @min-[400px]/match-header:gap-2">
        <TeamBlock team={homeTeam} />

        <MatchScoreCenter homeScore={homeScore} awayScore={awayScore} />

        <TeamBlock team={awayTeam} align="end" />
      </div>
    </div>
  );
}
