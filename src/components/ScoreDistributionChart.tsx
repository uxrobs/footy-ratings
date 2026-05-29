import type { ScoreDistribution } from "@/types/database";

interface ScoreDistributionChartProps {
  distribution: ScoreDistribution[];
}

export function ScoreDistributionChart({
  distribution,
}: ScoreDistributionChartProps) {
  const maxCount = Math.max(
    1,
    ...distribution.flatMap((row) => [row.expectation_count, row.reality_count]),
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[2rem_1fr_1fr] gap-2 text-xs font-medium text-muted-foreground">
        <span>Score</span>
        <span>Expectation</span>
        <span>Reality</span>
      </div>
      {distribution.map((row) => (
        <div key={row.score} className="grid grid-cols-[2rem_1fr_1fr] items-center gap-2">
          <span className="text-sm font-medium">{row.score}</span>
          <Bar count={row.expectation_count} max={maxCount} tone="expectation" />
          <Bar count={row.reality_count} max={maxCount} tone="reality" />
        </div>
      ))}
    </div>
  );
}

function Bar({
  count,
  max,
  tone,
}: {
  count: number;
  max: number;
  tone: "expectation" | "reality";
}) {
  const width = `${(count / max) * 100}%`;
  const color =
    tone === "expectation" ? "bg-blue-500" : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-muted">
        <div className={`h-2 rounded-full ${color}`} style={{ width }} />
      </div>
      <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">
        {count}
      </span>
    </div>
  );
}
