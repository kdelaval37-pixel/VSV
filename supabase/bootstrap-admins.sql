-- À exécuter UNE fois dans l’éditeur SQL avec les DEUX UUID réels de Authentication > Users.
-- Aucun rôle n’est attribué par ordre d’arrivée, par adresse e-mail ou par catégorie Paheko.
begin;
do $$declare ids uuid[]:=array['REMPLACER_UUID_1','REMPLACER_UUID_2']::uuid[];u uuid;begin
 if cardinality(ids)<>2 or ids[1]=ids[2] then raise exception 'Deux comptes distincts requis';end if;
 lock table public.vsv_access in share row exclusive mode;
 if exists(select 1 from public.vsv_access where technical_admin and not(user_id=any(ids)))then raise exception 'Administrateurs déjà configurés : examinez-les avant de changer cette liste';end if;
 foreach u in array ids loop
 if not exists(select 1 from auth.users where id=u)then raise exception 'Compte Supabase Auth introuvable';end if;
 insert into public.vsv_access(user_id,email,technical_admin,active) select id,coalesce(email,''),true,true from auth.users where id=u on conflict(user_id)do update set technical_admin=true,active=true,updated_at=now();
 end loop;
end$$;
commit;
