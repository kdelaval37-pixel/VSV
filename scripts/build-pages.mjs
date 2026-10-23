import {testTarget} from './test-target.mjs';
// Valider avant de toucher à dist ; une erreur ne laisse pas un paquet de production prêt à téléverser.
const target=process.env.VSV_BUILD_TARGET==='test'?testTarget(process.env):null;
await import('./vendor.mjs');
import {rm,mkdir,cp,readFile,writeFile,readdir} from 'node:fs/promises';
import {build} from 'esbuild';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp(process.env.VSV_MAINTENANCE==='1'?'maintenance.html':'index.html','dist/index.html');await cp('src','dist/src',{recursive:true,filter:p=>!['server.js','engine.js','connectors.js','google-oauth.js','rsvp.js','member-guards.js'].some(name=>p.endsWith('/shared/'+name))});await cp('_headers','dist/_headers');
await writeFile('dist/_headers',(await readFile('dist/_headers','utf8')).replace('camera=()','camera=(self)').replace("object-src 'none'","media-src 'self' blob:; object-src 'none'"));
console.log('Sources copiées ; compilation du paquet en cours.');
// VSV-TEST : configuration publique explicite ; aucune retombée sur la production.
if(process.env.VSV_BUILD_TARGET==='test'){
 const {writeFile,readFile}=await import('node:fs/promises');
 const {url,key,redirect}=target;const u=new URL(url),site=new URL(redirect);
 const original=await readFile('src/shared/config.js','utf8');
 await writeFile('dist/src/shared/config.js',original.replace(/testConfig\|\|\{[^;]+\};/, 'testConfig||'+JSON.stringify({url:u.origin,key,redirect:site.href})+';'));
 const headers=(await readFile('_headers','utf8')).replace('camera=()','camera=(self)').replace("object-src 'none'","media-src 'self' blob:; object-src 'none'");await writeFile('dist/_headers',headers.replaceAll('https://zbbxhhtqcyryabfftbvq.supabase.co',u.origin).replaceAll('wss://zbbxhhtqcyryabfftbvq.supabase.co','wss://'+u.host));
 console.log('Configuration publique VSV-TEST injectée dans dist/.');
}

// Un graphe d'import versionné : aucun ancien app.js ne peut piloter un nouveau menu.
async function fingerprint(dir){let all='';for(const e of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const p=dir+'/'+e.name;all+=e.isDirectory()?await fingerprint(p):p+':'+createHash('sha256').update(await readFile(p)).digest('hex');}return all;}
const commit=execFileSync('git',['rev-parse','--short=10','HEAD'],{encoding:'utf8'}).trim();
const digest=createHash('sha256').update(await fingerprint('dist/src')).update(await readFile('dist/index.html')).digest('hex').slice(0,10);
const release={id:commit+'-'+digest,commit,target:target?'VSV-TEST':'production',builtAt:new Date().toISOString()};
await writeFile('dist/src/version.js','export const release='+JSON.stringify(release)+';');
const bundle=await build({entryPoints:['dist/src/boot.js'],outdir:'dist/assets',bundle:true,splitting:true,format:'esm',platform:'browser',target:['safari15','chrome100','firefox100'],entryNames:'app-[hash]',chunkNames:'module-[hash]',metafile:true,legalComments:'eof'});
const entry=Object.entries(bundle.metafile.outputs).find(([,o])=>o.entryPoint==='dist/src/boot.js')[0].replace(/^dist\//,'');
let html=await readFile('dist/index.html','utf8');
for(const name of ['style','ui-polish']){const bytes=await readFile('dist/src/'+name+'.css'),hash=createHash('sha256').update(bytes).digest('hex').slice(0,10),dest='assets/'+name+'-'+hash+'.css';await writeFile('dist/'+dest,bytes);html=html.replace('src/'+name+'.css',dest);}
html=html.replace('src/boot.js',entry);await writeFile('dist/index.html',html);
await writeFile('dist/version.json',JSON.stringify(release,null,2));
const outputs=Object.keys(bundle.metafile.outputs).map(p=>p.replace(/^dist\//,''));
await writeFile('dist/build-manifest.json',JSON.stringify({...release,entry,files:outputs},null,2));
console.log('Version '+release.id+' — '+release.target+' : graphe applicatif compilé et styles identifiés.');
