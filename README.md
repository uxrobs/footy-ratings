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

3. Create a Supabase project and run migrations in order:
   - [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
   - [`supabase/migrations/002_game_reviews.sql`](supabase/migrations/002_game_reviews.sql)
   - [`supabase/migrations/003_review_author_name.sql`](supabase/migrations/003_review_author_name.sql)

4. Seed the launch round (defaults to 2026 Round 12):

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

See [`docs/DEPLOY.md`](docs/DEPLOY.md) for the full checklist. Summary:

1. Push to GitHub and import the repo in Vercel.
2. Add env vars from `.env.example`.
3. Run migrations in Supabase, then `npm run seed` once after first deploy.
4. Fixtures sync automatically when someone visits the site (no Vercel cron required). Optional: set `CRON_SECRET` to protect `POST /api/sync/fixtures` for manual syncs.

## Round management

One round is active at a time for fixture sync. **Round changes are automatic by default** — when every game in the active round is complete, the next site visit triggers a Squiggle sync that seeds the next round.

- **Round picker:** browse Round 12 onward.
- **Homepage default:** shows the previous round when the newly seeded round has not started yet.
- **Submissions:** ratings and reviews close 24 hours after the last game in a round completes.

**First deploy only:** `npm run seed` (defaults to 2026 Round 12).

**Manual override** (skip or replace auto-advance): `SEED_ROUND=13 npm run seed`

**Disable auto-advance:** set `AUTO_ADVANCE_ROUNDS=false` in env vars.

## License

MIT
