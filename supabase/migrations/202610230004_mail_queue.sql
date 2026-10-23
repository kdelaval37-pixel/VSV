begin;
alter table public.vsv_access add column can_send_mail boolean not null default false;
create table public.vsv_mail_jobs(id uuid primary key,actor uuid not null references auth.users(id),fingerprint text not null,payload jsonb not null,state text not null check(state in ('queued','sending','sent','failed','uncertain')),results jsonb not null default '[]',error text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create unique index vsv_mail_once on public.vsv_mail_jobs(actor,(payload->>'documentId'),fingerprint);
alter table public.vsv_mail_jobs enable row level security;
revoke all on public.vsv_mail_jobs from public,anon,authenticated;
grant all on public.vsv_mail_jobs to service_role;
create function public.vsv_mail_claim(p_id uuid,p_actor uuid)returns jsonb language plpgsql security definer set search_path='' as $$declare result jsonb;begin
 perform public.vsv_assert_actor(p_actor);
 if not exists(select 1 from public.vsv_access where user_id=p_actor and active and (technical_admin or can_send_mail))then raise exception 'Droit d’envoi requis' using errcode='42501';end if;
 update public.vsv_mail_jobs set state='sending',updated_at=now()where id=p_id and actor=p_actor and state='queued' returning to_jsonb(vsv_mail_jobs.*)into result;
 return result;end$$;
revoke all on function public.vsv_mail_claim(uuid,uuid) from public,anon,authenticated;
grant execute on function public.vsv_mail_claim(uuid,uuid) to service_role;
commit;
begin;
create function public.vsv_mail_retry(p_id uuid,p_actor uuid)returns jsonb language plpgsql security definer set search_path='' as $$declare result jsonb;begin
 perform public.vsv_assert_actor(p_actor);
 if not exists(select 1 from public.vsv_access where user_id=p_actor and active and (technical_admin or can_send_mail))then raise exception 'Droit d’envoi requis' using errcode='42501';end if;
 update public.vsv_mail_jobs set state='queued',updated_at=now()where id=p_id and actor=p_actor and state='failed' and not exists(select 1 from jsonb_array_elements(results)r where r->>'state'='uncertain')returning to_jsonb(vsv_mail_jobs.*)into result;
 return result;end$$;
revoke all on function public.vsv_mail_retry(uuid,uuid) from public,anon,authenticated;
grant execute on function public.vsv_mail_retry(uuid,uuid) to service_role;
commit;
