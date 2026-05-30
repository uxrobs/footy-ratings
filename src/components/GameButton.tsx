import {
  GAME_BUTTON_HEIGHT,
  getGameButtonLabel,
  type GameButtonVariant,
} from "@/lib/rating-buttons";
import { cn } from "@/lib/utils";

interface GameButtonProps {
  variant: GameButtonVariant;
  label?: string;
  className?: string;
  loading?: boolean;
}

const VARIANT_STYLES: Record<GameButtonVariant, string> = {
  expectation: "bg-[#1e2a5a] hover:bg-[#1e2a5a]/90",
  reality: "bg-emerald-600 hover:bg-emerald-600/90",
  view: "bg-[#555555] hover:bg-[#555555]/90",
};

export function GameButton({
  variant,
  label,
  className,
  loading = false,
}: GameButtonProps) {
  const text = label ?? getGameButtonLabel(variant);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-[8px] px-5 text-sm font-medium text-white transition-colors",
        VARIANT_STYLES[variant],
        loading && "opacity-95",
        className,
      )}
      style={{ height: GAME_BUTTON_HEIGHT }}
      aria-busy={loading}
    >
      {loading && (
        <span
          className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-white/25 border-t-white"
          aria-hidden
        />
      )}
      {text}
    </span>
  );
}
