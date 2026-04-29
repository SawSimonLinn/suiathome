create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create table if not exists public.recipe_images (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  url text not null check (char_length(trim(url)) > 0),
  position integer not null,
  created_at timestamptz not null default now(),
  unique (recipe_id, position)
);

create index if not exists recipe_images_recipe_id_position_idx
on public.recipe_images (recipe_id, position);

alter table public.recipe_images enable row level security;

drop policy if exists "recipe images are viewable by everyone" on public.recipe_images;
create policy "recipe images are viewable by everyone"
on public.recipe_images for select
using (true);

drop policy if exists "admins can insert recipe images" on public.recipe_images;
create policy "admins can insert recipe images"
on public.recipe_images for insert to authenticated
with check (public.is_admin());

drop policy if exists "admins can update recipe images" on public.recipe_images;
create policy "admins can update recipe images"
on public.recipe_images for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete recipe images" on public.recipe_images;
create policy "admins can delete recipe images"
on public.recipe_images for delete to authenticated
using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

drop policy if exists "recipe images are publicly readable" on storage.objects;
create policy "recipe images are publicly readable"
on storage.objects for select
using (bucket_id = 'recipe-images');

drop policy if exists "authenticated users can upload recipe images" on storage.objects;
drop policy if exists "users can update their own recipe images" on storage.objects;
drop policy if exists "users can delete their own recipe images" on storage.objects;

drop policy if exists "admins can upload recipe images" on storage.objects;
create policy "admins can upload recipe images"
on storage.objects for insert to authenticated
with check (bucket_id = 'recipe-images' and public.is_admin());

drop policy if exists "admins can update recipe images" on storage.objects;
create policy "admins can update recipe images"
on storage.objects for update to authenticated
using (bucket_id = 'recipe-images' and public.is_admin())
with check (bucket_id = 'recipe-images' and public.is_admin());

drop policy if exists "admins can delete recipe images" on storage.objects;
create policy "admins can delete recipe images"
on storage.objects for delete to authenticated
using (bucket_id = 'recipe-images' and public.is_admin());
