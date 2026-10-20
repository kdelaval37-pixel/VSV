import {validateReview} from './review-model.js';
import {validateOrders} from './order-model.js';
import {validatePurchases} from './purchase-model.js';
import {validateOperations} from './operations-model.js';
import {validateRepositories,validatePreferences,mergeRepositories} from './references-model.js';
import {decode as decodeProjects, validate, merge as mergeProjects} from './model.js';
import {validateMeeting} from './meeting-model.js';
import {validatePv} from './pv-model.js';
export function validateCollection(data) {
  for(const [key,check] of [['projects',validate],['meetings',validateMeeting],['pvs',validatePv]]) {
    if(!Array.isArray(data[key])||data[key].length>10000)throw Error('Liste de documents invalide.');
    data[key].forEach(check);
    if(new Set(data[key].map(item=>item.id)).size!==data[key].length)throw Error('Identifiants de documents en double.');
  }
  if(data.sharedFiles!==undefined){if(!Array.isArray(data.sharedFiles)||data.sharedFiles.length>1000)throw Error('Liste de fichiers invalide.');const ids=new Set();for(const f of data.sharedFiles){if(!f||typeof f.id!=='string'||!/^[a-f0-9]{64}$/.test(f.id)||ids.has(f.id)||typeof f.path!=='string'||!new RegExp('^'+f.id+'\\.(png|jpg|webp|pdf)$').test(f.path)||typeof f.name!=='string'||f.name.length>150||!['image/png','image/jpeg','image/webp','application/pdf'].includes(f.mime)||!Number.isSafeInteger(f.size)||f.size<1||f.size>5242880||typeof f.base64!=='string'||f.base64.length>7000000||!/^[A-Za-z0-9+/]+={0,2}$/.test(f.base64)||f.base64.length%4!==0||Math.floor(f.base64.length*3/4)-(f.base64.endsWith('==')?2:f.base64.endsWith('=')?1:0)!==f.size)throw Error('Fichier de sauvegarde invalide.');ids.add(f.id);}}
  if(data.reviews!==undefined){if(!Array.isArray(data.reviews)||data.reviews.length>10000||new Set(data.reviews.map(b=>b.id)).size!==data.reviews.length)throw Error('Liste de bilans invalide.');data.reviews.forEach(validateReview);}
  if(data.repositories!==undefined)validateRepositories(data.repositories);
  if(data.preferences!==undefined)validatePreferences(data.preferences);
  if(data.operations!==undefined&&(!data.repositories||!data.preferences))throw Error('Référentiels et préférences nécessaires aux stocks et à la caisse.');
  if(data.operations!==undefined){validateOperations(data.operations,data);validatePurchases(data.operations,data);if(data.operations.purchaseOrders!==undefined)validateOrders(data.operations.purchaseOrders);}
  return data;
}
export function decodeBackup(text) {
  const data=JSON.parse(text);
  if(data?.format==='vsv-projects'&&data.version===1)return validateCollection({projects:decodeProjects(text),meetings:[],pvs:[]});
  if(data?.format!=='vsv-documents'||![2,3,4,5,6,7,8,9,10].includes(data.version))throw Error('Format de sauvegarde invalide ou version non prise en charge.');
  const collection={projects:data.projects,meetings:data.meetings,pvs:data.version===2?[]:data.pvs};
  if(data.version>=4&&(data.version!==9||data.repositories)){if(!data.repositories||!data.preferences)throw Error('Référentiels et préférences manquants.');collection.repositories=data.repositories;collection.preferences=data.preferences;}
  if(data.version>=5&&(![8,9].includes(data.version)||data.operations)){if(!data.operations)throw Error('Stocks et caisse manquants.');collection.operations=data.operations;}
  if(data.version>=9){if(!Array.isArray(data.reviews))throw Error('Bilans manquants.');collection.reviews=data.reviews;}
  if(data.version===10){if(!Array.isArray(data.sharedFiles))throw Error('Fichiers manquants.');collection.sharedFiles=data.sharedFiles;}
  return validateCollection(collection);
}
export function encodeBackup(data) {
  const collection={...data,pvs:Object.hasOwn(data,'pvs')?data.pvs:[]};validateCollection(collection);
  return JSON.stringify({format:'vsv-documents',version:collection.sharedFiles?10:collection.reviews?.length||collection.projects.some(p=>p.successCriteria?.length)?9:collection.repositories?.suppliers?.length||collection.operations?.purchaseOrders?.length?8:collection.operations?.heldOrders||collection.operations?.paymentTransfers||collection.repositories?.articles.some(a=>a.tracking==='volume'||a.ingredient!==undefined)?7:collection.operations?.shoppingNeeds?6:collection.operations?5:collection.repositories?4:3,exportedAt:new Date().toISOString(),projects:collection.projects,meetings:collection.meetings,pvs:collection.pvs,...(collection.sharedFiles||collection.reviews?.length||collection.projects.some(p=>p.successCriteria?.length)?{reviews:collection.reviews??[]}:{}),...(collection.sharedFiles?{sharedFiles:collection.sharedFiles}:{}),...(collection.repositories?{repositories:collection.repositories,preferences:collection.preferences}: {}),...(collection.operations?{operations:collection.operations}:{})},null,2);
}
function mergeDocuments(existing,incoming){const ids=new Set(existing.map(m=>m.id));return [...existing,...incoming.map(m=>{const copy=structuredClone(m);if(ids.has(copy.id)){copy.id=crypto.randomUUID();copy.title+=' (importé)';}ids.add(copy.id);return copy;})];}
export function mergeBackup(existing,incoming) {
  const old={...existing,pvs:existing.pvs??[]},added={...incoming,pvs:incoming.pvs??[]};validateCollection(old);validateCollection(added);
  const merged={...(old.sharedFiles||added.sharedFiles?{sharedFiles:[...new Map([...(old.sharedFiles||[]),...(added.sharedFiles||[])].map(f=>[f.id,f])).values()]}:{}),...(old.reviews||added.reviews?{reviews:mergeDocuments(old.reviews??[],added.reviews??[])}:{}),projects:mergeProjects(old.projects,added.projects),meetings:mergeDocuments(old.meetings,added.meetings),pvs:mergeDocuments(old.pvs,added.pvs),...(old.repositories||added.repositories?{repositories:old.repositories&&added.repositories?mergeRepositories(old.repositories,added.repositories):structuredClone(old.repositories??added.repositories)}:{}),...(old.preferences||added.preferences?{preferences:structuredClone(added.preferences??old.preferences)}:{}),...(old.operations||added.operations?{operations:structuredClone(added.operations??old.operations)}:{})};if(added.operations&&added.operations.purchaseOrders===undefined&&old.operations?.purchaseOrders)merged.operations.purchaseOrders=structuredClone(old.operations.purchaseOrders);return validateCollection(merged);
}
