-- Display name on reviews

alter table game_reviews
  add column if not exists author_name text;

update game_reviews
set author_name = 'Anonymous'
where author_name is null or trim(author_name) = '';

alter table game_reviews
  alter column author_name set not null;

alter table game_reviews
  drop constraint if exists game_reviews_author_name_length;

alter table game_reviews
  add constraint game_reviews_author_name_length
  check (char_length(trim(author_name)) >= 1 and char_length(author_name) <= 40);
