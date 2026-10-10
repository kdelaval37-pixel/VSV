import {decode,encode} from './model.js';
const key='vsv.projects.v1';
export function read(storage=localStorage){const value=storage.getItem(key);return value===null?[]:decode(value);}
export function write(projects,storage=localStorage){storage.setItem(key,encode(projects));}
