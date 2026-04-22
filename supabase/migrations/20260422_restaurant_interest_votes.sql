create table if not exists restaurant_interest_votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null unique,
  location text not null check (location in ('Los Angeles', 'Washington DC', 'Texas', 'Other')),
  suggestion text,
  created_at timestamp with time zone default now()
);

alter table restaurant_interest_votes enable row level security;

create policy "Authenticated users can vote once"
  on restaurant_interest_votes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Anyone can read vote counts"
  on restaurant_interest_votes for select
  using (true);
