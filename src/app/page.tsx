import { GameCard } from "@/components/GameCard";
import { MatchCardHeader } from "@/components/MatchCardHeader";
import { SetupRequiredPage } from "@/components/SetupRequiredPage";
import { SiteHeader } from "@/components/SiteHeader";
import { DeltaBadge } from "@/components/DeltaBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { formatDelta, formatScore } from "@/lib/ratings";
import {
  getActiveRound,
  getGamesWithAggregates,
  getRoundSummary,
} from "@/lib/queries";
import { getDeviceIdFromCookies } from "@/lib/device";
import { isSupabaseConfigured } from "@/lib/supabase";
import { syncActiveRoundIfStale } from "@/lib/sync";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    return <SetupRequiredPage />;
  }

  try {
    await syncActiveRoundIfStale();
  } catch (error) {
    console.error("Fixture sync skipped:", error);
  }

  const round = await getActiveRound();
  const deviceId = await getDeviceIdFromCookies();

  if (!round) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-2xl flex-1 flex-col justify-center px-4 py-16 text-center">
          <h1 className="text-3xl font-bold">Next round coming soon</h1>
          <p className="mt-4 text-muted-foreground">
            The current AFL round is being prepared. Check back shortly.
          </p>
        </main>
      </>
    );
  }

  const games = await getGamesWithAggregates(round.id, deviceId);
  const summary = await getRoundSummary(games);

  const surprises = [...games]
    .filter((game) => game.aggregates.delta !== null)
    .sort((a, b) => Math.abs(b.aggregates.delta ?? 0) - Math.abs(a.aggregates.delta ?? 0))
    .slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <section className="mb-8 space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Current round
          </p>
          <h1 className="text-4xl font-bold tracking-tight">Footy Ratings — {round.name}</h1>
          <p className="max-w-2xl text-muted-foreground">
            Rate games before and after. See if the hype was real.
          </p>
        </section>

        {summary.games_with_both_phases > 0 && (
          <section className="mb-8">
            <Card className="border-l-4 border-l-primary/30">
              <CardHeader className="pb-2">
                <CardDescription>Round summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Expected
                    </p>
                    <p className="text-2xl font-semibold">
                      {formatScore(summary.expectation_avg)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Delivered
                    </p>
                    <p className="text-2xl font-semibold">
                      {formatScore(summary.reality_avg)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Delta
                    </p>
                    <p className="text-2xl font-semibold">{formatDelta(summary.delta)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {surprises.length > 0 && (
          <section className="mb-8 space-y-3">
            <h2 className="text-lg font-semibold">Biggest surprises this round</h2>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,480px),1fr))]">
              {surprises.map((game) => (
                <Card key={game.id} className="min-w-0 w-full rounded-[10px] border-[#d7d7d7] shadow-none">
                  <CardHeader className="px-4 pb-2">
                    <MatchCardHeader
                      venue={game.venue}
                      kickoffAt={game.kickoff_at}
                      status={game.status}
                      homeTeam={game.home_team}
                      awayTeam={game.away_team}
                      homeScore={game.home_score}
                      awayScore={game.away_score}
                    />
                  </CardHeader>
                  <CardContent className="px-4">
                    <DeltaBadge delta={game.aggregates.delta} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </section>
      </main>
    </>
  );
}
