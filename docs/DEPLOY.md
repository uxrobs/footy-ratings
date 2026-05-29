# Deploying Footy Ratings to Vercel

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run [`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql).
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

## Unlocking the next round

When all games in Round 12 are complete:

```sql
update rounds set is_active = false where is_active = true;
update rounds set is_active = true, unlocked_at = now()
where year = 2026 and round_number = 13;
```

Then run `npm run seed` with `SEED_ROUND=13`, or call the sync endpoint after inserting the round row manually.
