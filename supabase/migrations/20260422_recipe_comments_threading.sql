alter table public.recipe_comments
  add column if not exists parent_id uuid references public.recipe_comments(id) on delete cascade,
  add column if not exists is_pinned boolean not null default false;

create index if not exists recipe_comments_parent_id_idx on public.recipe_comments (parent_id);
