import {decode as decodeProjects, validate, merge as mergeProjects} from './model.js';
import {validateMeeting} from './meeting-model.js';
export function validateCollection(data) {
  for (const [key,check] of [['projects',validate],['meetings',validateMeeting]]) {
    if (!Array.isArray(data[key]) || data[key].length > 10000) throw Error('Liste de documents invalide.');
    data[key].forEach(check);
    if (new Set(data[key].map(item => item.id)).size !== data[key].length) throw Error('Identifiants de documents en double.');
  }
  return data;
}
export function decodeBackup(text) {
  const data = JSON.parse(text);
  if (data?.format === 'vsv-projects' && data.version === 1) return validateCollection({projects:decodeProjects(text),meetings:[]});
  if (data?.format !== 'vsv-documents' || data.version !== 2) throw Error('Format de sauvegarde invalide ou version non prise en charge.');
  validateCollection(data);
  return {projects:data.projects,meetings:data.meetings};
}
export function encodeBackup(data) {
  validateCollection(data);
  return JSON.stringify({format:'vsv-documents',version:2,exportedAt:new Date().toISOString(),projects:data.projects,meetings:data.meetings},null,2);
}
export function mergeBackup(existing,incoming) {
  validateCollection(existing);validateCollection(incoming);
  const ids = new Set(existing.meetings.map(m=>m.id));
  const meetings = incoming.meetings.map(m=>{
    const copy=structuredClone(m);
    if(ids.has(copy.id)){copy.id=crypto.randomUUID();copy.title+=' (importé)';}
    ids.add(copy.id);return copy;
  });
  return {projects:mergeProjects(existing.projects,incoming.projects),meetings:[...existing.meetings,...meetings]};
}
