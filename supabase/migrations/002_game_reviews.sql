-- Text reviews left after full time (one per device per game)

create table game_reviews (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  device_id text not null,
  author_name text not null check (char_length(trim(author_name)) >= 1 and char_length(author_name) <= 40),
  body text not null check (char_length(trim(body)) >= 1 and char_length(body) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_id, device_id)
);

create index game_reviews_game_id_idx on game_reviews(game_id);
create index game_reviews_created_at_idx on game_reviews(game_id, created_at desc);

alter table game_reviews enable row level security;

create policy "Public read game_reviews" on game_reviews for select using (true);
