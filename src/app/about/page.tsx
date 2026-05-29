import { SiteHeader } from "@/components/SiteHeader";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-10 prose prose-neutral dark:prose-invert">
        <h1>About Footy Ratings</h1>
        <p>
          Footy Ratings is a crowd-sourced AFL game rating site. Rate upcoming games
          before kickoff, then rate them again after full time to see whether the
          community&apos;s expectations matched reality.
        </p>

        <h2>How it works</h2>
        <ol>
          <li>Pick a game in the current round.</li>
          <li>Before the bounce, submit an expectation rating out of 10.</li>
          <li>After full time, submit a reality rating for the same game.</li>
          <li>Compare the community average expectation with the community average reality.</li>
        </ol>

        <h2>Rating factors</h2>
        <p>
          You can optionally rate specific factors such as excitement, closeness,
          umpiring, skill level, atmosphere, and watchability. These help explain
          why a game over- or under-delivered.
        </p>

        <h2>Delta labels</h2>
        <ul>
          <li><strong>+1.5 or more:</strong> Massively over-delivered</li>
          <li><strong>+0.5 to +1.4:</strong> Better than expected</li>
          <li><strong>−0.5 to +0.5:</strong> Met expectations</li>
          <li><strong>−1.4 to −0.5:</strong> Underwhelmed</li>
          <li><strong>−1.5 or less:</strong> Total flop</li>
        </ul>

        <h2>Current round only</h2>
        <p>
          Footy Ratings focuses on the active AFL round so ratings stay timely and
          relevant. Once a round finishes, the next round is unlocked.
        </p>
      </main>
    </>
  );
}
