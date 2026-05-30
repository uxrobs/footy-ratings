import Link from "next/link";

import { GameButton } from "@/components/GameButton";
import { getGameButtonVariant } from "@/lib/rating-buttons";
import { getRatingPhaseForGame } from "@/lib/ratings";
import type { GameWithAggregates } from "@/types/database";

interface GameCardActionProps {
  game: GameWithAggregates;
}

export function GameCardAction({ game }: GameCardActionProps) {
  const phase = getRatingPhaseForGame(game.status);
  const userRating =
    phase === "expectation"
      ? game.user_expectation
      : phase === "reality"
        ? game.user_reality
        : null;

  return (
    <Link href={`/game/${game.id}`} className="inline-flex shrink-0">
      <GameButton
        variant={getGameButtonVariant(game.status)}
        label={
          userRating !== null && phase
            ? `Edit your ${phase} rating`
            : undefined
        }
      />
    </Link>
  );
}
