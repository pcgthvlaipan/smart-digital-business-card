-- Run once in the Supabase SQL Editor for this project.
-- The "logos" bucket was created without the row-level-security policies
-- that "avatars" and "backgrounds" already have, so uploads to it were
-- being rejected for every user ("new row violates row-level security
-- policy") - this is why Save Card failed whenever a logo was selected.
-- Mirrors the same per-user-folder convention (<user id>/filename) the
-- other two buckets already use.

create policy "Users can upload their own logo"
on storage.objects for insert to authenticated
with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own logo"
on storage.objects for update to authenticated
using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own logo"
on storage.objects for delete to authenticated
using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Public read access to logos"
on storage.objects for select
using (bucket_id = 'logos');
