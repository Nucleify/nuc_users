create extension if not exists "pgcrypto";

begin;

alter table public.user_profiles add column if not exists name text not null default '';
alter table public.user_profiles add column if not exists email text not null default '';
alter table public.user_profiles add column if not exists phone_number text;
alter table public.user_profiles add column if not exists avatar text;
alter table public.user_profiles add column if not exists language text not null default 'en';
alter table public.user_profiles add column if not exists country text not null default 'poland';
alter table public.user_profiles add column if not exists role text not null default 'user';
alter table public.user_profiles add column if not exists bio text;
alter table public.user_profiles add column if not exists website text;
alter table public.user_profiles add column if not exists created_at timestamptz not null default now();
alter table public.user_profiles add column if not exists updated_at timestamptz not null default now();

delete from public.user_profiles
where email in (
  's.radomski19@gmail.com',
  'admin@nucleify.io',
  'test_admin@nucleify.io',
  'test_admin2@nucleify.io',
  'test_tech@nucleify.io',
  'test_user@nucleify.io'
)
or email like 'user\_%@nucleify.factory.local' escape '\';

delete from auth.users
where email in (
  's.radomski19@gmail.com',
  'admin@nucleify.io',
  'test_admin@nucleify.io',
  'test_admin2@nucleify.io',
  'test_tech@nucleify.io',
  'test_user@nucleify.io'
)
or email like 'user\_%@nucleify.factory.local' escape '\';

-- Fixed UUIDs (stable across reseeds) — same order as Laravel ids 1–6
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new,
  email_change_token_current,
  reauthentication_token,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    's.radomski19@gmail.com',
    crypt('password', gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Szymon Radomski"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@nucleify.io',
    crypt('password', gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Admin"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'test_admin@nucleify.io',
    crypt('test_admin123', gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Test Admin"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'test_admin2@nucleify.io',
    crypt('test_admin2123', gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Test Admin 2"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'test_tech@nucleify.io',
    crypt('test_tech123', gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Test Tech"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'test_user@nucleify.io',
    crypt('test_user123', gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Test User"}'::jsonb,
    now(),
    now()
  );

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  u.email::text,
  now(),
  now(),
  now()
from auth.users u
where u.email in (
  's.radomski19@gmail.com',
  'admin@nucleify.io',
  'test_admin@nucleify.io',
  'test_admin2@nucleify.io',
  'test_tech@nucleify.io',
  'test_user@nucleify.io'
);

insert into public.user_profiles (
  id,
  name,
  email,
  language,
  country,
  role,
  phone_number,
  created_at,
  updated_at
)
values
  ('00000000-0000-4000-8000-000000000001', 'Szymon Radomski', 's.radomski19@gmail.com', 'en', 'poland', 'super_admin', null, now(), now()),
  ('00000000-0000-4000-8000-000000000002', 'Admin', 'admin@nucleify.io', 'en', 'poland', 'admin', null, now(), now()),
  ('00000000-0000-4000-8000-000000000003', 'Test Admin', 'test_admin@nucleify.io', 'en', 'poland', 'test_admin', null, now(), now()),
  ('00000000-0000-4000-8000-000000000004', 'Test Admin 2', 'test_admin2@nucleify.io', 'en', 'poland', 'test_admin', null, now(), now()),
  ('00000000-0000-4000-8000-000000000005', 'Test Tech', 'test_tech@nucleify.io', 'en', 'poland', 'tech', null, now(), now()),
  ('00000000-0000-4000-8000-000000000006', 'Test User', 'test_user@nucleify.io', 'en', 'poland', 'user', null, now(), now())
on conflict (id) do update
set
  name = excluded.name,
  email = excluded.email,
  language = excluded.language,
  country = excluded.country,
  role = excluded.role,
  phone_number = excluded.phone_number,
  updated_at = now();

-- Twenty articles, contacts, and money rows per fixed dev user (nuc_entities tables with user_id)
delete from public.money
where user_id in (
  select id from auth.users
  where email in (
    's.radomski19@gmail.com',
    'admin@nucleify.io',
    'test_admin@nucleify.io',
    'test_admin2@nucleify.io',
    'test_tech@nucleify.io',
    'test_user@nucleify.io'
  )
);
delete from public.contacts
where user_id in (
  select id from auth.users
  where email in (
    's.radomski19@gmail.com',
    'admin@nucleify.io',
    'test_admin@nucleify.io',
    'test_admin2@nucleify.io',
    'test_tech@nucleify.io',
    'test_user@nucleify.io'
  )
);
delete from public.articles
where user_id in (
  select id from auth.users
  where email in (
    's.radomski19@gmail.com',
    'admin@nucleify.io',
    'test_admin@nucleify.io',
    'test_admin2@nucleify.io',
    'test_tech@nucleify.io',
    'test_user@nucleify.io'
  )
);

insert into public.articles (user_id, title, description, category, created_at, updated_at)
select
  p.id,
  'Seeded article ' || n || ' — ' || p.name,
  'Seeded article ' || n || ' for local development and entity dashboards.',
  case (n % 4)
    when 0 then 'general'
    when 1 then 'news'
    when 2 then 'draft'
    else 'archive'
  end,
  date_trunc('second', now() - ((n - 1) || ' days')::interval),
  date_trunc('second', now())
from public.user_profiles p
cross join generate_series(1, 20) as n
where p.email in (
  's.radomski19@gmail.com',
  'admin@nucleify.io',
  'test_admin@nucleify.io',
  'test_admin2@nucleify.io',
  'test_tech@nucleify.io',
  'test_user@nucleify.io'
);

insert into public.contacts (
  user_id,
  first_name,
  last_name,
  email,
  personal_phone,
  work_phone,
  address,
  birthday,
  contact_groups,
  role,
  created_at,
  updated_at
)
select
  p.id,
  'Contact ' || n,
  coalesce(
    nullif(trim(substring(p.name from length(split_part(p.name, ' ', 1)) + 2)), ''),
    'Seed ' || n::text
  ),
  split_part(p.email, '@', 1) || '+seed' || n::text || '@' || split_part(p.email, '@', 2),
  coalesce(
    p.phone_number,
    '+48 5' || ((n + abs(hashtext(p.email::text))) % 9)::text || '00 ' || lpad((n * 17 % 1000)::text, 3, '0') || ' '
    || lpad((n * 31 % 1000)::text, 3, '0')
  ),
  '+48 22 ' || lpad((200 + n)::text, 3, '0') || ' ' || lpad((n * 7 % 900 + 100)::text, 3, '0'),
  'ul. Seedowa ' || n::text || ', 00-' || lpad(((n * 13) % 90 + 10)::text, 2, '0') || '0 Warszawa',
  date '1990-06-15' + ((abs(hashtext(p.email::text)) % 400) + n),
  case (n % 3)
    when 0 then '["Dev","VIP"]'::jsonb
    when 1 then '["Newsletter","B2B"]'::jsonb
    else '["Support"]'::jsonb
  end,
  p.role,
  date_trunc('second', now() - ((n - 1) || ' hours')::interval),
  date_trunc('second', now())
from public.user_profiles p
cross join generate_series(1, 20) as n
where p.email in (
  's.radomski19@gmail.com',
  'admin@nucleify.io',
  'test_admin@nucleify.io',
  'test_admin2@nucleify.io',
  'test_tech@nucleify.io',
  'test_user@nucleify.io'
);

insert into public.money (
  user_id,
  sender,
  receiver,
  count,
  title,
  description,
  category,
  created_at,
  updated_at
)
select
  p.id,
  'Sender ' || n,
  'Receiver ' || n,
  n,
  'Money row ' || n || ' — ' || p.name,
  'Seeded money row ' || n || ' for local development.',
  case (n % 3)
    when 0 then 'transfer'
    when 1 then 'invoice'
    else 'adjustment'
  end,
  date_trunc('second', now() - ((n - 1) || ' hours')::interval),
  date_trunc('second', now())
from public.user_profiles p
cross join generate_series(1, 20) as n
where p.email in (
  's.radomski19@gmail.com',
  'admin@nucleify.io',
  'test_admin@nucleify.io',
  'test_admin2@nucleify.io',
  'test_tech@nucleify.io',
  'test_user@nucleify.io'
);

-- Fixed dev accounts: everyone is friends with everyone (accepted, single row per pair).
-- Merged seed order runs nuc_friendship before nuc_users, so the dense graph is applied here.
delete from public.friendships f
where coalesce(f.requester_id::text, f.sender_id::text)::uuid in (
  select u.id from auth.users u where u.email in (
    's.radomski19@gmail.com',
    'admin@nucleify.io',
    'test_admin@nucleify.io',
    'test_admin2@nucleify.io',
    'test_tech@nucleify.io',
    'test_user@nucleify.io'
  )
)
and (f.recipient_id)::uuid in (
  select u.id from auth.users u where u.email in (
    's.radomski19@gmail.com',
    'admin@nucleify.io',
    'test_admin@nucleify.io',
    'test_admin2@nucleify.io',
    'test_tech@nucleify.io',
    'test_user@nucleify.io'
  )
);

-- Legacy schema: NOT NULL requester_id (acquaintances); newer SQL uses sender_id — fill both.
insert into public.friendships (
  requester_id,
  sender_id,
  recipient_id,
  status,
  created_at,
  updated_at
)
select (a.id)::uuid, (a.id)::uuid, (b.id)::uuid, 'accepted', now(), now()
from auth.users a
join auth.users b on (a.id)::uuid < (b.id)::uuid
where a.email in (
  's.radomski19@gmail.com',
  'admin@nucleify.io',
  'test_admin@nucleify.io',
  'test_admin2@nucleify.io',
  'test_tech@nucleify.io',
  'test_user@nucleify.io'
)
and b.email in (
  's.radomski19@gmail.com',
  'admin@nucleify.io',
  'test_admin@nucleify.io',
  'test_admin2@nucleify.io',
  'test_tech@nucleify.io',
  'test_user@nucleify.io'
);

-- Bulk factory users (UserSeeder: 200 extra in non-production — match 194 after six fixed)
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new,
  email_change_token_current,
  reauthentication_token,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  format('user_%s@nucleify.factory.local', i),
  crypt('password', gen_salt('bf')),
  now(),
  '',
  '',
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', format('User %s', i)),
  now() - (((i - 1) % 365) || ' days')::interval,
  now()
from generate_series(1, 194) as g(i);

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  u.email::text,
  now(),
  now(),
  now()
from auth.users u
where u.email like 'user\_%@nucleify.factory.local' escape '\';

insert into public.user_profiles (
  id,
  name,
  email,
  language,
  country,
  role,
  phone_number,
  created_at,
  updated_at
)
select
  u.id,
  format('User %s', (regexp_match(u.email, '^user_([0-9]+)@'))[1]::integer),
  u.email,
  (array['en', 'pl', 'vn'])[((regexp_match(u.email, '^user_([0-9]+)@'))[1]::integer % 3) + 1],
  (array['poland', 'germany', 'france'])[((regexp_match(u.email, '^user_([0-9]+)@'))[1]::integer % 3) + 1],
  (array['user', 'tech', 'test_admin'])[((regexp_match(u.email, '^user_([0-9]+)@'))[1]::integer % 3) + 1],
  lpad(
    ((500000000 + (regexp_match(u.email, '^user_([0-9]+)@'))[1]::integer) % 999999999)::text,
    9,
    '0'
  ),
  u.created_at,
  now()
from auth.users u
where u.email like 'user\_%@nucleify.factory.local' escape '\'
on conflict (id) do update
set
  name = excluded.name,
  email = excluded.email,
  language = excluded.language,
  country = excluded.country,
  role = excluded.role,
  phone_number = excluded.phone_number,
  updated_at = now();

delete from public.files
where user_id in (select id from auth.users);

insert into public.files (user_id, path, mime_type, size, created_at, updated_at)
select
  x.user_id,
  f.path,
  f.mime_type,
  (f.size)::bigint,
  f.created_at,
  now()
from (
  select
    u.id as user_id,
    row_number() over (order by u.created_at asc, u.id asc) as user_ix,
    gs.n
  from auth.users u
  cross join generate_series(1, 15) as gs(n)
) x
cross join lateral public.factory_file(((x.user_ix - 1) * 100 + x.n)::integer) as f;

commit;
