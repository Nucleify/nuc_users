-- Preamble: columns shared with legacy schemas (sender vs requester naming).
alter table public.friendships add column if not exists status text not null default 'pending';
alter table public.friendships add column if not exists created_at timestamptz not null default now();
alter table public.friendships add column if not exists updated_at timestamptz not null default now();

do $$
declare
  use_requester boolean;
begin
  select exists (
    select 1
    from pg_attribute a
    join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'friendships'
      and a.attname = 'requester_id'
      and a.attnum > 0
      and not a.attisdropped
      and a.attnotnull
  )
  into use_requester;

  if use_requester then
    insert into public.friendships (requester_id, recipient_id, status, created_at, updated_at)
    with users as (
      select id from auth.users order by created_at asc limit 40
    )
    select
      s.id,
      r.id,
      (array['pending', 'accepted', 'denied', 'blocked'])[(gs.i % 4) + 1],
      now() - ((gs.i % 365) || ' days')::interval,
      now()
    from generate_series(1, 120) as gs(i)
    left join lateral (select id from users order by random() limit 1) as s on true
    left join lateral (select id from users order by random() limit 1) as r on true
    where s.id is not null and r.id is not null and s.id <> r.id;
  else
    insert into public.friendships (sender_id, recipient_id, status, created_at, updated_at)
    with users as (
      select id from auth.users order by created_at asc limit 40
    )
    select
      s.id,
      r.id,
      (array['pending', 'accepted', 'denied', 'blocked'])[(gs.i % 4) + 1],
      now() - ((gs.i % 365) || ' days')::interval,
      now()
    from generate_series(1, 120) as gs(i)
    left join lateral (select id from users order by random() limit 1) as s on true
    left join lateral (select id from users order by random() limit 1) as r on true
    where s.id is not null and r.id is not null and s.id <> r.id;
  end if;
end $$;
