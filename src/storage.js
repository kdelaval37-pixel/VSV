import {decodeBackup,encodeBackup} from './backup.js';
// Clé historique conservée. V1/V2 sont lus ; l'écriture atomique enregistre les trois catégories en V3.
const key='vsv.projects.v1';
export function readAll(storage=localStorage){const value=storage.getItem(key);return value===null?{projects:[],meetings:[],pvs:[]}:decodeBackup(value);}
export function writeAll(data,storage=localStorage){const combined={...data,pvs:Object.hasOwn(data,'pvs')?data.pvs:readAll(storage).pvs};storage.setItem(key,encodeBackup(combined));}
export function read(storage=localStorage){return readAll(storage).projects;}
export function write(projects,storage=localStorage){const existing=readAll(storage);writeAll({...existing,projects},storage);}
