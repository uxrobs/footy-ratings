-- Footy Ratings initial schema

create type game_status as enum ('upcoming', 'live', 'complete');
create type rating_phase as enum ('expectation', 'reality');

create table rounds (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  round_number integer not null,
  name text not null,
  is_active boolean not null default false,
  unlocked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (year, round_number)
);

create table games (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds(id) on delete cascade,
  squiggle_id integer not null unique,
  home_team text not null,
  away_team text not null,
  venue text not null,
  kickoff_at timestamptz not null,
  status game_status not null default 'upcoming',
  home_score integer,
  away_score integer,
  margin integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index games_round_id_idx on games(round_id);
create index games_kickoff_at_idx on games(kickoff_at);

create table rating_factors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table ratings (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  device_id text not null,
  phase rating_phase not null,
  overall_score smallint not null check (overall_score between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_id, device_id, phase)
);

create index ratings_game_id_idx on ratings(game_id);
create index ratings_device_id_idx on ratings(device_id);

create table rating_factor_scores (
  id uuid primary key default gen_random_uuid(),
  rating_id uuid not null references ratings(id) on delete cascade,
  factor_id uuid not null references rating_factors(id) on delete cascade,
  score smallint not null check (score between 1 and 10),
  unique (rating_id, factor_id)
);

create index rating_factor_scores_rating_id_idx on rating_factor_scores(rating_id);

-- Seed rating factors
insert into rating_factors (slug, label, sort_order) values
  ('excitement', 'Excitement', 1),
  ('closeness', 'Closeness', 2),
  ('umpiring', 'Umpiring', 3),
  ('skill_level', 'Skill level', 4),
  ('atmosphere', 'Atmosphere', 5),
  ('watchability', 'Watchability', 6);

-- RLS: public read, service role write (handled via service key in API)
alter table rounds enable row level security;
alter table games enable row level security;
alter table rating_factors enable row level security;
alter table ratings enable row level security;
alter table rating_factor_scores enable row level security;

create policy "Public read rounds" on rounds for select using (true);
create policy "Public read games" on games for select using (true);
create policy "Public read rating_factors" on rating_factors for select using (true);
create policy "Public read ratings" on ratings for select using (true);
create policy "Public read rating_factor_scores" on rating_factor_scores for select using (true);
