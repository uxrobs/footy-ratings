import Link from "next/link";
import { DeltaBadge } from "@/components/DeltaBadge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatScore, getRatingPhaseForGame } from "@/lib/ratings";
import { cn } from "@/lib/utils";
import { getTeamAbbreviation, getTeamColors } from "@/lib/teams";
import type { GameWithAggregates } from "@/types/database";

interface GameCardProps {
  game: GameWithAggregates;
}

function formatKickoff(kickoffAt: string, status: GameWithAggregates["status"]) {
  const date = new Date(kickoffAt);
  if (status === "complete") {
    return date.toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }
  return date.toLocaleString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function GameCard({ game }: GameCardProps) {
  const phase = getRatingPhaseForGame(game.status);
  const userRating =
    phase === "expectation"
      ? game.user_expectation
      : phase === "reality"
        ? game.user_reality
        : null;

  const ctaLabel =
    userRating !== null
      ? "Edit your rating"
      : phase === "expectation"
        ? "Rate expectation"
        : phase === "reality"
          ? "Rate reality"
          : "View game";

  const homeColors = getTeamColors(game.home_team);
  const awayColors = getTeamColors(game.away_team);

  return (
    <Card className="overflow-hidden pt-0 transition-shadow hover:shadow-md">
      <div
        className="h-1 w-full shrink-0"
        style={{
          background: `linear-gradient(to right, ${homeColors.primary} 50%, ${awayColors.primary} 50%)`,
        }}
        aria-hidden
      />
      <CardHeader className="gap-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardDescription>{game.venue}</CardDescription>
            <CardTitle className="mt-1 text-xl">
              <span className="inline-flex items-center gap-2">
                <span
                  className="inline-flex size-9 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: homeColors.primary,
                    color: homeColors.text,
                  }}
                >
                  {getTeamAbbreviation(game.home_team)}
                </span>
                {game.home_team}
              </span>
              <span className="mx-2 text-muted-foreground">vs</span>
              <span className="inline-flex items-center gap-2">
                <span
                  className="inline-flex size-9 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: awayColors.primary,
                    color: awayColors.text,
                  }}
                >
                  {getTeamAbbreviation(game.away_team)}
                </span>
                {game.away_team}
              </span>
            </CardTitle>
          </div>
          <Badge variant={game.status === "complete" ? "default" : "secondary"}>
            {game.status === "complete" ? "Full time" : "Upcoming"}
          </Badge>
        </div>
        <CardDescription>{formatKickoff(game.kickoff_at, game.status)}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {game.status === "complete" && game.home_score !== null && game.away_score !== null && (
          <div
            className="rounded-lg px-4 py-3 text-center text-lg font-semibold"
            style={{
              background: `linear-gradient(to right, color-mix(in srgb, ${homeColors.primary} 12%, white), color-mix(in srgb, ${awayColors.primary} 12%, white))`,
            }}
          >
            {game.home_score} – {game.away_score}
            {game.margin !== null && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({game.margin} pt margin)
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground">Expected</p>
            <p className="text-2xl font-semibold">
              {formatScore(game.aggregates.expectation_avg)}
            </p>
            <p className="text-xs text-muted-foreground">
              {game.aggregates.expectation_count} votes
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground">Reality</p>
            <p className="text-2xl font-semibold">
              {formatScore(game.aggregates.reality_avg)}
            </p>
            <p className="text-xs text-muted-foreground">
              {game.aggregates.reality_count} votes
            </p>
          </div>
        </div>

        <DeltaBadge delta={game.aggregates.delta} />
      </CardContent>

      <CardFooter>
        <Link
          href={`/game/${game.id}`}
          className={cn(buttonVariants(), "w-full")}
        >
          {ctaLabel}
        </Link>
      </CardFooter>
    </Card>
  );
}
