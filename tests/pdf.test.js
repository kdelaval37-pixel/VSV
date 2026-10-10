import {test} from 'node:test';
import assert from 'node:assert/strict';
import {project} from '../src/model.js';
import {pdfHtml} from '../src/pdf.js';
test('document PDF conforme au modèle, budget et textes échappés',()=>{const p={...project(),name:'Été <solidaire>',summary:'Café & échanges',tasks:[{label:'Accueil',owner:'Anaïs',due:'2026-10-20',progress:'À faire'}],expenses:[{label:'Tracts',quantity:'3',unit:'0,10'}],income:[{label:'Don',amount:'10,01'}]};const html=pdfHtml(p,'http://localhost:4173/');for(const text of ['logo-vsv.png','45 Chemin des Millards','W183005231','FICHE PROJET ASSOCIATIF','Été &lt;solidaire&gt;','Café &amp; échanges','8. Étapes de préparation','9. Budget prévisionnel','0,30','9,71','Anaïs'])assert.ok(html.includes(text),text);assert.ok(html.includes('<thead>'));assert.ok(!html.includes('Critères de réussite'));});
test('PDF refusé si nom ou montants invalides',()=>{assert.throws(()=>pdfHtml(project(),'http://localhost/'));const p={...project(),name:'Test',expenses:[{label:'Erreur',quantity:'1',unit:'abc'}]};assert.throws(()=>pdfHtml(p,'http://localhost/'));});
