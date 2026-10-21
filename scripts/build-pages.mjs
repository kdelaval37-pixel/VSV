import './vendor.mjs';
import {rm,mkdir,cp} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp(process.env.VSV_MAINTENANCE==='1'?'maintenance.html':'index.html','dist/index.html');await cp('src','dist/src',{recursive:true,filter:p=>!p.endsWith('/shared/server.js')&&!p.endsWith('/shared/engine.js')});await cp('_headers','dist/_headers');
console.log('Site statique prêt dans dist/ (sans migrations, tests, dépendances ou secrets serveur).');
// VSV-TEST : configuration publique explicite ; aucune retombée sur la production.
if(process.env.VSV_BUILD_TARGET==='test'){
 const {writeFile,readFile}=await import('node:fs/promises');
 const url=process.env.VSV_SUPABASE_URL,key=process.env.VSV_SUPABASE_PUBLISHABLE_KEY,redirect=process.env.VSV_SITE_URL;
 if(!url||!key||!redirect)throw Error('VSV-TEST exige VSV_SUPABASE_URL, VSV_SUPABASE_PUBLISHABLE_KEY et VSV_SITE_URL.');
 const u=new URL(url),site=new URL(redirect);
 if(u.protocol!=='https:'||site.protocol!=='https:'||!u.hostname.endsWith('.supabase.co')||u.pathname!=='/'||u.search||u.hash||u.username||u.password||site.username||site.password||site.search||site.hash||!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))throw Error('Configuration publique de test invalide. Utilisez une clé publishable, jamais une clé secrète.');
 const original=await readFile('src/shared/config.js','utf8');
 await writeFile('dist/src/shared/config.js',original.replace(/testConfig\|\|\{[^;]+\};/, 'testConfig||'+JSON.stringify({url:u.origin,key,redirect:site.href})+';'));
 const headers=await readFile('_headers','utf8');await writeFile('dist/_headers',headers.replaceAll('https://zbbxhhtqcyryabfftbvq.supabase.co',u.origin).replaceAll('wss://zbbxhhtqcyryabfftbvq.supabase.co','wss://'+u.host));
 console.log('Configuration publique VSV-TEST injectée dans dist/.');
}
