import test from 'node:test';import assert from 'node:assert/strict';
import {documentAutosave} from '../src/shared/autosave.js';import {flushWrites,installShared,markDraft} from '../src/shared/runtime.js';
import {SharedStore} from '../src/shared/store.js';import {preferences} from '../src/references-model.js';
import {sanitizeMailHtml} from '../src/mail-format.js';import {bindMailSend} from '../src/shared/mail-send-ui.js';
import {hubEntry,validateHub} from '../src/hub-model.js';
test('Saisie rapide regroupée, bouton immédiat et navigation sans répétition des frappes',async()=>{
 let text='',writes=[],dirty=0;const a=documentAutosave({kind:'hub',getDocument:()=>({id:'x',text}),changed:()=>dirty++,save:async()=>writes.push(text),delay:25});
 for(let i=0;i<30;i++){text+='a';a.schedule();}assert.equal(writes.length,0);assert.equal(dirty,30);await flushWrites();assert.deepEqual(writes,[text]);await new Promise(r=>setTimeout(r,40));assert.equal(writes.length,1);
 a.schedule();a.cancel();await new Promise(r=>setTimeout(r,40));assert.equal(writes.length,1);markDraft('hub',false);
});
test('Couleur et thème isolés par compte sur le même appareil, aucune mutation partagée',async()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};const a=new SharedStore({storage}),b=new SharedStore({storage});a.actor='a';b.actor='b';a.call=b.call=()=>{throw Error('Aucun appel serveur attendu');};
 await a.write({preferences:{...preferences(),interfaceColor:'#ff00ff',theme:'dark'}});assert.equal(a.read().preferences.interfaceColor,'#ff00ff');assert.equal(b.read().preferences.interfaceColor,undefined);assert.equal(a.read().preferences.headerColor,preferences().headerColor);
 await b.write({preferences:{...preferences(),interfaceColor:'#001122'}});assert.equal(a.read().preferences.interfaceColor,'#ff00ff');assert.equal(b.read().preferences.interfaceColor,'#001122');
});
test('HTML mail : conserve la mise en forme utile, neutralise scripts, URL, attributs et styles actifs',()=>{
 const html=sanitizeMailHtml('<p onclick="evil()"><strong>Bonjour</strong><span style="color:rgb(18, 52, 86);font-size:24px;background:url(https://evil)">texte</span><img src=x onerror=evil()><iframe src=x></iframe><a href="javascript:evil()">lien</a></p><table><tr><td>A</td></tr></table>');
 assert.match(html,/<strong>Bonjour/);assert.match(html,/color:#123456/);assert.match(html,/font-size:24px/);assert.doesNotMatch(html,/onclick|onerror|src=|href=|url\(|iframe|<img/);assert.equal(sanitizeMailHtml(html),html);
});
test('Envoi direct : double clic et résultat incertain reprennent le même identifiant, pas de succès prématuré',async()=>{
 const button={textContent:'ENVOYER',dataset:{}},status={},entry={id:'x',title:'Objet',notes:'Texte',members:[{email:'a@example.invalid'}]};let release,calls=[],saves=0;
 const store={access:{can_send_mail:true},call:p=>{calls.push(structuredClone(p));return new Promise(r=>release=r);}};bindMailSend({button,status,store,getEntry:()=>entry,save:async()=>{saves++;return true;}});
 const first=button.onclick();await new Promise(r=>setTimeout(r,0));await button.onclick();assert.equal(calls.length,1);assert.equal(status.textContent,'Envoi en cours…');release({job:{state:'uncertain'}});await first;const second=button.onclick();await new Promise(r=>setTimeout(r,0));assert.equal(calls[0].id,calls[1].id);assert.equal(saves,1);release({job:{state:'sent'}});await second;assert.equal(button.textContent,'ENVOYÉ');assert.equal(button.disabled,true);
});
test('Brouillons enrichis et pièces jointes conservés dans le modèle, anciens brouillons acceptés',()=>{const e=hubEntry('communication','Objet');e.bodyHtml='<p><strong>Bonjour</strong></p>';e.attachments=['vsv-file:'+'a'.repeat(64)+'.pdf'];assert.equal(validateHub([e])[0].bodyHtml,e.bodyHtml);delete e.bodyHtml;delete e.attachments;assert.doesNotThrow(()=>validateHub([e]));});
test('Actualisation pendant une sauvegarde : ne signale pas une opération incertaine et ne répète pas le même état',async()=>{const states=[],store=new SharedStore({storage:{getItem:()=>null},onState:s=>states.push(s)});store.refresh=async()=>{};store.pending={id:'pending'};store.saving=true;store.state('Enregistrement…');await store.safeRefresh();store.state('Enregistrement…');assert.deepEqual(states,['Enregistrement…']);store.saving=false;await store.safeRefresh();assert.match(states.at(-1),/Opération à vérifier/);});
