import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SetupRequiredPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-2xl flex-1 flex-col justify-center px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Setup required</h1>
        <p className="mt-4 text-muted-foreground">
          Footy Ratings needs a Supabase database before it can load fixtures and
          ratings. Add your environment variables, run the migration, then seed Round
          12.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Copy <code className="rounded bg-muted px-1">.env.example</code> to <code className="rounded bg-muted px-1">.env.local</code></li>
          <li>Run the SQL in <code className="rounded bg-muted px-1">supabase/migrations/001_initial_schema.sql</code></li>
          <li>Run <code className="rounded bg-muted px-1">npm run seed</code></li>
        </ol>
        <Link href="/about" className={cn(buttonVariants(), "mt-8 w-fit")}>
          Read how it works
        </Link>
      </main>
    </>
  );
}
