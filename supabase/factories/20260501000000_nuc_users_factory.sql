drop function if exists public.factory_user_profile(integer);

create or replace function public.factory_user_profile(i integer)
returns table(
  name text,
  email text,
  language text,
  country text,
  role text,
  phone_number text,
  created_at timestamptz
)
language sql
as $$
  select
    format('User %s', i),
    format('user_%s@nucleify.local', i),
    (array['en', 'pl', 'vn'])[(i % 3) + 1],
    (array['poland', 'germany', 'france'])[(i % 3) + 1],
    (array['user', 'tech', 'test_admin'])[(i % 3) + 1],
    lpad(((500000000 + i) % 999999999)::text, 9, '0'),
    now() - ((i % 365) || ' days')::interval;
$$;
