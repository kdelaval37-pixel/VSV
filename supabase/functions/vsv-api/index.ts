import {createApi} from '../../../src/shared/server.js';
const url=Deno.env.get('SUPABASE_URL')!,secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// Ces valeurs sont injectées uniquement dans l’environnement serveur Supabase.
async function api(path:string,method='GET',body?:unknown,token=secret){const r=await fetch(url+path,{method,headers:{apikey:secret,Authorization:'Bearer '+token,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json().catch(()=>null);if(!r.ok)throw Object.assign(Error(data?.message||data?.msg||'Opération serveur refusée.'),{definite:true,code:data?.code});return data;}
const rpc=(name:string,p:unknown)=>api('/rest/v1/rpc/'+name,'POST',p);
const first=async(path:string)=>(await api('/rest/v1/'+path))[0];
const db={
 access:(id:string)=>first('vsv_access?user_id=eq.'+encodeURIComponent(id)),
 snapshot:(id:string)=>rpc('vsv_snapshot',{p_actor:id}),
 migration:(id:string)=>first('vsv_migrations?id=eq.'+encodeURIComponent(id)),
 request:(id:string)=>first('vsv_requests?id=eq.'+encodeURIComponent(id)),
 commit:(p:any)=>rpc('vsv_commit',{p_actor:p.actor,p_id:p.id,p_fingerprint:p.fingerprint,p_revision:p.revision,p_changes:p.changes,p_result:p.result,p_migration:p.migration}),
 accessList:()=>api('/rest/v1/vsv_access?order=updated_at.desc'),invites:()=>api('/rest/v1/vsv_invites?order=updated_at.desc'),files:()=>api('/rest/v1/vsv_files?order=created_at.desc'),
 setAccess:(actor:string,target:string,active:boolean)=>rpc('vsv_set_access',{p_actor:actor,p_target:target,p_active:active}),
 claimInvite:(actor:string,email:string)=>rpc('vsv_claim_invite',{p_actor:actor,p_email:email}),
 finishInvite:(email:string,state:string)=>api('/rest/v1/vsv_invites?email=eq.'+encodeURIComponent(email),'PATCH',{state,updated_at:new Date().toISOString()}),
 addAccess:async(id:string,email:string)=>{await api('/rest/v1/vsv_access','POST',{user_id:id,email,active:true,technical_admin:false});},
 addFile:async(f:any)=>{if(!await first('vsv_files?id=eq.'+f.id))await api('/rest/v1/vsv_files','POST',f);}
};
const auth={user:async(token:string)=>{try{return await api('/auth/v1/user','GET',undefined,token);}catch{return null;}},invite:async(email:string,redirect:string)=>{const result=await api('/auth/v1/invite?redirect_to='+encodeURIComponent(redirect),'POST',{email});return result.user||result;}};
const storage={upload:async(path:string,bytes:Uint8Array,mime:string)=>{const r=await fetch(url+'/storage/v1/object/vsv-private/'+path,{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':mime,'x-upsert':'false'},body:Uint8Array.from(bytes).buffer});if(!r.ok){const e=await r.json();if(e.statusCode!=='409'&&e.error!=='Duplicate')throw Error('Fichier non enregistré.');}}};
const siteUrl=Deno.env.get('VSV_SITE_URL')||'https://vsv-byl.pages.dev';
const origins=['https://vsv-byl.pages.dev',...(Deno.env.get('VSV_ALLOWED_ORIGINS')||'').split(',').filter(Boolean)].map(value=>{const u=new URL(value.trim());if(u.origin!==value.trim()||u.protocol!=='https:'&&!(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname)))throw Error('Origine de déploiement invalide');return u.origin;});
Deno.serve(createApi({db,auth,storage,origins,siteUrl}));
