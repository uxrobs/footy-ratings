"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <BarChart3 className="size-5 text-primary" aria-hidden />
          <div className="space-y-0.5">
            <p className="text-xl font-semibold tracking-tight">Footy Ratings</p>
            <p className="text-xs text-muted-foreground">AFL game ratings</p>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground",
                pathname === link.href
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
