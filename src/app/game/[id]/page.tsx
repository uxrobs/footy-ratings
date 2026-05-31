import Link from "next/link";
import { notFound } from "next/navigation";
import { DeltaBadge } from "@/components/DeltaBadge";
import { GameReviewForm } from "@/components/GameReviewForm";
import { MatchCardHeader } from "@/components/MatchCardHeader";
import { GameReviewsList } from "@/components/GameReviewsList";
import { RatingForm } from "@/components/RatingForm";
import { RoundPicker } from "@/components/RoundPicker";
import { ScoreDistributionChart } from "@/components/ScoreDistributionChart";
import { SetupRequiredPage } from "@/components/SetupRequiredPage";
import { SiteHeader } from "@/components/SiteHeader";
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
  canSubmitRating,
  formatDelta,
  formatScore,
  getRatingPhaseForGame,
} from "@/lib/ratings";
import { loadRoundPageData } from "@/lib/round-page";
import {
  getRoundHref,
  formatSubmissionsCloseAt,
  isRoundViewable,
} from "@/lib/rounds";
import {
  getActiveRound,
  getFactorAggregatesForGame,
  getGameById,
  getGamesForRound,
  getRatingFactors,
  getReviewsForGame,
  getRoundById,
  getScoreDistribution,
  getUserRatingsForGame,
  getUserReviewForGame,
} from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import { syncActiveRoundIfStale } from "@/lib/sync";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  if (!isSupabaseConfigured()) {
    return <SetupRequiredPage />;
  }

  try {
    await syncActiveRoundIfStale();
  } catch (error) {
    console.error("Fixture sync skipped:", error);
  }

  const { id } = await params;
  const game = await getGameById(id);
  if (!game) notFound();

  const [round, activeRound] = await Promise.all([
    getRoundById(game.round_id),
    getActiveRound(),
  ]);

  if (
    !round ||
    !activeRound ||
    !isRoundViewable(round.round_number, activeRound.round_number)
  ) {
    notFound();
  }

  const deviceId = await getDeviceIdFromCookies();
  const roundPageData = await loadRoundPageData(round.round_number);
  const roundGames = await getGamesForRound(round.id);
  const submissionsOpen = roundPageData?.submissionsOpen ?? false;
  const submissionsCloseAt = roundPageData?.submissionsCloseAt ?? null;

  const [
    factors,
    factorAggregates,
    distribution,
    userRatings,
    reviews,
    userReview,
  ] = await Promise.all([
    getRatingFactors(),
    getFactorAggregatesForGame(game.id),
    getScoreDistribution(game.id),
    deviceId ? getUserRatingsForGame(game.id, deviceId) : Promise.resolve(null),
    getReviewsForGame(game.id),
    deviceId ? getUserReviewForGame(game.id, deviceId) : Promise.resolve(null),
  ]);

  const aggregates =
    roundPageData?.games.find((item) => item.id === game.id)?.aggregates ?? {
      expectation_avg: null,
      reality_avg: null,
      expectation_count: 0,
      reality_count: 0,
      delta: null,
    };

  const activePhase = getRatingPhaseForGame(game.status);
  const canRate =
    activePhase !== null &&
    canSubmitRating(game, activePhase, roundGames);

  const closenessAggregate = factorAggregates.find(
    (factor) => factor.slug === "closeness",
  );

  const backHref = roundPageData
    ? getRoundHref(round.round_number, roundPageData.defaultRoundNumber)
    : "/";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {roundPageData && (
          <RoundPicker items={roundPageData.roundNavItems} className="mb-4" />
        )}

        <Link
          href={backHref}
          className={cn(buttonVariants({ variant: "ghost" }), "mb-4 -ml-2 inline-flex")}
        >
          ← Back to {round.name}
        </Link>

        {!submissionsOpen && submissionsCloseAt && (
          <p className="mb-4 text-sm text-muted-foreground">
            Submissions for this round closed on{" "}
            {formatSubmissionsCloseAt(submissionsCloseAt)}.
          </p>
        )}

        <div className="grid gap-6">
          <Card
            id="review-form"
            className="gap-4 overflow-hidden rounded-[10px] border-[#d7d7d7] py-4 shadow-none scroll-mt-8"
          >
            <CardHeader className="gap-4 px-4 pb-0">
              <MatchCardHeader
                venue={game.venue}
                kickoffAt={game.kickoff_at}
                status={game.status}
                homeTeam={game.home_team}
                awayTeam={game.away_team}
                homeScore={game.home_score}
                awayScore={game.away_score}
              />

              {game.status === "complete" && game.margin !== null && (
                <p className="text-center text-sm text-[#757575]">
                  {game.margin} pt margin
                </p>
              )}

              <DeltaBadge delta={aggregates.delta} />
            </CardHeader>
            <CardContent className="px-4">
              <GameReviewForm
                gameId={game.id}
                gameComplete={game.status === "complete"}
                submissionsOpen={submissionsOpen}
                userReview={userReview}
              />
            </CardContent>
          </Card>
          <Card className="rounded-[10px] border-[#d7d7d7] shadow-none">
            <CardHeader>
              <CardTitle>Community scores</CardTitle>
              <CardDescription>Expectation vs reality for this game</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-[#d7d7d7] p-3">
                <p className="text-sm text-[#757575]">Expected</p>
                <p className="text-3xl font-bold text-[#1d1d1d]">{formatScore(aggregates.expectation_avg)}</p>
                <p className="text-xs text-[#757575]">
                  {aggregates.expectation_count} votes
                </p>
              </div>
              <div className="rounded-lg border border-[#d7d7d7] p-3">
                <p className="text-sm text-[#757575]">Reality</p>
                <p className="text-3xl font-bold text-[#1d1d1d]">{formatScore(aggregates.reality_avg)}</p>
                <p className="text-xs text-[#757575]">
                  {aggregates.reality_count} votes
                </p>
              </div>
              <div className="rounded-lg border border-[#d7d7d7] p-3">
                <p className="text-sm text-[#757575]">Delta</p>
                <p className="text-3xl font-bold text-[#1d1d1d]">{formatDelta(aggregates.delta)}</p>
              </div>
            </CardContent>
          </Card>

          {canRate && activePhase && (
            <Card className="rounded-[10px] border-[#d7d7d7] shadow-none">
              <CardHeader>
                <CardTitle>
                  {activePhase === "expectation" ? "Rate your expectation" : "Rate the reality"}
                </CardTitle>
                <CardDescription>
                  One vote per device. You can update your rating until this round closes for
                  submissions.
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

          {!submissionsOpen && activePhase && !canRate && (
            <Card className="rounded-[10px] border-[#d7d7d7] shadow-none">
              <CardContent className="py-8 text-center text-[#757575]">
                This round is closed for new ratings and reviews.
              </CardContent>
            </Card>
          )}

          {game.status === "live" && (
            <Card className="rounded-[10px] border-[#d7d7d7] shadow-none">
              <CardContent className="py-8 text-center text-[#757575]">
                This game is live. Reality ratings open after full time.
              </CardContent>
            </Card>
          )}

          <Card className="rounded-[10px] border-[#d7d7d7] shadow-none">
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
            <Card className="rounded-[10px] border-[#d7d7d7] shadow-none">
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
              <Card className="rounded-[10px] border-[#d7d7d7] shadow-none">
                <CardHeader>
                  <CardTitle>Closeness vs margin</CardTitle>
                  <CardDescription>
                    Fans rated closeness {formatScore(closenessAggregate.reality_avg)}/10 while
                    the final margin was {game.margin} points.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

          <GameReviewsList reviews={reviews} userReviewId={userReview?.id ?? null} />
        </div>
      </main>
    </>
  );
}
