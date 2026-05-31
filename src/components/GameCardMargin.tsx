"use client";

import { useRoundScores } from "@/components/RoundScoresProvider";
import type { GameStatus } from "@/types/database";

interface GameCardMarginProps {
  status: GameStatus;
  margin: number | null;
}

export function GameCardMargin({ status, margin }: GameCardMarginProps) {
  const { scoresVisible } = useRoundScores();

  return (
    <p className="h-5 text-center text-sm leading-5 text-[#757575]">
      {status === "complete" && scoresVisible && margin !== null
        ? `${margin} pt margin`
        : "\u00a0"}
    </p>
  );
}
