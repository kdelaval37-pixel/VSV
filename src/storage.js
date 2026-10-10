import {decodeBackup,encodeBackup} from './backup.js';
// Conserver la clé historique : la lecture accepte V1 ; une écriture atomique passe à V2.
const key='vsv.projects.v1';
export function readAll(storage=localStorage){const value=storage.getItem(key);return value===null?{projects:[],meetings:[]}:decodeBackup(value);}
export function writeAll(data,storage=localStorage){storage.setItem(key,encodeBackup(data));}
export function read(storage=localStorage){return readAll(storage).projects;}
export function write(projects,storage=localStorage){const existing=readAll(storage);writeAll({...existing,projects},storage);}
