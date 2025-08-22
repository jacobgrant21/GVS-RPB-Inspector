create extension if not exists pgcrypto;
create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  customer jsonb not null default '{}'::jsonb,
  distributor jsonb not null default '{}'::jsonb,
  prelim_notes text,
  status text not null default 'Completed',
  created_at timestamp with time zone default now()
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references public.inspections(id) on delete cascade,
  task_name text not null,
  category text,
  hazard_type text,
  product_brand text,
  product_part_number text,
  product_description text,
  issue text,
  photo_url text,
  created_at timestamp with time zone default now()
);

alter table public.inspections enable row level security;
alter table public.assessments enable row level security;

create policy "select own inspections" on public.inspections
for select using (auth.uid() = user_id);
create policy "insert own inspections" on public.inspections
for insert with check (auth.uid() = user_id);
create policy "update own inspections" on public.inspections
for update using (auth.uid() = user_id);
create policy "delete own inspections" on public.inspections
for delete using (auth.uid() = user_id);

create policy "select assessments via parent" on public.assessments
for select using (exists (select 1 from public.inspections i where i.id = inspection_id and i.user_id = auth.uid()));
create policy "insert assessments via parent" on public.assessments
for insert with check (exists (select 1 from public.inspections i where i.id = inspection_id and i.user_id = auth.uid()));
create policy "update assessments via parent" on public.assessments
for update using (exists (select 1 from public.inspections i where i.id = inspection_id and i.user_id = auth.uid()));
create policy "delete assessments via parent" on public.assessments
for delete using (exists (select 1 from public.inspections i where i.id = inspection_id and i.user_id = auth.uid()));
