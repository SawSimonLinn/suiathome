create table if not exists public.community_post_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists community_post_views_post_id_idx
on public.community_post_views (post_id, created_at desc);

alter table public.community_post_views enable row level security;

drop policy if exists "community post views are viewable by everyone" on public.community_post_views;
create policy "community post views are viewable by everyone"
on public.community_post_views for select using (true);

drop policy if exists "community post views can be created by everyone" on public.community_post_views;
create policy "community post views can be created by everyone"
on public.community_post_views for insert with check (true);
