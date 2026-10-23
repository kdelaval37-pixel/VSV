// Parcours navigateur réel, réponses du connecteur simulées, aucun accès Paheko.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['server.js'],{env:{...process.env,VSV_PORT:'4198'},stdio:'pipe'});
let browser;
try {
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(Error('Server exited '+code)));});
 browser=await chromium.launch({headless:true,...(process.env.VSV_CHROMIUM_PATH?{executablePath:process.env.VSV_CHROMIUM_PATH}:{}),args:['--no-sandbox']});
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://127.0.0.1:4198/',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html lang="fr"><body><main id="test-app"></main></body></html>'}));
 await page.goto('http://127.0.0.1:4198/');
 await page.evaluate(async()=>{
  const {createReferencesUI}=await import('/src/references-ui.js');
  const {installShared}=await import('/src/shared/runtime.js');
  const {repositories,preferences}=await import('/src/references-model.js');
  const {pahekoHeaders}=await import('/src/csv.js');
  window.pahekoCalls=[];window.testRepo=repositories();
  const csv=[pahekoHeaders,['0007','Membre fictif','fictif@example.invalid','','','','','','','','','Bureau']].map(row=>row.map(v=>'"'+v.replaceAll('"','""')+'"').join(',')).join('\n');
  installShared({access:{technical_admin:true},call:async p=>{window.pahekoCalls.push(p.action);if(p.action==='connector-status')return {gmail:{connected:false,configured:false,canConnect:false,message:'Non configuré'},paheko:{configured:true,message:'Source de test'},canSend:false};if(p.action==='paheko-preview')return {csv,total:1};throw Error('Écriture inattendue : '+p.action);}});
  createReferencesUI({getRepositories:()=>window.testRepo,getPreferences:()=>preferences(),persist:()=>{throw Error('Écriture inattendue');},download:()=>{},importFile:()=>{},blocked:()=>false,onUpdate:()=>{}}).settings(document.querySelector('#test-app'));
 });
 await page.locator('#settings-google').click();
 await page.locator('[data-paheko]').click();
 await page.getByText('Export Paheko VSV reconnu', {exact:false}).waitFor();
 const d=page.locator('dialog').last();
 assert.equal(await d.locator('[data-csv-file]').evaluate(input=>input.files[0]?.name),'Paheko-test.csv');
 assert.match(await d.innerText(),/1 lignes détectées/);
 await d.locator('[data-preview-import]').click();
 assert.match(await d.innerText(),/1 nouveaux ; 0 mises à jour/);
 assert.match(await d.innerText(),/0007/);
 assert.equal(await page.evaluate(()=>window.testRepo.members.length),0);
 assert.deepEqual(await page.evaluate(()=>window.pahekoCalls.filter(x=>x!=='connector-status')),['paheko-preview']);
 await d.locator('[data-close]').click();
 await page.locator('#settings-csv').click();
 assert.equal(await page.locator('dialog').last().locator('[data-csv-file]').evaluate(input=>input.files.length),0);
 assert.deepEqual(errors,[]);
 console.log('Paramètres > connexion Paheko > fichier préchargé > aperçu sans écriture ; import manuel toujours disponible : OK (connecteur simulé).');
}finally{await browser?.close();server.kill();}
