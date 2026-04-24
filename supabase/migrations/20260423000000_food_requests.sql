-- Food requests table: users can ask for food to be added to the site
create table if not exists public.food_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  user_email text,
  food_name text not null,
  country text not null,
  photo_url text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'completed')),
  created_at timestamptz default now() not null
);

alter table public.food_requests enable row level security;

create policy "Users can insert their own food requests"
  on public.food_requests for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own food requests"
  on public.food_requests for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all food requests"
  on public.food_requests for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update food requests"
  on public.food_requests for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Storage bucket for optional food request photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'food-request-photos',
  'food-request-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
) on conflict (id) do nothing;

create policy "Authenticated users can upload food request photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'food-request-photos');

create policy "Anyone can view food request photos"
  on storage.objects for select
  to public
  using (bucket_id = 'food-request-photos');
