-- Protection additive des adhérents. Aucun nettoyage ni restauration de données.
begin;
-- Même jeu d’espaces de bord que String.trim(), sans convertir ni enlever les zéros.
create function public.vsv_paheko_id(value text) returns text language sql immutable parallel safe
 set search_path='' as $$select btrim(coalesce(value,''), E' \t\n\r\f' || chr(11) || U&'\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF')$$;

-- Si des doublons actifs subsistent dans un autre environnement, arrêter sans choisir de fiche.
do $$begin
 if exists(select 1 from public.vsv_references where kind='members' and not deleted and payload ? 'externalId' and (jsonb_typeof(payload->'externalId')<>'string' or length(public.vsv_paheko_id(payload->>'externalId'))>200))then raise exception 'Identifiants Paheko invalides : migration annulée sans modification des fiches.';end if;
 if exists(select 1 from public.vsv_references where kind='members' and not deleted and public.vsv_paheko_id(payload->>'externalId')<>'' group by public.vsv_paheko_id(payload->>'externalId') having count(*)>1) then
  raise exception 'Doublons Paheko actifs : migration annulée, aucune donnée modifiée. Examiner les identités avant installation.';
 end if;
end$$;
create unique index vsv_members_external_id_live_unique
 on public.vsv_references ((public.vsv_paheko_id(payload->>'externalId')))
 where kind='members' and not deleted and public.vsv_paheko_id(payload->>'externalId')<>'';
-- Archivés inclus, suppressions logiques exclues : les copies déjà retirées restent retirées.
alter table public.vsv_references add constraint vsv_member_external_id_text
 check (kind<>'members' or deleted or not (payload ? 'externalId') or
  (jsonb_typeof(payload->'externalId')='string' and length(public.vsv_paheko_id(payload->>'externalId'))<=200));
create function public.vsv_protect_member_identity() returns trigger
 language plpgsql security definer set search_path='' as $$
begin
 if tg_op='UPDATE' and old.kind='members' and old.deleted and not new.deleted then
  raise exception 'Une fiche membre supprimée logiquement ne peut pas être réactivée par cette écriture' using errcode='23514';
 end if;
 if new.kind='members' then
  -- Conserver l’identité lors des futures suppressions ; ne pas réécrire les tombstones existants.
  if tg_op='UPDATE' and new.deleted and not old.deleted and new.payload is null then new.payload=old.payload;end if;
  if not new.deleted and public.vsv_paheko_id(new.payload->>'externalId')<>'' then
   if tg_op='INSERT' then
    -- INSERT ... ON CONFLICT appelle ce trigger avant le trigger UPDATE.
    if exists(select 1 from public.vsv_references r where r.kind='members' and r.id=new.id and r.deleted)then
     raise exception 'Une fiche membre supprimée logiquement ne peut pas être réactivée par cet import' using errcode='23514';
    end if;
    if not exists(select 1 from public.vsv_references r where r.kind='members' and r.id=new.id and not r.deleted and public.vsv_paheko_id(r.payload->>'externalId')=public.vsv_paheko_id(new.payload->>'externalId')) and exists(select 1 from public.vsv_references r where r.kind='members' and r.deleted and public.vsv_paheko_id(r.payload->>'externalId')=public.vsv_paheko_id(new.payload->>'externalId'))then
     raise exception 'Identité Paheko supprimée : réimport automatique refusé' using errcode='23514';
    end if;
   elsif public.vsv_paheko_id(old.payload->>'externalId')<>public.vsv_paheko_id(new.payload->>'externalId') then
    if exists(select 1 from public.vsv_references r where r.kind='members' and r.deleted and public.vsv_paheko_id(r.payload->>'externalId')=public.vsv_paheko_id(new.payload->>'externalId'))then
     raise exception 'Identité Paheko supprimée : réaffectation automatique refusée' using errcode='23514';
    end if;
   end if;
  end if;
 end if;
 return new;
end$$;
revoke all on function public.vsv_protect_member_identity() from public,anon,authenticated;
create trigger vsv_member_identity_guard before insert or update on public.vsv_references
 for each row execute function public.vsv_protect_member_identity();
commit;
