-- Additif : un objet du hub par enregistrement versionné, aucun rejeu métier.
begin;
alter table public.vsv_documents drop constraint vsv_documents_kind_check;
alter table public.vsv_documents add constraint vsv_documents_kind_check check(kind in ('projects','meetings','pvs','reviews','convocations','invitations','hub'));
-- Les préférences personnelles sont liées à leur compte, pas aux catégories Paheko.
create function public.vsv_hub_owner_guard() returns trigger language plpgsql set search_path='' as $$
begin
 if new.kind='hub' and not new.deleted and new.payload->>'type'='personal' and (new.id<>'prefs_'||new.updated_by::text or new.payload->>'ownerId'<>new.updated_by::text) then raise exception 'Préférences d’un autre compte interdites';end if;
 return new;
end$$;
create trigger vsv_hub_owner before insert or update on public.vsv_documents for each row execute function public.vsv_hub_owner_guard();
revoke all on function public.vsv_hub_owner_guard() from public,anon,authenticated;
commit;

-- Préférences individuelles : filtrées dans l’API ET en lecture directe RLS.
begin;
create function public.vsv_visible_document(p_kind text,p_id text,p_payload jsonb,p_actor uuid) returns boolean language sql stable security definer set search_path='' as $$
 select p_kind<>'hub' or coalesce(p_payload->>'type','')<>'personal' or p_id='prefs_'||p_actor::text
$$;
revoke all on function public.vsv_visible_document(text,text,jsonb,uuid) from public,anon;
grant execute on function public.vsv_visible_document(text,text,jsonb,uuid) to authenticated,service_role;
drop policy active_read on public.vsv_documents;
create policy active_read on public.vsv_documents for select to authenticated using(public.vsv_active() and public.vsv_visible_document(kind,id,payload,auth.uid()));
create or replace function public.vsv_snapshot(p_actor uuid) returns jsonb language plpgsql security definer set search_path='' as $$declare rows jsonb;rev bigint;begin
 select revision into rev from public.vsv_clock where id for share;perform public.vsv_assert_actor(p_actor);
 select coalesce(jsonb_agg(x order by x."table",x.kind,x.ordinal),'[]') into rows from (
 select 'vsv_documents' as "table",kind,id,payload,version,deleted,ordinal from public.vsv_documents where public.vsv_visible_document(kind,id,payload,p_actor)
 union all select 'vsv_references',kind,id,payload,version,deleted,ordinal from public.vsv_references
 union all select 'vsv_operations',kind,id,payload,version,deleted,ordinal from public.vsv_operations
 union all select 'vsv_settings',kind,id,payload,version,deleted,ordinal from public.vsv_settings)x;
 return jsonb_build_object('rows',rows,'revision',rev);end$$;
commit;
