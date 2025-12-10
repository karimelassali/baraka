-- Create the waitlist table
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  first_name text not null,
  last_name text not null,
  phone_number text not null,
  email text,
  country text not null,
  city text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected'))
);

-- Add a unique constraint on phone number to prevent duplicates
alter table public.waitlist add constraint waitlist_phone_number_key unique (phone_number);

-- Enable Row Level Security (RLS)
alter table public.waitlist enable row level security;

-- Create a policy to allow anyone to insert (registration)
create policy "Enable insert for everyone" on public.waitlist for insert with check (true);

-- Create a policy to allow admins to view all entries (adjust logic as needed for your admin auth)
-- For now, we are using service_role key in API, which bypasses RLS, so this is just for safety/future.
create policy "Enable read for service role only" on public.waitlist for select using (auth.role() = 'service_role');

-- Create a policy to allow admins to update (approval)
create policy "Enable update for service role only" on public.waitlist for update using (auth.role() = 'service_role');
