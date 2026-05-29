import { Badge } from "@/components/ui/badge";
import { formatDelta, getDeltaLabel } from "@/lib/ratings";
import { cn } from "@/lib/utils";

interface DeltaBadgeProps {
  delta: number | null;
  className?: string;
}

export function DeltaBadge({ delta, className }: DeltaBadgeProps) {
  if (delta === null) {
    return (
      <Badge variant="secondary" className={className}>
        Awaiting both ratings
      </Badge>
    );
  }

  const info = getDeltaLabel(delta);
  if (!info) return null;

  return (
    <Badge
      className={cn(
        "font-medium",
        info.tone === "positive" && "bg-emerald-600 text-white hover:bg-emerald-600",
        info.tone === "negative" && "bg-rose-600 text-white hover:bg-rose-600",
        info.tone === "neutral" && "bg-slate-600 text-white hover:bg-slate-600",
        className,
      )}
    >
      {formatDelta(delta)} · {info.label}
    </Badge>
  );
}
