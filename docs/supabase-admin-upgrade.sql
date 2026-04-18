alter table public.profiles
add column if not exists role text not null default 'user'
check (role in ('user', 'admin'));

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

alter table public.recipes
add column if not exists is_hidden boolean not null default false;

alter table public.recipe_comments
add column if not exists is_hidden boolean not null default false;

alter table public.community_post_comments
add column if not exists is_hidden boolean not null default false;

drop policy if exists "admins can insert categories" on public.categories;
create policy "admins can insert categories"
on public.categories for insert to authenticated
with check (public.is_admin());

drop policy if exists "admins can update categories" on public.categories;
create policy "admins can update categories"
on public.categories for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete categories" on public.categories;
create policy "admins can delete categories"
on public.categories for delete to authenticated
using (public.is_admin());

drop policy if exists "admins can insert recipes" on public.recipes;
create policy "admins can insert recipes"
on public.recipes for insert to authenticated
with check (public.is_admin() and auth.uid() = author_id);

drop policy if exists "admins can update recipes" on public.recipes;
create policy "admins can update recipes"
on public.recipes for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete recipes" on public.recipes;
create policy "admins can delete recipes"
on public.recipes for delete to authenticated
using (public.is_admin());

drop policy if exists "admins can insert recipe ingredients" on public.recipe_ingredients;
create policy "admins can insert recipe ingredients"
on public.recipe_ingredients for insert to authenticated
with check (public.is_admin());

drop policy if exists "admins can update recipe ingredients" on public.recipe_ingredients;
create policy "admins can update recipe ingredients"
on public.recipe_ingredients for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete recipe ingredients" on public.recipe_ingredients;
create policy "admins can delete recipe ingredients"
on public.recipe_ingredients for delete to authenticated
using (public.is_admin());

drop policy if exists "admins can insert recipe steps" on public.recipe_steps;
create policy "admins can insert recipe steps"
on public.recipe_steps for insert to authenticated
with check (public.is_admin());

drop policy if exists "admins can update recipe steps" on public.recipe_steps;
create policy "admins can update recipe steps"
on public.recipe_steps for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete recipe steps" on public.recipe_steps;
create policy "admins can delete recipe steps"
on public.recipe_steps for delete to authenticated
using (public.is_admin());

drop policy if exists "admins can insert recipe tips" on public.recipe_tips;
create policy "admins can insert recipe tips"
on public.recipe_tips for insert to authenticated
with check (public.is_admin());

drop policy if exists "admins can update recipe tips" on public.recipe_tips;
create policy "admins can update recipe tips"
on public.recipe_tips for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete recipe tips" on public.recipe_tips;
create policy "admins can delete recipe tips"
on public.recipe_tips for delete to authenticated
using (public.is_admin());

drop policy if exists "admins can moderate recipe comments" on public.recipe_comments;
create policy "admins can moderate recipe comments"
on public.recipe_comments for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete any recipe comment" on public.recipe_comments;
create policy "admins can delete any recipe comment"
on public.recipe_comments for delete to authenticated
using (public.is_admin());

drop policy if exists "admins can moderate community comments" on public.community_post_comments;
create policy "admins can moderate community comments"
on public.community_post_comments for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete any community comment" on public.community_post_comments;
create policy "admins can delete any community comment"
on public.community_post_comments for delete to authenticated
using (public.is_admin());
