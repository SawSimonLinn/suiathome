-- Add bio, social_links, and last_active_at to profiles
alter table profiles
  add column if not exists bio text,
  add column if not exists social_links jsonb default '[]'::jsonb,
  add column if not exists last_active_at timestamptz;
