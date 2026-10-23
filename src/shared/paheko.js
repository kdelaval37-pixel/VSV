// Lecture serveur uniquement. Les catégories ne confèrent aucun droit VSV.
import {parseCsv,detectSeparator,decodeCsv,isPaheko} from '../csv.js';
import {pahekoId} from '../member-identity.js';

import {connectorTarget} from './connector-target.js';
const MAX_BYTES=20000000, MAX_ROWS=50000;
const quote=value=>'"'+value.replaceAll('"','""')+'"';

export function pahekoConnector({env,fetcher=fetch}){
 const target=connectorTarget(env),setting=name=>env(target.pahekoPrefix+name);
 const ready=()=>target.enabled&&!!setting('HOST')&&
   !!(setting('CATEGORY_IDS')||setting('CSV_URL'));

 async function preview(){
  if(!ready())throw Error('Source Paheko non configurée pour cet environnement.');
  const host=setting('HOST');
  // Un nom DNS public exact, sans protocole, port, chemin ou adresse IP.
  if(!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(host)||host.endsWith('.localhost')||host.endsWith('.local'))throw Error('Hôte Paheko non autorisé.');
  const idsText=setting('CATEGORY_IDS');
  let ids=[];
  if(idsText){
   ids=idsText.split(',').map(x=>x.trim());
   if(ids.length>20||ids.some(x=>!(/^[1-9]\d{0,8}$/).test(x))||new Set(ids).size!==ids.length)throw Error('Catégories Paheko invalides : numéros distincts séparés par des virgules (20 maximum).');
   if(!setting('AUTHORIZATION'))throw Error('Autorisation API Paheko manquante.');
  }
  const urls=ids.length?ids.map(id=>`https://${host}/api/user/category/${id}.csv`):[setting('CSV_URL')];
  // Valider toutes les destinations avant de transmettre les identifiants.
  for(const url of urls){const u=new URL(url);if(u.protocol!=='https:'||u.hostname!==host||u.port||u.username||u.password||u.hash)throw Error('Source Paheko non autorisée.');}
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
  let byteCount=0,headers=null;
  const merged=[],seen=new Set(),categories=[];
  try{
   for(let i=0;i<urls.length;i++){
    const label=ids[i]?`catégorie ${ids[i]}`:'export';
    let response;
    try{response=await fetcher(urls[i],{method:'GET',headers:setting('AUTHORIZATION')?{Authorization:setting('AUTHORIZATION')}:{},redirect:'error',signal:controller.signal});}
    catch{throw Error(`Lecture Paheko interrompue (${label}). Aucun import partiel : réessayez la récupération complète.`);}
    if(!response.ok)throw Error(`Lecture Paheko refusée (${label}, HTTP ${response.status}). Aucun import partiel.`);
    if(Number(response.headers.get('content-length'))>MAX_BYTES-byteCount){await response.body?.cancel();throw Error('Export Paheko trop volumineux (20 Mo au total).');}
    const chunks=[],reader=response.body?.getReader();let length=0;
    if(!reader)throw Error(`Export Paheko vide (${label}).`);
    try{while(true){const {done,value}=await reader.read();if(done)break;byteCount+=value.byteLength;length+=value.byteLength;if(byteCount>MAX_BYTES){await reader.cancel();throw Error('Export Paheko trop volumineux (20 Mo au total).');}chunks.push(value);}}
    finally{reader.releaseLock();}
    const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
    const {text}=decodeCsv(bytes),options={allowHeaderOnly:true};
    const rows=parseCsv(text,detectSeparator(text,options),options),head=rows[0];
    if(!isPaheko(head)||new Set(head).size!==head.length)throw Error(`Colonnes CSV Paheko non reconnues (${label}). Aucun import partiel.`);
    headers??=head;
    if(head.length!==headers.length||headers.some(h=>!head.includes(h)))throw Error('Colonnes différentes entre catégories Paheko. Aucun import partiel.');
    const order=headers.map(h=>head.indexOf(h)),idColumn=headers.indexOf('Numéro de membre');
    for(const row of rows.slice(1)){
     if(row.length!==head.length)throw Error(`Ligne CSV incomplète (${label}). Aucun import partiel.`);
     const aligned=order.map(index=>row[index]),id=pahekoId(aligned[idColumn]);
     if(!id)throw Error(`Numéro de membre absent (${label}). Aucun import partiel.`);
     if(seen.has(id))throw Error('Numéro de membre répété dans les exports Paheko. Aucune fusion automatique : vérifiez la source puis récupérez de nouveau les catégories.');
     seen.add(id);merged.push(aligned);
     if(merged.length>MAX_ROWS)throw Error('Export Paheko trop volumineux (50 000 membres maximum).');
    }
    categories.push({id:ids[i]||null,count:rows.length-1});
   }
   if(!merged.length)throw Error('Aucun membre dans les catégories sélectionnées. Annuaire VSV inchangé.');
   return {csv:[headers,...merged].map(row=>row.map(quote).join(',')).join('\r\n'),version:env('VSV_PAHEKO_VERSION')||'Version non confirmée',categories,total:merged.length,message:'Lecture seule : toutes les catégories sélectionnées ont été récupérées. Vérifiez l’aperçu avant de confirmer. Les numéros de membre restent du texte ; aucun droit VSV ni état de cotisation n’est déduit de la catégorie. Aucune écriture dans Paheko.'};
  }finally{clearTimeout(timer);}
 }
 return {ready,preview};
}
