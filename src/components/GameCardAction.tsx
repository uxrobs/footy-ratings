"use client";

import Link from "next/link";
import { useState } from "react";

import { GameButton } from "@/components/GameButton";
import { getGameButtonVariant } from "@/lib/rating-buttons";
import { getRatingPhaseForGame } from "@/lib/ratings";
import type { GameWithAggregates } from "@/types/database";

interface GameCardActionProps {
  game: GameWithAggregates;
}

export function GameCardAction({ game }: GameCardActionProps) {
  const [navigating, setNavigating] = useState(false);
  const phase = getRatingPhaseForGame(game.status);
  const userRating =
    phase === "expectation"
      ? game.user_expectation
      : phase === "reality"
        ? game.user_reality
        : null;

  return (
    <Link
      href={`/game/${game.id}`}
      className="inline-flex shrink-0"
      onClick={() => setNavigating(true)}
      aria-busy={navigating}
    >
      <GameButton
        variant={getGameButtonVariant(game.status)}
        label={
          userRating !== null && phase
            ? `Edit your ${phase} rating`
            : undefined
        }
        loading={navigating}
      />
    </Link>
  );
}
