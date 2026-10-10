import {decode as decodeProjects, validate, merge as mergeProjects} from './model.js';
import {validateMeeting} from './meeting-model.js';
import {validatePv} from './pv-model.js';
export function validateCollection(data) {
  for(const [key,check] of [['projects',validate],['meetings',validateMeeting],['pvs',validatePv]]) {
    if(!Array.isArray(data[key])||data[key].length>10000)throw Error('Liste de documents invalide.');
    data[key].forEach(check);
    if(new Set(data[key].map(item=>item.id)).size!==data[key].length)throw Error('Identifiants de documents en double.');
  }
  return data;
}
export function decodeBackup(text) {
  const data=JSON.parse(text);
  if(data?.format==='vsv-projects'&&data.version===1)return validateCollection({projects:decodeProjects(text),meetings:[],pvs:[]});
  if(data?.format!=='vsv-documents'||![2,3].includes(data.version))throw Error('Format de sauvegarde invalide ou version non prise en charge.');
  const collection={projects:data.projects,meetings:data.meetings,pvs:data.version===2?[]:data.pvs};
  return validateCollection(collection);
}
export function encodeBackup(data) {
  const collection={...data,pvs:Object.hasOwn(data,'pvs')?data.pvs:[]};validateCollection(collection);
  return JSON.stringify({format:'vsv-documents',version:3,exportedAt:new Date().toISOString(),projects:collection.projects,meetings:collection.meetings,pvs:collection.pvs},null,2);
}
function mergeDocuments(existing,incoming){const ids=new Set(existing.map(m=>m.id));return [...existing,...incoming.map(m=>{const copy=structuredClone(m);if(ids.has(copy.id)){copy.id=crypto.randomUUID();copy.title+=' (importé)';}ids.add(copy.id);return copy;})];}
export function mergeBackup(existing,incoming) {
  const old={...existing,pvs:existing.pvs??[]},added={...incoming,pvs:incoming.pvs??[]};validateCollection(old);validateCollection(added);
  return {projects:mergeProjects(old.projects,added.projects),meetings:mergeDocuments(old.meetings,added.meetings),pvs:mergeDocuments(old.pvs,added.pvs)};
}
