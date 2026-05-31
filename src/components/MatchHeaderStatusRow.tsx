"use client";

import { GameStatusBadge } from "@/components/GameStatusBadge";
import { useRoundScores } from "@/components/RoundScoresProvider";
import type { GameStatus } from "@/types/database";

interface MatchHeaderStatusRowProps {
  status: GameStatus;
}

export function MatchHeaderStatusRow({ status }: MatchHeaderStatusRowProps) {
  const { scoresVisible, showScores } = useRoundScores();

  return (
    <div className="ml-auto flex shrink-0 items-center gap-2">
      {status === "complete" && !scoresVisible && (
        <button
          type="button"
          onClick={showScores}
          className="text-sm font-medium whitespace-nowrap text-[#757575] underline-offset-2 hover:text-[#1d1d1d] hover:underline"
        >
          Show scores
        </button>
      )}
      <GameStatusBadge status={status} />
    </div>
  );
}
