import test from 'node:test';
import assert from 'node:assert/strict';
import {createConnectors} from '../src/shared/connectors.js';
import {pahekoHeaders,parseCsv,suggestMapping,previewMemberImport,applyMemberImport} from '../src/csv.js';
import {repositories} from '../src/references-model.js';
const csv=(rows,headers=pahekoHeaders)=>[headers,...rows].map(row=>row.map(v=>'"'+v.replaceAll('"','""')+'"').join(',')).join('\r\n');
const row=(id,name='Personne fictive',category='Membres actifs')=>[id,name,'fictif@example.invalid','','00123','','','','','','',category];
function setup({overrides={},exports={},handler}={}){
 const envs={SUPABASE_URL:'https://grgvwyedfrxnwhgdqpoj.supabase.co',VSV_PAHEKO_TEST_HOST:'paheko-test.example.invalid',VSV_PAHEKO_TEST_CATEGORY_IDS:'1,3,4',VSV_PAHEKO_TEST_AUTHORIZATION:'Basic fictif',VSV_PAHEKO_VERSION:'1.3.24',...overrides};
 const calls=[];
 const fetcher=async(url,options)=>{calls.push({url,options});if(handler)return handler(url,options);const id=url.match(/category\/(\d+)\.csv$/)?.[1];return new Response(exports[id]??csv([row('000'+id,'Personne '+id,id==='3'?'Administrateurs':id==='4'?'Bureau':'Membres actifs')]));};
 const api=createConnectors({env:k=>envs[k],fetcher,db:{},storage:{}});return {api,calls};
}
test('Paheko multi-catégories : 92 membres, GET seuls, aperçu puis réimport stable sans droits inventés',async()=>{
 const exports={1:csv(Array.from({length:85},(_,i)=>row(String(i+1).padStart(4,'0'),'Membre fictif '+i))),3:csv([row('0086','Admin fictif','Administrateurs')]),4:csv(Array.from({length:6},(_,i)=>row(String(i+87).padStart(4,'0'),'Bureau fictif '+i,'Bureau')))};
 const s=setup({exports}),p=await s.api.previewPaheko();assert.equal(p.total,92);assert.deepEqual(p.categories,[{id:'1',count:85},{id:'3',count:1},{id:'4',count:6}]);assert.equal(p.version,'1.3.24');assert.equal(s.calls.length,3);
 for(const c of s.calls){assert.equal(c.options.method,'GET');assert.equal(c.options.redirect,'error');assert.equal(c.options.headers.Authorization,'Basic fictif');}
 const rows=parseCsv(p.csv,','),mapping=suggestMapping(rows[0]),repo=repositories();const before=JSON.stringify(repo);
 const entries=previewMemberImport(repo,rows,mapping);assert.equal(JSON.stringify(repo),before);assert.equal(entries.length,92);
 const imported=applyMemberImport(repo,entries,'fictif.csv');assert.equal(imported.members[0].externalId,'0001');assert.equal(imported.members[85].category,'Administrateurs');assert.equal(imported.members[85].dues,'unknown');assert.equal(imported.members[85].technical_admin,undefined);
 const again=previewMemberImport(imported,rows,mapping);assert.ok(again.every(e=>e.mode==='unchanged'));assert.equal(applyMemberImport(imported,again,'fictif.csv').members.length,92);
});
test('Paheko : catégorie vide et colonnes réordonnées, accents, virgules et retours ligne conservés',async()=>{
 const reversed=[...pahekoHeaders].reverse();const value=row('001','Élodie, "test"\nSuite');
 const s=setup({exports:{1:'\uFEFF'+csv([value]),3:csv([]),4:csv([[...row('002','Bureau fictif','Bureau')].reverse()],reversed)}});
 const p=await s.api.previewPaheko(),rows=parseCsv(p.csv,',');assert.equal(p.total,2);assert.equal(rows[1][1],value[1]);assert.equal(rows[2][0],'002');assert.equal(rows[2][11],'Bureau');
});
test('Paheko : tout échec de catégorie interdit un résultat partiel',async()=>{
 for(const status of [401,403,404,500]){const s=setup({handler:url=>url.includes('/3.csv')?new Response('',{status}):new Response(csv([row('001')]))});await assert.rejects(s.api.previewPaheko(),new RegExp('HTTP '+status));assert.equal(s.calls.length,2);}
 const s=setup({handler:()=>{throw Error('secret fictif ne doit pas fuiter');}});await assert.rejects(s.api.previewPaheko(),e=>!e.message.includes('secret fictif')&&e.message.includes('interrompue'));
});
test('Paheko : doublon inter-catégories, numéro absent, schéma divergent et HTML refusés',async()=>{
 const cases=[{3:csv([row('0001')])},{3:csv([row('')])},{3:csv([row('003').concat('x')],pahekoHeaders.concat('extra'))},{3:'<html>Connexion</html>'},{3:csv([row('003').slice(0,4)])}];
 for(const exports of cases)await assert.rejects(setup({exports}).api.previewPaheko());
});
test('Paheko : TEST seul, validation complète des destinations et catégories avant toute lecture',async()=>{
 for(const overrides of [{SUPABASE_URL:'https://zbbxhhtqcyryabfftbvq.supabase.co'},{VSV_PAHEKO_TEST_CATEGORY_IDS:'1,1'},{VSV_PAHEKO_TEST_CATEGORY_IDS:'1,../3'},{VSV_PAHEKO_TEST_CATEGORY_IDS:'1,'},{VSV_PAHEKO_TEST_HOST:'127.0.0.1'},{VSV_PAHEKO_TEST_HOST:'paheko-test.example.invalid/path'},{VSV_PAHEKO_TEST_HOST:'paheko-test.example.invalid:443'},{VSV_PAHEKO_TEST_AUTHORIZATION:''}]){const s=setup({overrides});await assert.rejects(s.api.previewPaheko());assert.equal(s.calls.length,0);}
 const s=setup({overrides:{VSV_PAHEKO_TEST_CATEGORY_IDS:'',VSV_PAHEKO_TEST_CSV_URL:'https://other.example.invalid/export'}});await assert.rejects(s.api.previewPaheko());assert.equal(s.calls.length,0);
});
test('Paheko : limite totale des exports y compris sans Content-Length',async()=>{
 const s=setup({handler:()=>new Response(new Uint8Array(20000001))});await assert.rejects(s.api.previewPaheko(),/20 Mo/);
 const declared=setup({handler:()=>new Response('x',{headers:{'Content-Length':'20000001'}})});await assert.rejects(declared.api.previewPaheko(),/20 Mo/);
});
test('CSV manuel garde son refus des fichiers sans membres',()=>{assert.throws(()=>parseCsv(csv([]),','));assert.equal(parseCsv(csv([]),',',{allowHeaderOnly:true}).length,1);});
