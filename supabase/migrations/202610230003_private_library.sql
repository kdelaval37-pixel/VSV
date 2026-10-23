begin;
create table public.vsv_admin_files(like public.vsv_files including all);
alter table public.vsv_admin_files enable row level security;
revoke all on public.vsv_admin_files from public,anon,authenticated;
grant all on public.vsv_admin_files to service_role;
insert into storage.buckets(id,name,public)values('vsv-private-admin','vsv-private-admin',false)on conflict(id)do nothing;
create policy vsv_admin_file_read on storage.objects for select to authenticated using(bucket_id='vsv-private-admin' and public.vsv_admin());
create policy vsv_admin_file_guard on storage.objects as restrictive for select to anon,authenticated using(bucket_id<>'vsv-private-admin' or public.vsv_admin());
create policy vsv_admin_file_insert_guard on storage.objects as restrictive for insert to anon,authenticated with check(bucket_id<>'vsv-private-admin');
create policy vsv_admin_file_update_guard on storage.objects as restrictive for update to anon,authenticated using(bucket_id<>'vsv-private-admin')with check(bucket_id<>'vsv-private-admin');
create policy vsv_admin_file_delete_guard on storage.objects as restrictive for delete to anon,authenticated using(bucket_id<>'vsv-private-admin');
create or replace function public.vsv_visible_document(p_kind text,p_id text,p_payload jsonb,p_actor uuid) returns boolean language sql stable security definer set search_path='' as $$
 select p_kind<>'hub' or (
 (coalesce(p_payload->>'type','')<>'personal' or p_id='prefs_'||p_actor::text)
 and (coalesce(p_payload->>'visibility','association')<>'administrateurs' or exists(select 1 from public.vsv_access where user_id=p_actor and active and technical_admin)))
$$;
commit;
