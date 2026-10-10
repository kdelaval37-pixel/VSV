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
  if(data.repositories!==undefined)validateRepositories(data.repositories);
  if(data.preferences!==undefined)validatePreferences(data.preferences);
  return data;
}
export function decodeBackup(text) {
  const data=JSON.parse(text);
  if(data?.format==='vsv-projects'&&data.version===1)return validateCollection({projects:decodeProjects(text),meetings:[],pvs:[]});
  if(data?.format!=='vsv-documents'||![2,3,4].includes(data.version))throw Error('Format de sauvegarde invalide ou version non prise en charge.');
  const collection={projects:data.projects,meetings:data.meetings,pvs:data.version===2?[]:data.pvs};
  if(data.version===4){if(!data.repositories||!data.preferences)throw Error('Référentiels et préférences manquants.');collection.repositories=data.repositories;collection.preferences=data.preferences;}
  return validateCollection(collection);
}
export function encodeBackup(data) {
  const collection={...data,pvs:Object.hasOwn(data,'pvs')?data.pvs:[]};validateCollection(collection);
  return JSON.stringify({format:'vsv-documents',version:collection.repositories?4:3,exportedAt:new Date().toISOString(),projects:collection.projects,meetings:collection.meetings,pvs:collection.pvs,...(collection.repositories?{repositories:collection.repositories,preferences:collection.preferences}: {})},null,2);
}
function mergeDocuments(existing,incoming){const ids=new Set(existing.map(m=>m.id));return [...existing,...incoming.map(m=>{const copy=structuredClone(m);if(ids.has(copy.id)){copy.id=crypto.randomUUID();copy.title+=' (importé)';}ids.add(copy.id);return copy;})];}
export function mergeBackup(existing,incoming) {
  const old={...existing,pvs:existing.pvs??[]},added={...incoming,pvs:incoming.pvs??[]};validateCollection(old);validateCollection(added);
  return {projects:mergeProjects(old.projects,added.projects),meetings:mergeDocuments(old.meetings,added.meetings),pvs:mergeDocuments(old.pvs,added.pvs),...(old.repositories||added.repositories?{repositories:old.repositories&&added.repositories?mergeRepositories(old.repositories,added.repositories):structuredClone(old.repositories??added.repositories)}:{}),...(old.preferences||added.preferences?{preferences:structuredClone(added.preferences??old.preferences)}:{})};
}
