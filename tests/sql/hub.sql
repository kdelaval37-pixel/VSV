\set ON_ERROR_STOP on
begin;
insert into auth.users(id,email)values('11111111-1111-4111-8111-111111111111','a@example.invalid'),('22222222-2222-4222-8222-222222222222','b@example.invalid'),('33333333-3333-4333-8333-333333333333','admin@example.invalid');
insert into public.vsv_access(user_id,technical_admin)values('11111111-1111-4111-8111-111111111111',false),('22222222-2222-4222-8222-222222222222',false),('33333333-3333-4333-8333-333333333333',true);
insert into public.vsv_documents(kind,id,payload,updated_by)values('hub','prefs_11111111-1111-4111-8111-111111111111','{"type":"personal","ownerId":"11111111-1111-4111-8111-111111111111"}','11111111-1111-4111-8111-111111111111'),('hub','confidentiel','{"type":"document","visibility":"administrateurs","notes":"fictif"}','33333333-3333-4333-8333-333333333333');
insert into storage.objects(bucket_id,name)values('vsv-private-admin','confidentiel.pdf');
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
set local role authenticated;
do $$begin if exists(select 1 from public.vsv_documents where kind='hub')then raise exception 'Données individuelles/confidentielles visibles';end if;
if exists(select 1 from storage.objects where bucket_id='vsv-private-admin')then raise exception 'Fichier confidentiel visible';end if;
begin perform * from public.vsv_rsvp;raise exception 'Jetons exposés';exception when insufficient_privilege then null;end;
end$$;
reset role;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
set local role authenticated;
do $$begin if not exists(select 1 from public.vsv_documents where id='confidentiel')then raise exception 'Document admin indisponible';end if;if not exists(select 1 from storage.objects where bucket_id='vsv-private-admin')then raise exception 'Fichier admin indisponible';end if;end$$;
reset role;
set local role service_role;
do $$declare row jsonb;answer jsonb;n int;begin
row=public.vsv_rsvp_issue(jsonb_build_object('id','55555555-5555-4555-8555-555555555555','creator','11111111-1111-4111-8111-111111111111','token_hash',repeat('a',64),'link_token',repeat('b',43),'source_kind','invitations','source_id','fictif','member_id','membre-fictif','person_name','Personne fictive','invitation',jsonb_build_object('title','Réunion fictive'),'expires_at',now()+interval '1 day'));
answer=public.vsv_rsvp_reply(repeat('a',64),'66666666-6666-4666-8666-666666666666','Accepté');
answer=public.vsv_rsvp_reply(repeat('a',64),'66666666-6666-4666-8666-666666666666','Accepté');
select jsonb_array_length(history) into n from public.vsv_rsvp where token_hash=repeat('a',64);if n<>1 then raise exception 'Réponse dupliquée';end if;
if (select count(*) from public.vsv_documents where kind='hub' and payload->>'type'='response')<>1 then raise exception 'Réponse absente';end if;
if exists(select 1 from public.vsv_operations)then raise exception 'Opération métier inventée';end if;
update public.vsv_rsvp set revoked=true where token_hash=repeat('a',64);
begin perform public.vsv_rsvp_reply(repeat('a',64),gen_random_uuid(),'Refusé');raise exception 'Lien révoqué accepté';exception when others then if sqlerrm='Lien révoqué accepté' then raise;end if;end;
end$$;
reset role;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select set_config('realtime.topic','vsv:doc:hub:confidentiel',true);
set local role authenticated;
do $$begin
if public.vsv_presence_allowed('vsv:doc:hub:confidentiel')then raise exception 'Présence confidentielle autorisée';end if;
begin insert into realtime.messages(topic,message)values('vsv:doc:hub:confidentiel','fictif');raise exception 'ÉCHEC présence privée';exception when insufficient_privilege then null;end;
end$$;
reset role;
set local role service_role;
do $$declare job_id uuid='77777777-7777-4777-8777-777777777777';result jsonb;begin
insert into public.vsv_mail_jobs(id,actor,fingerprint,payload,state)values(job_id,'11111111-1111-4111-8111-111111111111','fictif','{"documentId":"fictif"}','queued');
begin perform public.vsv_mail_claim(job_id,'11111111-1111-4111-8111-111111111111');raise exception 'ÉCHEC envoi non autorisé';exception when insufficient_privilege then null;end;
update public.vsv_access set can_send_mail=true where user_id='11111111-1111-4111-8111-111111111111';
result=public.vsv_mail_claim(job_id,'11111111-1111-4111-8111-111111111111');if result is null then raise exception 'Prise en charge mail manquante';end if;
if public.vsv_mail_claim(job_id,'11111111-1111-4111-8111-111111111111')is not null then raise exception 'Envoi pris deux fois';end if;
update public.vsv_mail_jobs set state='uncertain' where id=job_id;
if public.vsv_mail_retry(job_id,'11111111-1111-4111-8111-111111111111')is not null then raise exception 'Renvoi incertain autorisé';end if;
end$$;
reset role;
rollback;
\echo 'Hub : confidentialité SQL/Storage, jetons privés, RSVP atomique/idempotent et révocation : OK'
