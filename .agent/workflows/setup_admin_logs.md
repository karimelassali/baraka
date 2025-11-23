---
description: Setup Admin Logs Database Table
---

To enable the detailed admin logs feature, you need to create the `admin_logs` table in your Supabase database.

1.  Go to your Supabase Dashboard -> SQL Editor.
2.  Run the following SQL query:

```sql
create table if not exists admin_logs (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references admin_users(id) on delete set null,
  action text not null,
  resource text not null,
  resource_id text,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for better performance
create index if not exists admin_logs_admin_id_idx on admin_logs(admin_id);
create index if not exists admin_logs_resource_idx on admin_logs(resource);
create index if not exists admin_logs_created_at_idx on admin_logs(created_at);

-- Enable RLS
alter table admin_logs enable row level security;

-- Create policy to allow admins to view logs
create policy "Admins can view logs"
  on admin_logs for select
  using (
    exists (
      select 1 from admin_users
      where admin_users.auth_id = auth.uid()
      and admin_users.is_active = true
    )
  );

-- Create policy to allow admins to insert logs (via server-side logic mostly, but good to have)
create policy "Admins can insert logs"
  on admin_logs for insert
  with check (
    exists (
      select 1 from admin_users
      where admin_users.auth_id = auth.uid()
      and admin_users.is_active = true
    )
  );
```
