import Link from "next/link";

import { cn } from "@/lib/utils";
import type { RoundNavItem } from "@/lib/round-page";

interface RoundPickerProps {
  items: RoundNavItem[];
  className?: string;
}

export function RoundPicker({ items, className }: RoundPickerProps) {
  return (
    <nav
      aria-label="AFL rounds"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {items.map((item) => (
        <Link
          key={item.roundNumber}
          href={item.href}
          aria-current={item.isCurrent ? "page" : undefined}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-[8px] border px-3 text-sm font-medium transition-colors",
            item.isCurrent
              ? "border-primary bg-primary text-primary-foreground"
              : "border-[#d7d7d7] bg-background text-[#1d1d1d] hover:bg-muted",
          )}
        >
          <span>{item.name}</span>
          {item.isActive && !item.isCurrent && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              New
            </span>
          )}
          {!item.submissionsOpen && (
            <span className="text-[10px] font-normal uppercase tracking-wide opacity-70">
              Closed
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
