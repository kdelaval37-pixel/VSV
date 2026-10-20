import './vendor.mjs';
import {rm,mkdir,cp} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp(process.env.VSV_MAINTENANCE==='1'?'maintenance.html':'index.html','dist/index.html');await cp('src','dist/src',{recursive:true,filter:p=>!p.endsWith('/shared/server.js')&&!p.endsWith('/shared/engine.js')});await cp('_headers','dist/_headers');
console.log('Site statique prêt dans dist/ (sans migrations, tests, dépendances ou secrets serveur).');
