import { GameCard } from "@/components/GameCard";
import { MatchCardHeader } from "@/components/MatchCardHeader";
import { DeltaBadge } from "@/components/DeltaBadge";
import { RoundPicker } from "@/components/RoundPicker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { formatSubmissionsCloseAt } from "@/lib/rounds";
import { formatDelta, formatScore } from "@/lib/ratings";
import type { RoundPageData } from "@/lib/round-page";

interface RoundPageContentProps {
  data: RoundPageData;
}

export function RoundPageContent({ data }: RoundPageContentProps) {
  const {
    round,
    games,
    summary,
    activeRound,
    submissionsOpen,
    submissionsCloseAt,
    roundNavItems,
  } = data;

  const surprises = [...games]
    .filter((game) => game.aggregates.delta !== null)
    .sort(
      (a, b) =>
        Math.abs(b.aggregates.delta ?? 0) - Math.abs(a.aggregates.delta ?? 0),
    )
    .slice(0, 3);

  const isActiveRound = round.id === activeRound.id;

  return (
    <>
      <section className="mb-6 space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {isActiveRound ? "Current round" : "Previous round"}
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Footy Ratings — {round.name}
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Rate games before and after. See if the hype was real.
          </p>
          {!submissionsOpen && submissionsCloseAt && (
            <p className="text-sm text-muted-foreground">
              Submissions closed on {formatSubmissionsCloseAt(submissionsCloseAt)}.
              You can still browse scores and reviews.
            </p>
          )}
          {submissionsOpen && submissionsCloseAt && (
            <p className="text-sm text-muted-foreground">
              Submissions close {formatSubmissionsCloseAt(submissionsCloseAt)}.
            </p>
          )}
        </div>

        <RoundPicker items={roundNavItems} />
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
                  <p className="text-2xl font-semibold">
                    {formatDelta(summary.delta)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {surprises.length > 0 && (
        <section className="mb-10 rounded-2xl border border-primary/15 bg-gradient-to-br from-accent/70 via-accent/40 to-background p-5 shadow-sm md:p-6">
          <div className="mb-5 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Round highlights
            </p>
            <h2 className="text-lg font-semibold tracking-tight">
              Biggest surprises this round
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Where fan expectations and reality diverged the most.
            </p>
          </div>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,480px),1fr))]">
            {surprises.map((game, index) => (
              <article
                key={game.id}
                className="flex min-w-0 flex-col gap-3 rounded-xl border border-white/70 bg-card/85 px-4 py-4 shadow-sm backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold tabular-nums text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <MatchCardHeader
                      venue={game.venue}
                      kickoffAt={game.kickoff_at}
                      status={game.status}
                      homeTeam={game.home_team}
                      awayTeam={game.away_team}
                      homeScore={game.home_score}
                      awayScore={game.away_score}
                    />
                  </div>
                </div>
                <DeltaBadge delta={game.aggregates.delta} />
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          All games
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </>
  );
}
