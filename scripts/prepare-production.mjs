// Préparation locale seulement : aucune connexion, migration ou publication automatique.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {upgradeSql} from './prepare-global.mjs';
const target='zbbxhhtqcyryabfftbvq';
if(process.env.VSV_BUILD_TARGET!=='production')throw Error('Définissez VSV_BUILD_TARGET=production.');
if(execFileSync('git',['status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim())throw Error('Code suivi modifié : utilisez le commit de livraison.');
const identity=(await readFile('supabase/migrations/202610210002_member_identity.sql','utf8')).replace(/^\s*(begin|commit);\s*$/gmi,'');
let sql=await upgradeSql();
sql=sql.replace('-- VSV-TEST UNIQUEMENT : grgvwyedfrxnwhgdqpoj. Vérifier la cible dans Supabase avant exécution.',`-- VSV OFFICIEL UNIQUEMENT : ${target}. Vérifier le projet dans Supabase avant exécution.`);
sql=sql.replace('begin;\n',`begin;\n-- Socle réseau et convocations déjà installés ; aucune copie de VSV-TEST.\ndo $identity$ begin\nif to_regclass('public.vsv_references') is null then raise exception 'Socle VSV absent : arrêter.';end if;\nif to_regclass('public.vsv_members_external_id_live_unique') is not null and to_regprocedure('public.vsv_protect_member_identity()') is not null and exists(select 1 from pg_trigger where tgname='vsv_member_identity_guard' and tgrelid='public.vsv_references'::regclass and not tgisinternal) then\n raise notice 'Protection membres déjà installée';\nelsif to_regprocedure('public.vsv_paheko_id(text)') is not null or to_regclass('public.vsv_members_external_id_live_unique') is not null then\n raise exception 'Protection membres partiellement installée : arrêter et examiner.';\nelse execute $identity_body$${identity}$identity_body$;end if;end $identity$;\n`);
sql=sql.replace('Ne pas exécuter sur une base vierge ou la production.','Socle incomplet : arrêter.');
await mkdir('release',{recursive:true});await writeFile('release/vsv-production-mise-a-jour.sql',sql);
await writeFile('release/production-manifest.json',JSON.stringify({target,site:'https://vsv-byl.pages.dev/',commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sqlSha256:createHash('sha256').update(sql).digest('hex')},null,2));
console.log('SQL préparé : release/vsv-production-mise-a-jour.sql. Aucune migration ni publication effectuée.');
