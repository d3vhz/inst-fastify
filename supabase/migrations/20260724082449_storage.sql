insert into storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
values
  ('inst', 'inst', true, 5242880, ARRAY['image/*']);

create policy "Users can view all files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'inst'
);

create policy "Authenticated users can upload files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'inst'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Authenticated users can update files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'inst'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'inst'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Authenticated users can delete files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'inst'
  and (storage.foldername(name))[1] = auth.uid()::text
);

grant select, insert, update, delete on storage.objects to authenticated;