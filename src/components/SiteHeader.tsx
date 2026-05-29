import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="space-y-0.5">
          <p className="text-lg font-bold tracking-tight">Footy Ratings</p>
          <p className="text-xs text-muted-foreground">AFL game ratings</p>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/about" className="text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
            Privacy
          </Link>
        </nav>
      </div>
    </header>
  );
}
