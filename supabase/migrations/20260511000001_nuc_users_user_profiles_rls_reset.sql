-- Fix 42P17: infinite recursion in policy for user_profiles (often from template
-- policies that subquery user_profiles). Drop every policy on the table, then
-- apply one non-self-referential permissive policy for authenticated clients.

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
  loop
    execute format('drop policy if exists %I on public.user_profiles', pol.policyname);
  end loop;
end $$;

alter table public.user_profiles enable row level security;

create policy "user_profiles_authenticated_all"
on public.user_profiles
for all
to authenticated
using (true)
with check (true);
