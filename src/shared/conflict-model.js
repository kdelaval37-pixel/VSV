import {flatten,equal} from './records.js';
export const fieldNames={name:'Nom',title:'Titre',summary:'Résumé',object:'Objet',context:'Contexte',objectives:'Objectifs',goals:'Objectifs',place:'Lieu',address:'Adresse',date:'Date',start:'Début',end:'Fin',startDate:'Date de début',endDate:'Date de fin',startTime:'Heure de début',endTime:'Heure de fin',owner:'Responsable',status:'Statut',type:'Type',participants:'Participants',present:'Présents',excused:'Excusés',agenda:'Ordre du jour',description:'Description',discussions:'Discussions',discussion:'Discussions',notes:'Notes',decisions:'Décisions',actions:'Actions',task:'Tâche',responsible:'Responsable',deadline:'Échéance',practical:'Informations pratiques',attachments:'Documents à joindre',attachment:'Pièce associée',externalId:'Numéro Paheko',fullName:'Nom complet',email:'Courriel',dues:'Cotisation',phone:'Téléphone',category:'Catégorie',archived:'Archivé',expenses:'Dépenses',revenues:'Recettes',income:'Recettes',price:'Prix',salePrice:'Prix de vente',quantity:'Quantité',unit:'Unité',successCriteria:'Critères de réussite',criteria:'Critères précédemment renseignés',target:'Cible',condition:'Condition',value:'Valeur',verification:'Moyen de vérification',memberTotal:'Effectif de référence',powers:'Pouvoirs',resolutions:'Résolutions',votes:'Votes',source:'Document source',snapshot:'Copie de référence',budget:'Budget',rules:'Règles utilisées',signer:'Signataire',convener:'Personne qui convoque',actualSendDate:'Date d’envoi effectif',plannedSendDate:'Date d’envoi prévue',issuedDate:'Date d’émission',public:'Public',audience:'Public',team:'Équipe',proxies:'Pouvoirs',organizer:'Organisateur',facilitator:'Animation',writer:'Rédaction',begin:'Début',attendance:'Participation'};
const hidden=new Set(['id','createdAt','updatedAt','modifiedAt','memberRefs','placeId','signerId']);
export const fieldLabel=k=>fieldNames[k]||k.replace(/([a-z])([A-Z])/g,'$1 $2').replaceAll('_',' ');
export function readable(value,depth=0){
 if(value===undefined||value===null||value==='')return 'Non renseigné';
 if(typeof value==='boolean')return value?'Oui':'Non';
 if(typeof value!=='object')return String(value);
 if(depth>12)return 'Contenu imbriqué : consulter les détails techniques ou la copie téléchargée.';
 if(Array.isArray(value))return value.length?value.map((v,i)=>`${i+1}. ${readable(v,depth+1)}`).join('\n'):'Aucun élément';
 return Object.entries(value).filter(([k])=>!hidden.has(k)).map(([k,v])=>`${fieldLabel(k)} : ${readable(v,depth+1)}`).join('\n')||'Aucune information affichable';
}
export function conflictComparison({error,local,base}){
 const remoteRow=error.remote,record=error.record|| (remoteRow?`${remoteRow.table}/${remoteRow.kind}/${remoteRow.id}`:'');
 const row=flatten(local||{}).find(r=>`${r.table}/${r.kind}/${r.id}`===record),mine=row?.payload;
 const remote=remoteRow?.deleted?null:remoteRow?.payload;
 const fields=[];
 const walk=(a,b,c,path=[])=>{
  const objects=[a,b,c].filter(v=>v!==undefined&&v!==null);
  if(objects.length&&objects.every(v=>typeof v==='object'&&!Array.isArray(v))){
   for(const k of new Set(objects.flatMap(Object.keys)))if(!hidden.has(k))walk(a?.[k],b?.[k],c?.[k],[...path,k]);return;
  }
  if(equal(b,c))return;
  const localChanged=base!==undefined&&!equal(a,b),remoteChanged=base!==undefined&&!equal(a,c);
  fields.push({path:path.join('.'),label:path.map(fieldLabel).join(' › '),base:a,local:b,remote:c,localChanged,remoteChanged,both:localChanged&&remoteChanged});
 };
 if(mine!==undefined&&remote!==undefined)walk(base,mine,remote);
 return {record,kind:row?.kind||remoteRow?.kind,title:mine?.name||mine?.title||remote?.name||remote?.title||'Élément partagé',mine,remote,base,hasBase:base!==undefined,deleted:!!remoteRow?.deleted,fields};
}
