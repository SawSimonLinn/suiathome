create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  slug text not null unique,
  title text not null,
  description text not null,
  story text not null,
  image_url text,
  image_hint text,
  prep_time text not null,
  cook_time text not null,
  servings integer not null check (servings > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  position integer not null,
  quantity text not null,
  name text not null,
  unique (recipe_id, position)
);

create table if not exists public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  position integer not null,
  body text not null,
  unique (recipe_id, position)
);

create table if not exists public.recipe_tips (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  position integer not null,
  body text not null,
  unique (recipe_id, position)
);

create table if not exists public.recipe_comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.recipe_likes (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (recipe_id, user_id)
);

create table if not exists public.recipe_saves (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (recipe_id, user_id)
);

create table if not exists public.recipe_favorites (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (recipe_id, user_id)
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  linked_recipe_id uuid references public.recipes(id) on delete set null,
  caption text not null check (char_length(trim(caption)) > 0),
  image_path text,
  image_hint text,
  created_at timestamptz not null default now()
);

create table if not exists public.community_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.community_post_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists recipes_created_at_idx on public.recipes (created_at desc);
create index if not exists recipes_author_id_idx on public.recipes (author_id);
create index if not exists recipes_category_id_idx on public.recipes (category_id);
create index if not exists recipe_comments_recipe_id_idx on public.recipe_comments (recipe_id, created_at desc);
create index if not exists community_posts_created_at_idx on public.community_posts (created_at desc);
create index if not exists community_posts_recipe_id_idx on public.community_posts (linked_recipe_id);
create index if not exists community_post_comments_post_id_idx on public.community_post_comments (post_id, created_at desc);

alter table public.categories enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;
alter table public.recipe_tips enable row level security;
alter table public.recipe_comments enable row level security;
alter table public.recipe_likes enable row level security;
alter table public.recipe_saves enable row level security;
alter table public.recipe_favorites enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_post_comments enable row level security;
alter table public.community_post_likes enable row level security;

drop policy if exists "categories are viewable by everyone" on public.categories;
create policy "categories are viewable by everyone"
on public.categories for select using (true);

drop policy if exists "recipes are viewable by everyone" on public.recipes;
create policy "recipes are viewable by everyone"
on public.recipes for select using (true);

drop policy if exists "recipe ingredients are viewable by everyone" on public.recipe_ingredients;
create policy "recipe ingredients are viewable by everyone"
on public.recipe_ingredients for select using (true);

drop policy if exists "recipe steps are viewable by everyone" on public.recipe_steps;
create policy "recipe steps are viewable by everyone"
on public.recipe_steps for select using (true);

drop policy if exists "recipe tips are viewable by everyone" on public.recipe_tips;
create policy "recipe tips are viewable by everyone"
on public.recipe_tips for select using (true);

drop policy if exists "recipe comments are viewable by everyone" on public.recipe_comments;
create policy "recipe comments are viewable by everyone"
on public.recipe_comments for select using (true);

drop policy if exists "users can insert their own recipe comments" on public.recipe_comments;
create policy "users can insert their own recipe comments"
on public.recipe_comments for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update their own recipe comments" on public.recipe_comments;
create policy "users can update their own recipe comments"
on public.recipe_comments for update to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can delete their own recipe comments" on public.recipe_comments;
create policy "users can delete their own recipe comments"
on public.recipe_comments for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "recipe likes are viewable by everyone" on public.recipe_likes;
create policy "recipe likes are viewable by everyone"
on public.recipe_likes for select using (true);

drop policy if exists "users can like recipes for themselves" on public.recipe_likes;
create policy "users can like recipes for themselves"
on public.recipe_likes for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can remove their own recipe likes" on public.recipe_likes;
create policy "users can remove their own recipe likes"
on public.recipe_likes for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "recipe saves are viewable by everyone" on public.recipe_saves;
create policy "recipe saves are viewable by everyone"
on public.recipe_saves for select using (true);

drop policy if exists "users can save recipes for themselves" on public.recipe_saves;
create policy "users can save recipes for themselves"
on public.recipe_saves for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can remove their own recipe saves" on public.recipe_saves;
create policy "users can remove their own recipe saves"
on public.recipe_saves for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "recipe favorites are viewable by everyone" on public.recipe_favorites;
create policy "recipe favorites are viewable by everyone"
on public.recipe_favorites for select using (true);

drop policy if exists "users can favorite recipes for themselves" on public.recipe_favorites;
create policy "users can favorite recipes for themselves"
on public.recipe_favorites for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can remove their own recipe favorites" on public.recipe_favorites;
create policy "users can remove their own recipe favorites"
on public.recipe_favorites for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "community posts are viewable by everyone" on public.community_posts;
create policy "community posts are viewable by everyone"
on public.community_posts for select using (true);

drop policy if exists "users can create their own community posts" on public.community_posts;
create policy "users can create their own community posts"
on public.community_posts for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update their own community posts" on public.community_posts;
create policy "users can update their own community posts"
on public.community_posts for update to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can delete their own community posts" on public.community_posts;
create policy "users can delete their own community posts"
on public.community_posts for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "community post comments are viewable by everyone" on public.community_post_comments;
create policy "community post comments are viewable by everyone"
on public.community_post_comments for select using (true);

drop policy if exists "users can insert their own community post comments" on public.community_post_comments;
create policy "users can insert their own community post comments"
on public.community_post_comments for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update their own community post comments" on public.community_post_comments;
create policy "users can update their own community post comments"
on public.community_post_comments for update to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can delete their own community post comments" on public.community_post_comments;
create policy "users can delete their own community post comments"
on public.community_post_comments for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "community post likes are viewable by everyone" on public.community_post_likes;
create policy "community post likes are viewable by everyone"
on public.community_post_likes for select using (true);

drop policy if exists "users can like community posts for themselves" on public.community_post_likes;
create policy "users can like community posts for themselves"
on public.community_post_likes for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can remove their own community post likes" on public.community_post_likes;
create policy "users can remove their own community post likes"
on public.community_post_likes for delete to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('community-images', 'community-images', true)
on conflict (id) do nothing;

drop policy if exists "community images are publicly readable" on storage.objects;
create policy "community images are publicly readable"
on storage.objects for select
using (bucket_id = 'community-images');

drop policy if exists "authenticated users can upload community images" on storage.objects;
create policy "authenticated users can upload community images"
on storage.objects for insert to authenticated
with check (bucket_id = 'community-images');

drop policy if exists "users can update their own community images" on storage.objects;
create policy "users can update their own community images"
on storage.objects for update to authenticated
using (bucket_id = 'community-images' and owner = auth.uid());

drop policy if exists "users can delete their own community images" on storage.objects;
create policy "users can delete their own community images"
on storage.objects for delete to authenticated
using (bucket_id = 'community-images' and owner = auth.uid());
