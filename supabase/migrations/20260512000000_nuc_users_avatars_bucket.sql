-- Bucket for profile pictures (uploaded via Nuxt API + service role).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update
set public = excluded.public;
