import {createConnectors} from '../../../src/shared/connectors.js';
import {createApi} from '../../../src/shared/server.js';
const url=Deno.env.get('SUPABASE_URL')!,secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// Ces valeurs sont injectées uniquement dans l’environnement serveur Supabase.
async function api(path:string,method='GET',body?:unknown,token=secret){const r=await fetch(url+path,{method,headers:{apikey:secret,Authorization:'Bearer '+token,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json().catch(()=>null);if(!r.ok)throw Object.assign(Error(data?.message||data?.msg||'Opération serveur refusée.'),{definite:true,code:data?.code});return data;}
const rpc=(name:string,p:unknown)=>api('/rest/v1/rpc/'+name,'POST',p);
const first=async(path:string)=>(await api('/rest/v1/'+path))[0];
async function allRows(table:string){const all:any[]=[];for(let offset=0;offset<100000;offset+=500){const rows=await api('/rest/v1/'+table+'?order=created_at.asc,id.asc&limit=500&offset='+offset);all.push(...rows);if(rows.length<500)return all;}throw Error('Historique trop volumineux : export paginé à traiter séparément.');}
const db={
 connectorGet:(id:string)=>first('vsv_connector_tokens?id=eq.'+encodeURIComponent(id)),connectorSet:async(r:any)=>{const existing=await first('vsv_connector_tokens?id=eq.google');return api('/rest/v1/vsv_connector_tokens'+(existing?'?id=eq.google':''),existing?'PATCH':'POST',r);},connectorDelete:(id:string)=>api('/rest/v1/vsv_connector_tokens?id=eq.'+encodeURIComponent(id),'DELETE'),oauthCreate:(r:any)=>api('/rest/v1/vsv_oauth_states','POST',r),oauthConsume:(id:string)=>rpc('vsv_consume_oauth',{p_id:id}),
 mailExport:()=>allRows('vsv_mail_jobs'),rsvpExport:()=>allRows('vsv_rsvp'),
 rsvpGet:(h:string)=>first('vsv_rsvp?token_hash=eq.'+encodeURIComponent(h)),rsvpById:(id:string)=>first('vsv_rsvp?id=eq.'+encodeURIComponent(id)),
 rsvpCreate:(r:any)=>rpc('vsv_rsvp_issue',{p_row:r}),
 rsvpReply:(h:string,id:string,response:string)=>rpc('vsv_rsvp_reply',{p_hash:h,p_request:id,p_response:response}),
 rsvpList:async(id:string)=>(await api('/rest/v1/vsv_rsvp?source_id=eq.'+encodeURIComponent(id))).map((r:any)=>({id:r.id,name:r.person_name,response:r.response,revoked:r.revoked,expires:r.expires_at})),
 rsvpRevoke:(id:string)=>api('/rest/v1/vsv_rsvp?id=eq.'+encodeURIComponent(id),'PATCH',{revoked:true}),
 fileMeta:(bucket:string,path:string)=>first((bucket==='vsv-private-admin'?'vsv_admin_files':'vsv_files')+'?path=eq.'+encodeURIComponent(path)),
 mailRetry:(id:string,actor:string)=>rpc('vsv_mail_retry',{p_id:id,p_actor:actor}),
 mailFind:(actor:string,doc:string,fingerprint:string)=>first('vsv_mail_jobs?actor=eq.'+encodeURIComponent(actor)+'&payload->>documentId=eq.'+encodeURIComponent(doc)+'&fingerprint=eq.'+encodeURIComponent(fingerprint)),
 mailGet:(id:string)=>first('vsv_mail_jobs?id=eq.'+encodeURIComponent(id)),mailCreate:(r:any)=>api('/rest/v1/vsv_mail_jobs','POST',r),mailClaim:(id:string,actor:string)=>rpc('vsv_mail_claim',{p_id:id,p_actor:actor}),mailUpdate:(id:string,p:any)=>api('/rest/v1/vsv_mail_jobs?id=eq.'+encodeURIComponent(id),'PATCH',{...p,updated_at:new Date().toISOString()}),mailList:(actor:string,admin:boolean)=>api('/rest/v1/vsv_mail_jobs?order=created_at.desc&limit=100'+(admin?'':'&actor=eq.'+encodeURIComponent(actor))),mailPermission:(id:string,allowed:boolean)=>api('/rest/v1/vsv_access?user_id=eq.'+encodeURIComponent(id),'PATCH',{can_send_mail:allowed}),
 access:(id:string)=>first('vsv_access?user_id=eq.'+encodeURIComponent(id)),
 snapshot:(id:string)=>rpc('vsv_snapshot',{p_actor:id}),
 migration:(id:string)=>first('vsv_migrations?id=eq.'+encodeURIComponent(id)),
 request:(id:string)=>first('vsv_requests?id=eq.'+encodeURIComponent(id)),
 commit:(p:any)=>rpc('vsv_commit',{p_actor:p.actor,p_id:p.id,p_fingerprint:p.fingerprint,p_revision:p.revision,p_changes:p.changes,p_result:p.result,p_migration:p.migration}),
 accessList:()=>api('/rest/v1/vsv_access?order=updated_at.desc'),invites:()=>api('/rest/v1/vsv_invites?order=updated_at.desc'),files:(bucket='vsv-private')=>allRows(bucket==='vsv-private-admin'?'vsv_admin_files':'vsv_files'),
 setAccess:(actor:string,target:string,active:boolean)=>rpc('vsv_set_access',{p_actor:actor,p_target:target,p_active:active}),
 claimInvite:(actor:string,email:string)=>rpc('vsv_claim_invite',{p_actor:actor,p_email:email}),
 finishInvite:(email:string,state:string)=>api('/rest/v1/vsv_invites?email=eq.'+encodeURIComponent(email),'PATCH',{state,updated_at:new Date().toISOString()}),
 addAccess:async(id:string,email:string)=>{await api('/rest/v1/vsv_access','POST',{user_id:id,email,active:true,technical_admin:false});},
 addFile:async(f:any,bucket='vsv-private')=>{const table=bucket==='vsv-private-admin'?'vsv_admin_files':'vsv_files';if(!await first(table+'?id=eq.'+f.id))await api('/rest/v1/'+table,'POST',f);}
};
const auth={user:async(token:string)=>{try{return await api('/auth/v1/user','GET',undefined,token);}catch{return null;}},invite:async(email:string,redirect:string)=>{const result=await api('/auth/v1/invite?redirect_to='+encodeURIComponent(redirect),'POST',{email});return result.user||result;}};
const storage={download:async(path:string,bucket='vsv-private')=>{const r=await fetch(url+'/storage/v1/object/'+bucket+'/'+path,{headers:{apikey:secret,Authorization:'Bearer '+secret}});if(!r.ok)throw Error('Pièce jointe indisponible.');return new Uint8Array(await r.arrayBuffer());},upload:async(path:string,bytes:Uint8Array,mime:string,bucket='vsv-private')=>{const r=await fetch(url+'/storage/v1/object/'+bucket+'/'+path,{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':mime,'x-upsert':'false'},body:Uint8Array.from(bytes).buffer});if(!r.ok){const e=await r.json();if(e.statusCode!=='409'&&e.error!=='Duplicate')throw Error('Fichier non enregistré.');}}};
const isTest=url==='https://grgvwyedfrxnwhgdqpoj.supabase.co';
if(isTest&&Deno.env.get('VSV_SITE_URL')!=='https://vsv-test.pages.dev/')throw Error('TEST exige VSV_SITE_URL=https://vsv-test.pages.dev/ ; aucun repli vers la production.');
const siteUrl=Deno.env.get('VSV_SITE_URL')||'https://vsv-byl.pages.dev';
const origins=[isTest?'https://vsv-test.pages.dev':'https://vsv-byl.pages.dev',...(Deno.env.get('VSV_ALLOWED_ORIGINS')||'').split(',').filter(Boolean)].map(value=>{const u=new URL(value.trim());if(u.origin!==value.trim()||u.protocol!=='https:'&&!(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname)))throw Error('Origine de déploiement invalide');return u.origin;});
if(isTest&&origins.some(origin=>origin!=='https://vsv-test.pages.dev'))throw Error('Origine non autorisée sur TEST. Utilisez uniquement vsv-test.pages.dev.');
const connectors=createConnectors({env:(name:string)=>Deno.env.get(name),db,storage});
Deno.serve(createApi({db,auth,storage,connectors,origins,siteUrl}));
