-- Réponses individuelles ; aucune présence, procuration ou voix créée.
begin;
create table public.vsv_rsvp(
 id uuid primary key,creator uuid not null references auth.users(id),token_hash text not null unique,
 link_token text not null,source_kind text not null check(source_kind in ('invitations','convocations')),
 source_id text not null,member_id text not null,person_name text not null,invitation jsonb not null,
 expires_at timestamptz not null,revoked boolean not null default false,
 response text not null default 'En attente' check(response in ('En attente','Accepté','Refusé')),
 history jsonb not null default '[]',created_at timestamptz not null default now()
);
alter table public.vsv_rsvp enable row level security;
revoke all on public.vsv_rsvp from public,anon,authenticated;
grant all on public.vsv_rsvp to service_role;
create function public.vsv_rsvp_reply(p_hash text,p_request uuid,p_response text) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.vsv_rsvp;h jsonb;payload jsonb;begin
 if p_response not in ('Accepté','Refusé')then raise exception 'Réponse invalide';end if;
 perform 1 from public.vsv_clock where id for update;
 select * into r from public.vsv_rsvp where token_hash=p_hash for update;
 if not found or r.revoked or r.expires_at<=now() then raise exception 'Lien expiré ou invalide';end if;
 perform public.vsv_assert_actor(r.creator);
 for h in select value from jsonb_array_elements(r.history) loop if h->>'request'=p_request::text then
 if h->>'response'<>p_response then raise exception 'Identifiant déjà utilisé';end if;return jsonb_build_object('response',r.response);end if;end loop;
 if jsonb_array_length(r.history)>=1000 then raise exception 'Trop de modifications de réponse';end if;
 update public.vsv_rsvp set response=p_response,history=history||jsonb_build_array(jsonb_build_object('request',p_request,'response',p_response,'date',now())) where id=r.id;
 select d.payload into payload from public.vsv_documents d where d.kind='hub' and d.id='response_'||encode(sha256(convert_to(r.source_kind||'/'||r.source_id||'/'||r.member_id,'UTF8')),'hex');
 payload=coalesce(payload,'{}')||jsonb_build_object('id','response_'||encode(sha256(convert_to(r.source_kind||'/'||r.source_id||'/'||r.member_id,'UTF8')),'hex'),'type','response','title','Réponse : '||r.person_name,'status',p_response,'sourceKind',r.source_kind,'sourceId',r.source_id,'ownerId',r.member_id,'ownerName',r.person_name,'updatedAt',now(),'createdAt',r.created_at);
 insert into public.vsv_documents(kind,id,payload,updated_by)values('hub','response_'||encode(sha256(convert_to(r.source_kind||'/'||r.source_id||'/'||r.member_id,'UTF8')),'hex'),payload,r.creator)
 on conflict(kind,id)do update set payload=excluded.payload,version=public.vsv_documents.version+1,updated_at=now(),updated_by=r.creator;
 update public.vsv_clock set revision=revision+1 where id;
 return jsonb_build_object('response',p_response);end$$;
revoke all on function public.vsv_rsvp_reply(text,uuid,text) from public,anon,authenticated;
grant execute on function public.vsv_rsvp_reply(text,uuid,text) to service_role;
create function public.vsv_rsvp_issue(p_row jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.vsv_rsvp;begin
 perform public.vsv_assert_actor((p_row->>'creator')::uuid);
 if (p_row->>'token_hash')!~'^[a-f0-9]{64}$' or (p_row->>'link_token')!~'^[A-Za-z0-9_-]{43}$' then raise exception 'Lien invalide';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended((p_row->>'source_kind')||'/'||(p_row->>'source_id')||'/'||(p_row->>'member_id'),0));
 select * into r from public.vsv_rsvp where id=(p_row->>'id')::uuid;
 if found then if r.creator::text<>p_row->>'creator' then raise exception 'Demande déjà utilisée';end if;return to_jsonb(r);end if;
 update public.vsv_rsvp set revoked=true where source_kind=p_row->>'source_kind' and source_id=p_row->>'source_id' and member_id=p_row->>'member_id' and not revoked;
 insert into public.vsv_rsvp(id,creator,token_hash,link_token,source_kind,source_id,member_id,person_name,invitation,expires_at)
 values((p_row->>'id')::uuid,(p_row->>'creator')::uuid,p_row->>'token_hash',p_row->>'link_token',p_row->>'source_kind',p_row->>'source_id',p_row->>'member_id',p_row->>'person_name',p_row->'invitation',(p_row->>'expires_at')::timestamptz)returning * into r;
 return to_jsonb(r);end$$;
revoke all on function public.vsv_rsvp_issue(jsonb) from public,anon,authenticated;
grant execute on function public.vsv_rsvp_issue(jsonb) to service_role;
commit;
