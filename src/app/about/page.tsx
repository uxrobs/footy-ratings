import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl flex-1 space-y-6 px-4 py-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">About Footy Ratings</h1>
          <p className="text-sm text-muted-foreground">
            Unofficial fan site — not affiliated with the AFL or clubs.
          </p>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6 text-sm leading-relaxed">
            <p>
              Footy Ratings is a crowd-sourced AFL game rating site. Rate upcoming games
              before kickoff, then rate them again after full time to see whether the
              community&apos;s expectations matched reality.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How it works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ol className="list-decimal space-y-2 pl-5">
              <li>Pick a game in the current round.</li>
              <li>Before the bounce, submit an expectation rating out of 10.</li>
              <li>After full time, submit a reality rating for the same game.</li>
              <li>
                Compare the community average expectation with the community average
                reality.
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rating factors</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <p>
              You can optionally rate specific factors such as excitement, closeness,
              umpiring, skill level, atmosphere, and watchability. These help explain
              why a game over- or under-delivered.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delta labels</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ul className="space-y-2">
              <li>
                <strong>+1.5 or more:</strong> Massively over-delivered
              </li>
              <li>
                <strong>+0.5 to +1.4:</strong> Better than expected
              </li>
              <li>
                <strong>−0.5 to +0.5:</strong> Met expectations
              </li>
              <li>
                <strong>−1.4 to −0.5:</strong> Underwhelmed
              </li>
              <li>
                <strong>−1.5 or less:</strong> Total flop
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Round history</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <p>
              You can browse every round from Round 12 onward using the round picker on
              the home page. When a new round is seeded, the site may default to the
              round that just finished until the next round gets underway.
            </p>
            <p className="mt-3">
              Ratings and reviews stay open for 24 hours after the last game in a round
              finishes, then that round closes for new submissions. Scores and reviews
              remain visible after that.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
