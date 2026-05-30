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
}

const VARIANT_STYLES: Record<GameButtonVariant, string> = {
  expectation: "bg-[#1e2a5a] hover:bg-[#1e2a5a]/90",
  reality: "bg-emerald-600 hover:bg-emerald-600/90",
  view: "bg-[#555555] hover:bg-[#555555]/90",
};

export function GameButton({ variant, label, className }: GameButtonProps) {
  const text = label ?? getGameButtonLabel(variant);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[8px] px-5 text-sm font-medium text-white transition-colors",
        VARIANT_STYLES[variant],
        className,
      )}
      style={{ height: GAME_BUTTON_HEIGHT }}
    >
      {text}
    </span>
  );
}
