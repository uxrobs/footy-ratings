# Deploying Footy Ratings to Vercel

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run migrations in order:
   - [`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql)
   - [`supabase/migrations/002_game_reviews.sql`](../supabase/migrations/002_game_reviews.sql)
   - [`supabase/migrations/003_review_author_name.sql`](../supabase/migrations/003_review_author_name.sql)
3. Copy your project URL, anon key, and service role key.

## 2. Seed Round 12 locally

```bash
cp .env.example .env.local
# Fill in Supabase keys
npm run seed
```

## 3. Vercel

1. Push this repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET` (random string)
4. Deploy.

## 4. Fixture sync (no Vercel cron required)

Fixtures sync **automatically when someone visits** the home page or a game page, at most once every 30 minutes (configurable via `SYNC_INTERVAL_MINUTES`).

This avoids Vercel’s free-tier limit of one cron job per day.

Optional: set `CRON_SECRET` and `POST /api/sync/fixtures` if you want to trigger a manual sync (e.g. from your laptop).

## 5. Soft launch

After deploy and seed:

1. Open the live URL and rate an upcoming Round 12 game.
2. Post to [r/AFL](https://www.reddit.com/r/AFL/) once the first completed game shows an expectation vs reality delta.

## Next round (automatic)

When every game in the active round is `complete`, the next sync (triggered by a site visit) will automatically seed the next round from Squiggle.

To turn this off, set `AUTO_ADVANCE_ROUNDS=false` in Vercel env vars.

Manual override:

```bash
SEED_ROUND=13 npm run seed
```
