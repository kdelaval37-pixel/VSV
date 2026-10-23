import {pahekoId,sameMember,assertMemberUniqueness} from './member-identity.js';
// Parseur à états : séparateurs, guillemets doublés et retours à la ligne dans une cellule.
import {member,memberName,normalize,validateRepositories} from './references-model.js';
export function parseCsv(text,separator=';'){if(![',',';','\t'].includes(separator))throw Error('Séparateur invalide.');text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],cell='',quoted=false,closed=false,start=true;for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;}else if(c==='"'){if(!start)throw Error('Guillemets CSV invalides.');quoted=true;start=false;}else if(c===separator){row.push(cell);cell='';closed=false;start=true;}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(c=>c.trim()))rows.push(row);row=[];cell='';closed=false;start=true;}else{if(closed&&c!==' '&&c!=='\t')throw Error('Texte après une cellule entre guillemets.');if(!closed)cell+=c;start=false;}}if(quoted)throw Error('Cellule entre guillemets non terminée.');if(cell||row.length){row.push(cell);if(row.some(c=>c.trim()))rows.push(row);}if(rows.length<2)throw Error('Le CSV doit contenir un en-tête et au moins une ligne.');if(rows[0].length<2)throw Error('Une seule colonne détectée : vérifiez le séparateur.');return rows;}
export function detectSeparator(text){const candidates=[',',';','\t'].map(separator=>{try{const rows=parseCsv(text,separator),width=rows[0].length;return {separator,score:rows.slice(1,30).filter(r=>r.length===width).length*100+width};}catch{return {separator,score:-1};}}).sort((a,b)=>b.score-a.score);if(candidates[0].score<0)throw Error('CSV illisible : vérifiez l’encodage et le séparateur.');return candidates[0].separator;}
export function decodeCsv(buffer,encoding='auto'){if(encoding==='auto'){const bytes=new Uint8Array(buffer);if(bytes[0]===255&&bytes[1]===254)encoding='utf-16le';else if(bytes[0]===254&&bytes[1]===255)encoding='utf-16be';}if(encoding!=='auto')return {text:new TextDecoder(encoding,{fatal:true}).decode(buffer),encoding};try{return {text:new TextDecoder('utf-8',{fatal:true}).decode(buffer),encoding:'utf-8'};}catch{return {text:new TextDecoder('windows-1252').decode(buffer),encoding:'windows-1252'};}}
export const pahekoHeaders=['Numéro de membre','Nom & prénom','Adresse E-Mail','Adresse postale','Code postal','Ville','Numéro de téléphone',"Inscription à la lettre d'information","Date d'inscription",'Rattaché à','Membres rattachés','Catégorie'];
export const isPaheko=headers=>pahekoHeaders.every(h=>headers.includes(h));
export const csvFields=[['fullName','Nom complet (sans découpage)'],['phone','Téléphone (texte, facultatif)'],['postalCode','Code postal (texte, facultatif)'],['address','Adresse (facultative)'],['city','Ville (facultative)'],['externalId','Identifiant Paheko (texte)'],['lastName','Nom'],['firstName','Prénom'],['email','Courriel (facultatif)'],['category','Catégorie (facultative)'],['dues','Cotisation explicitement à jour (facultatif)'],['expires','Date d’expiration (facultative)'],['archived','État actif / archivé (facultatif)']];
export function suggestMapping(headers){if(isPaheko(headers)){return Object.fromEntries(csvFields.map(([k])=>[k,({externalId:headers.indexOf('Numéro de membre'),fullName:headers.indexOf('Nom & prénom'),email:headers.indexOf('Adresse E-Mail'),category:headers.indexOf('Catégorie')})[k]??-1]));}const aliases={fullName:['nom complet','nom & prenom'],phone:[],postalCode:[],address:[],city:[],externalId:['id','identifiant','numero','numero membre','numero de membre','id membre','numero_adherent'],lastName:['nom','nom de famille'],firstName:['prenom'],email:[],category:['categorie','categorie de membre'],dues:[],expires:[],archived:[]};return Object.fromEntries(csvFields.map(([k])=>[k,headers.findIndex(h=>aliases[k].includes(normalize(h)))]));}
function civilDate(s){if(!s)return '';let match=s.match(/^(\d{4})-(\d{2})-(\d{2})$/),v=match?`${match[1]}-${match[2]}-${match[3]}`:'';if(!match&&(match=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)))v=`${match[3]}-${match[2]}-${match[1]}`;try{return v&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v?v:'';}catch{return '';}}
export function previewMemberImport(repo,rows,mapping,decisions={}){
 const chosen=csvFields.map(([k])=>mapping[k]).filter(v=>v>=0);
 if(new Set(chosen).size!==chosen.length)throw Error('Une colonne ne peut pas alimenter plusieurs champs.');
 if(!Array.isArray(rows)||rows.length<2||rows.length>50001||rows.some(r=>!Array.isArray(r)||r.some(c=>typeof c!=='string')))throw Error('Lignes CSV invalides.');
 if(chosen.some(v=>!Number.isInteger(v)||v>=rows[0].length))throw Error('Association de colonne invalide.');
 if(!(mapping.fullName>=0)&&!(mapping.lastName>=0)&&!(mapping.firstName>=0))throw Error('Associez au moins un nom complet, nom ou prénom.');
 const frequencies=new Map(),entries=[];
 for(const row of rows.slice(1)){const id=mapping.externalId>=0?pahekoId(row[mapping.externalId]??''):'';if(id)frequencies.set(id,(frequencies.get(id)||0)+1);}
 for(let index=1;index<rows.length;index++){
  const row=rows[index],errors=[],warnings=[],patch={};
  const value=k=>mapping[k]>=0?String(row[mapping[k]]??'').trim():'';
  let incoming=member();
  for(const k of ['externalId','fullName','lastName','firstName','email','category','phone','postalCode','address','city']){incoming[k]=value(k);if(mapping[k]>=0)patch[k]=incoming[k];}
  if(row.length!==rows[0].length)errors.push('Nombre de cellules différent de l’en-tête.');
  if(!memberName(incoming))errors.push('Nom et prénom absents.');
  if(incoming.externalId&&frequencies.get(incoming.externalId)>1)errors.push('Identifiant Paheko répété : toutes ses lignes sont ignorées, sans choisir arbitrairement la première.');
  const dues=normalize(value('dues'));incoming.dues=['oui','a jour','1','true','paye','payee'].includes(dues)?'paid':['non','0','false','impaye','impayee','pas a jour'].includes(dues)?'unpaid':'unknown';
  if(mapping.dues>=0)patch.dues=incoming.dues;if(dues&&incoming.dues==='unknown')warnings.push('Cotisation ambiguë : inconnue pour un nouveau membre, valeur existante conservée.');
  incoming.expires=civilDate(value('expires'));if(mapping.expires>=0)patch.expires=incoming.expires;if(value('expires')&&!incoming.expires)warnings.push('Expiration non interprétable : valeur existante conservée si disponible.');
  const state=normalize(value('archived'));incoming.activity=['archive','archivee','inactif','inactive'].includes(state)?'archived':['actif','active'].includes(state)?'active':'unknown';
  if(['0','1','oui','non','true','false'].includes(state)&&['active-flag','archived-flag'].includes(mapping.stateMode)){const yes=['1','oui','true'].includes(state);incoming.activity=(mapping.stateMode==='archived-flag'?yes:!yes)?'archived':'active';}
  incoming.archived=incoming.activity==='archived';
  if(mapping.archived>=0){patch.archived=incoming.archived;patch.activity=incoming.activity;}
  if(state&&incoming.activity==='unknown')warnings.push('État ambigu : reste inconnu. Choisissez le sens de la colonne d’état ou ignorez cette information.');
  const exact=incoming.externalId?repo.members.filter(m=>pahekoId(m.externalId)===incoming.externalId):[],strongMatch=exact.length>0;
  let matches=exact,target=null,mode='create';
  if(exact.length===1){target=exact[0];mode='update';}
  else if(exact.length>1){mode='ambiguous';errors.push('Identifiant Paheko partagé par plusieurs fiches existantes : aucune fusion automatique.');}
  else{matches=repo.members.filter(m=>(!incoming.externalId||!pahekoId(m.externalId))&&([memberName(m),[m.lastName,m.firstName].filter(Boolean).join(' ')].some(n=>normalize(n)===normalize(memberName(incoming)))||incoming.email&&normalize(m.email)===normalize(incoming.email)));if(matches.length)mode='ambiguous';}
  const decision=decisions[index];
  if(decision==='skip')mode='skip';
  else if(decision==='create'){
   if(strongMatch)warnings.push('Identifiant Paheko déjà connu : la création distincte est interdite, la fiche existante reste la cible.');
   else{mode='create';target=null;}
  }else if(decision){
   const selected=matches.find(m=>m.id===decision);
   if(!selected||exact.length>1)errors.push('Rapprochement invalide.');else{target=selected;mode='update';}
  }
  if(target){incoming=memberPatch(target,patch);if(mode!=='skip'&&!errors.length&&sameMember(incoming,target))mode='unchanged';}
  entries.push({line:index+1,index,incoming,patch,target,mode,matches,strongMatch,errors,warnings});
 }
 const targets=new Map();for(const e of entries)if(['update','unchanged'].includes(e.mode)&&!e.errors.length){if(targets.has(e.incoming.id)){e.errors.push('Deux lignes visent le même membre.');targets.get(e.incoming.id).errors.push('Deux lignes visent le même membre.');}else targets.set(e.incoming.id,e);}
 return entries;
}
export function memberPatch(target,patch){const next={...target,...patch,id:target.id};if(!patch.externalId)next.externalId=target.externalId;if(patch.category!==undefined&&!patch.category.trim())next.category=target.category;if(patch.activity==='unknown'&&target.archived){next.archived=true;next.activity=target.activity??'archived';}if(patch.dues==='unknown')next.dues=target.dues;if(patch.expires==='')next.expires=target.expires;return next;}
export const memberImportSummary=entries=>({created:entries.filter(e=>e.mode==='create'&&!e.errors.length).length,updated:entries.filter(e=>e.mode==='update'&&!e.errors.length).length,unchanged:entries.filter(e=>e.mode==='unchanged'&&!e.errors.length).length,ambiguous:entries.filter(e=>e.mode==='ambiguous').length,invalid:entries.filter(e=>e.errors.length).length,ignored:entries.filter(e=>e.errors.length||e.mode==='skip').length});
export function applyMemberImport(repo,entries,file){
 if(entries.some(e=>e.mode==='ambiguous'))throw Error('Résolvez les rapprochements ambigus ou ignorez les lignes concernées.');
 assertMemberUniqueness(repo.members);
 const next=structuredClone(repo);let created=0,updated=0,unchanged=0,skipped=0;const anomalies=[];
 for(const e of entries){
  if(e.errors.length||e.mode==='skip'){skipped++;anomalies.push(`Ligne ${e.line} : ${e.errors.join(' ; ')||'ignorée explicitement'}`);continue;}
  anomalies.push(...e.warnings.map(w=>`Ligne ${e.line} : ${w}`));
  const ext=pahekoId(e.incoming.externalId),matches=ext?next.members.filter(m=>pahekoId(m.externalId)===ext):[];
  let target=matches[0]||next.members.find(m=>m.id===e.incoming.id);
  if(target){const incoming=memberPatch(target,e.patch??e.incoming);if(sameMember(incoming,target)){unchanged++;continue;}if(!e.target||!sameMember(target,e.target))throw Error('Annuaire modifié depuis l’aperçu : examinez de nouveau l’import.');const i=next.members.findIndex(m=>m.id===target.id);next.members[i]=incoming;updated++;}
  else{if(e.mode!=='create')throw Error('Membre à mettre à jour introuvable.');next.members.push(structuredClone(e.incoming));created++;}
 }
 if(!created&&!updated&&!unchanged)throw Error('Aucune ligne exploitable : annuaire inchangé.');
 assertMemberUniqueness(next.members);
 next.memberCategories=[...new Set([...(next.memberCategories??[]),...next.members.map(m=>m.category).filter(Boolean)])];
 next.lastImport={date:new Date().toISOString(),file,created,updated,unchanged,skipped,anomalies};return validateRepositories(next);
}
