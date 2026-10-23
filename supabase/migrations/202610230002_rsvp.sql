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
 select d.payload into payload from public.vsv_documents d where d.kind='hub' and d.id='response_'||r.id;
 payload=coalesce(payload,'{}')||jsonb_build_object('id','response_'||r.id,'type','response','title','Réponse : '||r.person_name,'status',p_response,'sourceKind',r.source_kind,'sourceId',r.source_id,'ownerId',r.member_id,'ownerName',r.person_name,'updatedAt',now(),'createdAt',r.created_at);
 insert into public.vsv_documents(kind,id,payload,updated_by)values('hub','response_'||r.id,payload,r.creator)
 on conflict(kind,id)do update set payload=excluded.payload,version=public.vsv_documents.version+1,updated_at=now(),updated_by=r.creator;
 update public.vsv_clock set revision=revision+1 where id;
 return jsonb_build_object('response',p_response);end$$;
revoke all on function public.vsv_rsvp_reply(text,uuid,text) from public,anon,authenticated;
grant execute on function public.vsv_rsvp_reply(text,uuid,text) to service_role;
commit;
