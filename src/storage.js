import {syncProjectNeeds} from './purchase-model.js';
import {decodeBackup,encodeBackup} from './backup.js';
// Clé historique conservée ; migration additive des courses, sans rejouer les mouvements. L’écriture remplace un seul instantané atomique.
const key='vsv.projects.v1';
export function readAll(storage=localStorage){const value=storage.getItem(key);if(value===null)return {projects:[],meetings:[],pvs:[]};const data=decodeBackup(value);if(data.repositories)data.repositories.suppliers??=[];return data;}
export function writeAll(data,storage=localStorage){const existing=readAll(storage);const combined={...existing,...data,pvs:Object.hasOwn(data,'pvs')?data.pvs:existing.pvs};syncProjectNeeds(combined);storage.setItem(key,encodeBackup(combined));}
export function read(storage=localStorage){return readAll(storage).projects;}
export function write(projects,storage=localStorage){const existing=readAll(storage);writeAll({...existing,projects},storage);}
