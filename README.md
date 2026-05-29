# Footy Ratings

Crowd-sourced AFL game quality ratings. Rate games before kickoff (expectation) and after full time (reality), then see whether the hype matched reality.

## Stack

- Next.js 16 (App Router)
- Supabase (Postgres)
- Tailwind CSS + shadcn/ui
- [Squiggle API](https://api.squiggle.com.au/) for fixtures

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Create a Supabase project and run the migration in [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql).

4. Seed the active round (defaults to 2026 Round 12):

```bash
npm run seed
```

5. Start the dev server:

```bash
npm run dev
```

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run seed` — seed/sync active round from Squiggle
- `npm run sync` — refresh fixtures for the active round

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Add env vars from `.env.example`.
3. Set `CRON_SECRET` and configure Vercel Cron (see `vercel.json`).
4. Run `npm run seed` locally or via a one-off script after first deploy.

## Round management

Only one round is active at a time. To unlock the next round after the current round completes:

```sql
update rounds set is_active = false where is_active = true;
update rounds set is_active = true, unlocked_at = now()
where year = 2026 and round_number = 13;
```

Then run `npm run sync`.

## License

MIT
