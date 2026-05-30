import { cn } from "@/lib/utils";
import type { GameStatus } from "@/types/database";

const STATUS_STYLES: Record<
  GameStatus,
  { label: string; className: string }
> = {
  complete: {
    label: "FULL TIME",
    className: "bg-[#e61818]",
  },
  live: {
    label: "IN PLAY",
    className: "bg-[#1a9e46]",
  },
  upcoming: {
    label: "UPCOMING",
    className: "bg-[#757575]",
  },
};

interface GameStatusBadgeProps {
  status: GameStatus;
  className?: string;
}

export function GameStatusBadge({ status, className }: GameStatusBadgeProps) {
  const { label, className: statusClassName } = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex h-[21px] min-w-[74px] shrink-0 items-center justify-center rounded px-2 text-[12px] font-medium text-white uppercase",
        statusClassName,
        className,
      )}
    >
      {label}
    </span>
  );
}
