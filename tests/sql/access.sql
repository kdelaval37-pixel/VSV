\set ON_ERROR_STOP on
begin;
insert into auth.users(id,email)values('11111111-1111-4111-8111-111111111111','a@example.invalid'),('22222222-2222-4222-8222-222222222222','b@example.invalid'),('33333333-3333-4333-8333-333333333333','admin@example.invalid'),('44444444-4444-4444-8444-444444444444','outside@example.invalid');
insert into public.vsv_access(user_id,technical_admin)values('11111111-1111-4111-8111-111111111111',false),('22222222-2222-4222-8222-222222222222',false),('33333333-3333-4333-8333-333333333333',true);
insert into public.vsv_documents(kind,id,payload)values('projects','fictif','{"id":"fictif"}');
insert into storage.objects(bucket_id,name)values('vsv-private','fictif.png');
set local role anon;
do $$begin begin perform * from public.vsv_documents;raise exception 'ÉCHEC anonyme autorisé';exception when insufficient_privilege then null;end;end$$;
reset role;
select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
set local role authenticated;
do $$begin if exists(select 1 from public.vsv_documents)then raise exception 'ÉCHEC connecté non autorisé';end if;if exists(select 1 from storage.objects)then raise exception 'ÉCHEC fichiers non autorisés';end if;end$$;
reset role;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
set local role authenticated;
do $$begin if (select count(*) from public.vsv_documents)<>1 then raise exception 'ÉCHEC lecture active';end if;if (select count(*) from storage.objects)<>1 then raise exception 'ÉCHEC lecture fichier actif';end if;
begin insert into storage.objects(bucket_id,name)values('vsv-private','direct.png');raise exception 'ÉCHEC fichier écrit directement';exception when insufficient_privilege then null;end;
begin update public.vsv_access set technical_admin=true where user_id=auth.uid();raise exception 'ÉCHEC auto-promotion';exception when insufficient_privilege then null;end;
begin perform public.vsv_set_access(auth.uid(),'22222222-2222-4222-8222-222222222222',false);raise exception 'ÉCHEC RPC admin publique';exception when insufficient_privilege then null;end;
begin perform public.vsv_commit(auth.uid(),gen_random_uuid(),'fictif',0,'[]','null');raise exception 'ÉCHEC écriture directe';exception when insufficient_privilege then null;end;
begin insert into public.vsv_documents(kind,id,payload)values('projects','fabrique','{}');raise exception 'ÉCHEC insertion directe';exception when insufficient_privilege then null;end;
end$$;
reset role;
set local role service_role;
select public.vsv_set_access('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111',false);
reset role;
set local role authenticated;
do $$begin if exists(select 1 from public.vsv_documents)then raise exception 'ÉCHEC suspendu';end if;if exists(select 1 from storage.objects)then raise exception 'ÉCHEC fichier suspendu';end if;end$$;
reset role;
-- Atomicité : un second changement invalide doit annuler le premier.
set local role service_role;
do $$declare n bigint;begin select revision into n from public.vsv_clock;begin perform public.vsv_commit('22222222-2222-4222-8222-222222222222','55555555-5555-4555-8555-555555555555','atomic',n,'[{"table":"vsv_documents","kind":"projects","id":"premier","payload":{},"expected":0,"deleted":false},{"table":"vsv_documents","kind":"projects","id":"fictif","payload":{},"expected":99,"deleted":false}]','null');raise exception 'ÉCHEC conflit absent';exception when serialization_failure then null;end;if exists(select 1 from public.vsv_documents where id='premier')then raise exception 'ÉCHEC écriture partielle';end if;
perform public.vsv_commit('22222222-2222-4222-8222-222222222222','66666666-6666-4666-8666-666666666666','once',n,'[{"table":"vsv_documents","kind":"projects","id":"unique","payload":{},"expected":0,"deleted":false}]','{"ok":true}');
perform public.vsv_commit('22222222-2222-4222-8222-222222222222','66666666-6666-4666-8666-666666666666','once',n,'[]','{"ok":true}');
if (select version from public.vsv_documents where id='unique')<>1 then raise exception 'ÉCHEC doublon';end if;
end$$;
reset role;
rollback;
\echo 'RLS, droits, suspension, fichiers, atomicité et idempotence SQL : OK'
