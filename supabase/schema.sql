create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  source_name text,
  source_url text,
  prep_time text,
  cook_time text,
  total_time text,
  servings text,
  ingredients jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '[]'::jsonb,
  notes text,
  category text,
  favorite boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.recipes enable row level security;

drop policy if exists "Users can view their own recipes" on public.recipes;
create policy "Users can view their own recipes" on public.recipes
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can add their own recipes" on public.recipes;
create policy "Users can add their own recipes" on public.recipes
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own recipes" on public.recipes;
create policy "Users can update their own recipes" on public.recipes
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own recipes" on public.recipes;
create policy "Users can delete their own recipes" on public.recipes
for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists recipes_user_id_created_at_idx
on public.recipes (user_id, created_at desc);
