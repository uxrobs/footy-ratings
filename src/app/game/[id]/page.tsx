import Link from "next/link";
import { notFound } from "next/navigation";
import { DeltaBadge } from "@/components/DeltaBadge";
import { RatingForm } from "@/components/RatingForm";
import { ScoreDistributionChart } from "@/components/ScoreDistributionChart";
import { SetupRequiredPage } from "@/components/SetupRequiredPage";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDeviceIdFromCookies } from "@/lib/device";
import {
  canRatePhase,
  formatDelta,
  formatScore,
  getRatingPhaseForGame,
} from "@/lib/ratings";
import {
  getActiveRound,
  getFactorAggregatesForGame,
  getGameById,
  getGamesWithAggregates,
  getRatingFactors,
  getScoreDistribution,
  getUserRatingsForGame,
} from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getTeamAbbreviation, getTeamColors } from "@/lib/teams";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  if (!isSupabaseConfigured()) {
    return <SetupRequiredPage />;
  }

  const { id } = await params;
  const game = await getGameById(id);
  if (!game) notFound();

  const round = await getActiveRound();
  if (!round || game.round_id !== round.id) {
    notFound();
  }

  const deviceId = await getDeviceIdFromCookies();
  const [gamesWithAggregates, factors, factorAggregates, distribution, userRatings] =
    await Promise.all([
      getGamesWithAggregates(round.id, deviceId),
      getRatingFactors(),
      getFactorAggregatesForGame(game.id),
      getScoreDistribution(game.id),
      deviceId ? getUserRatingsForGame(game.id, deviceId) : Promise.resolve(null),
    ]);

  const enrichedGame = gamesWithAggregates.find((item) => item.id === game.id);
  const aggregates = enrichedGame?.aggregates ?? {
    expectation_avg: null,
    reality_avg: null,
    expectation_count: 0,
    reality_count: 0,
    delta: null,
  };

  const activePhase = getRatingPhaseForGame(game.status);
  const homeColors = getTeamColors(game.home_team);
  const awayColors = getTeamColors(game.away_team);

  const closenessAggregate = factorAggregates.find(
    (factor) => factor.slug === "closeness",
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost" }), "mb-4 -ml-2 inline-flex")}
        >
          ← Back to {round.name}
        </Link>

        <section className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={game.status === "complete" ? "default" : "secondary"}>
              {game.status === "complete" ? "Full time" : "Upcoming"}
            </Badge>
            <Badge variant="outline">{game.venue}</Badge>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            {game.home_team} vs {game.away_team}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium"
              style={{ backgroundColor: homeColors.primary, color: homeColors.text }}
            >
              {getTeamAbbreviation(game.home_team)} {game.home_team}
            </span>
            <span className="text-muted-foreground">vs</span>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium"
              style={{ backgroundColor: awayColors.primary, color: awayColors.text }}
            >
              {getTeamAbbreviation(game.away_team)} {game.away_team}
            </span>
          </div>

          {game.status === "complete" && game.home_score !== null && game.away_score !== null && (
            <p className="text-2xl font-semibold">
              Final: {game.home_score} – {game.away_score}
              {game.margin !== null && (
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ({game.margin} pt margin)
                </span>
              )}
            </p>
          )}

          <DeltaBadge delta={aggregates.delta} />
        </section>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Community scores</CardTitle>
              <CardDescription>Expectation vs reality for this game</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Expected</p>
                <p className="text-3xl font-bold">{formatScore(aggregates.expectation_avg)}</p>
                <p className="text-xs text-muted-foreground">
                  {aggregates.expectation_count} votes
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reality</p>
                <p className="text-3xl font-bold">{formatScore(aggregates.reality_avg)}</p>
                <p className="text-xs text-muted-foreground">
                  {aggregates.reality_count} votes
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delta</p>
                <p className="text-3xl font-bold">{formatDelta(aggregates.delta)}</p>
              </div>
            </CardContent>
          </Card>

          {activePhase && canRatePhase(game.status, activePhase) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {activePhase === "expectation" ? "Rate your expectation" : "Rate the reality"}
                </CardTitle>
                <CardDescription>
                  One vote per device. You can update your rating anytime during this phase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RatingForm
                  gameId={game.id}
                  phase={activePhase}
                  factors={factors}
                  existingRating={
                    activePhase === "expectation"
                      ? userRatings?.expectation
                      : userRatings?.reality
                  }
                />
              </CardContent>
            </Card>
          )}

          {game.status === "live" && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                This game is live. Reality ratings open after full time.
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Score distribution</CardTitle>
              <CardDescription>How fans rated this game out of 10</CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreDistributionChart distribution={distribution} />
            </CardContent>
          </Card>

          {factorAggregates.some(
            (factor) => factor.expectation_avg !== null || factor.reality_avg !== null,
          ) && (
            <Card>
              <CardHeader>
                <CardTitle>Factor breakdown</CardTitle>
                <CardDescription>Optional detailed ratings from the community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {factorAggregates.map((factor) => (
                  <div key={factor.factor_id}>
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium">{factor.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatScore(factor.expectation_avg)} →{" "}
                        {formatScore(factor.reality_avg)}
                        {factor.delta !== null && (
                          <span className="ml-2">({formatDelta(factor.delta)})</span>
                        )}
                      </p>
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {game.status === "complete" &&
            closenessAggregate &&
            closenessAggregate.reality_avg !== null &&
            game.margin !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>Closeness vs margin</CardTitle>
                  <CardDescription>
                    Fans rated closeness {formatScore(closenessAggregate.reality_avg)}/10 while
                    the final margin was {game.margin} points.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
        </div>
      </main>
    </>
  );
}
