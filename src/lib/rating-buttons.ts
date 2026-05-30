export type GameButtonVariant = "expectation" | "reality" | "view";

export const GAME_BUTTON_HEIGHT = 40;

const GAME_BUTTON_LABELS: Record<GameButtonVariant, string> = {
  expectation: "Rate expectation",
  reality: "Rate reality",
  view: "View game",
};

export function getGameButtonLabel(variant: GameButtonVariant): string {
  return GAME_BUTTON_LABELS[variant];
}

export function getGameButtonVariant(
  status: "upcoming" | "live" | "complete",
): GameButtonVariant {
  if (status === "upcoming") return "expectation";
  if (status === "complete") return "reality";
  return "view";
}
