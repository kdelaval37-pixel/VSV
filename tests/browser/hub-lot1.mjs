import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {navigate} from './navigation.mjs';
const output=process.env.VSV_CAPTURE_DIR||'/tmp/vsv-hub-lot1';await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.VSV_BROWSER_EXECUTABLE||'/usr/bin/chromium',args:['--no-sandbox']});
try{
 for(const [name,width,dark,before] of [['avant',1366,false,true],['apres',1366,false,false],['mobile-sombre',390,true,false]]){
  const ctx=await browser.newContext({viewport:{width,height:900},colorScheme:dark?'dark':'light'}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  if(before){const source=execFileSync('git',['show','2cf8763:src/references-ui.js'],{encoding:'utf8'});await page.route('**/src/references-ui.js',r=>r.fulfill({contentType:'text/javascript',body:source}));}
  await page.goto(process.env.VSV_TEST_URL||'http://127.0.0.1:4193');await navigate(page,'settings');await page.locator('#settings-csv').click();const d=page.locator('dialog').last();
  await d.locator('[data-csv-file]').setInputFiles({name:'exemple-fictif.csv',mimeType:'text/csv',buffer:Buffer.from('id;nom complet;courriel\n0007;Adhérent fictif de démonstration;fictif@example.invalid\n0008;;absent@example.invalid')});
  await d.locator('[data-preview-import]').click();if(!before)assert.match(await d.innerText(),/1 lignes ignorées au total/);
  await d.locator('[data-confirm-import]').scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/${name}.png`});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Pas de défilement horizontal global');
  await d.locator('[data-close]').click();await page.reload();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('vsv.projects.v1')||'{}').repositories?.members?.length||0),0,'Annuler ne modifie pas l’annuaire');assert.deepEqual(errors,[]);await ctx.close();
 }
 console.log('Captures avant/après et mobile sombre ; bilan ignorées, annulation et largeur : OK');
}finally{await browser.close();}
