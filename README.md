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

- `npm run dev` — local development (Webpack; lower memory use than Turbopack on some machines)
- `npm run dev:turbo` — local development with Turbopack
- `npm run build` — production build
- `npm run seed` — seed/sync active round from Squiggle
- `npm run sync` — refresh fixtures for the active round

Set `SKIP_SYNC_IN_DEV=true` in `.env.local` to avoid Squiggle sync on every page load during dev; run `npm run sync` when you need fresh fixtures.

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Add env vars from `.env.example`.
3. Optionally set `SYNC_INTERVAL_MINUTES` (default `30`) and `CRON_SECRET` for manual sync only.
4. Run `npm run seed` locally or via a one-off script after first deploy.

## Round management

Only one round is active at a time (used for fixture sync). After the last game of a round finishes, the site auto-advances to the next round on the next fixture sync (when someone visits).

Users can browse Round 12 onward via the round picker. The homepage defaults to the previous round when the newly seeded round has not started yet. Ratings and reviews close 24 hours after the last game in a round completes.

Initial setup: `npm run seed` (defaults to 2026 Round 12).

Manual next round: `SEED_ROUND=13 npm run seed`

Disable auto-advance: set `AUTO_ADVANCE_ROUNDS=false`.

## License

MIT
