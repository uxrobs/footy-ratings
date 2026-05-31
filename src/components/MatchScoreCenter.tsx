"use client";

import { useRoundScores } from "@/components/RoundScoresProvider";
import { cn } from "@/lib/utils";

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

interface MatchScoreCenterProps {
  homeScore?: number | null;
  awayScore?: number | null;
}

export function MatchScoreCenter({
  homeScore = null,
  awayScore = null,
}: MatchScoreCenterProps) {
  const { scoresVisible } = useRoundScores();
  const hasScores = homeScore !== null && awayScore !== null;

  return (
    <div className="shrink-0 px-0.5">
      {scoresVisible && hasScores ? (
        <MatchScore homeScore={homeScore} awayScore={awayScore} />
      ) : (
        <p className="text-base font-medium whitespace-nowrap text-[#8c8c8c] @min-[560px]/match-header:text-[19px]">
          vs
        </p>
      )}
    </div>
  );
}
