import test from 'node:test';import assert from 'node:assert/strict';
import {noticeMailDraft,noticeMailMembers} from '../src/notice-mail-model.js';
import {notice,agendaItem} from '../src/notices-model.js';
import {validateHub} from '../src/hub-model.js';
test('Convocation mixte : reprise des horaires, descriptions, résolutions et informations, sans modifier la source',()=>{
 const n=notice('convocations');Object.assign(n,{title:'Assemblée annuelle',type:'MIXTE',date:'2026-11-20',agoTime:'18:00',ageTime:'19:00',startTime:'18:00',place:'Salle commune',address:'1 rue fictive',convener:'Le conseil',signer:'La présidence',practical:'Accès adapté',attachments:'Rapport annuel',notes:'Note publiée',actualSendDate:''});n.rules.powers='Pouvoir à remettre';n.agenda=[{...agendaItem('AGO'),title:'Bilan',description:'Présentation complète',resolution:'Adopter le bilan',part:'AGO'},{...agendaItem('AGE'),title:'Statuts',description:'Discussion',part:'AGE'}];const before=structuredClone(n),d=noticeMailDraft('convocations',n);validateHub([d]);assert.equal(d.title,n.title);for(const text of ['Partie AGO : 18:00','Partie AGE : 19:00','AGO — Bilan','AGE — Statuts','Présentation complète','Projet de résolution (non voté) : Adopter le bilan','Accès adapté','Pouvoir à remettre','Rapport annuel','Note publiée','1 rue fictive'])assert.ok(d.notes.includes(text),text);assert.deepEqual(n,before);assert.equal(d.file,'');assert.equal(d.sourceId,n.id);assert.equal(d.email,'');
});
test('Invitation : objet, visioconférence et ordre du jour repris, pas de liste nominative diffusée',()=>{
 const n=notice('invitations');Object.assign(n,{title:'Réunion bénévoles',object:'Préparer la fête',video:'https://example.invalid/visio',participants:[{id:'m1',name:'Nom privé'}]});n.agenda=[{...agendaItem(),title:'Installation',speaker:'Responsable technique',duration:'20',description:'Répartir les tâches'}];const d=noticeMailDraft('invitations',n);assert.match(d.notes,/Préparer la fête/);assert.match(d.notes,/Visioconférence/);assert.match(d.notes,/Durée indicative : 20 minutes/);assert.doesNotMatch(d.notes,/Nom privé/);assert.equal(d.members.length,0);
});
test('Sélection : adresses actuelles de l’annuaire, noms automatiques, adresse partagée dédupliquée',()=>{
 const repositories={members:[{id:'a',fullName:'Alpha',email:' A@example.invalid '},{id:'b',fullName:'Beta',email:'a@example.invalid'}]};const result=noticeMailMembers(['a','b','a'],repositories);assert.equal(result.members.length,2);assert.deepEqual(result.recipients,['a@example.invalid']);assert.equal(result.members[0].name,'Alpha');assert.equal(result.issues.length,0);
 repositories.members[0].email='nouveau@example.invalid';assert.equal(noticeMailMembers(['a'],repositories).members[0].email,'nouveau@example.invalid');
});
test('Sélection : adresses manquantes, malformées, fiches archivées et supprimées signalées sans omission silencieuse',()=>{
 const repositories={members:[{id:'a',fullName:'Sans mail',email:''},{id:'b',fullName:'Archive',email:'b@example.invalid',archived:true},{id:'c',fullName:'Invalide',email:'a@example.invalid,b@example.invalid'}]};const r=noticeMailMembers(['a','b','c','absent'],repositories);assert.equal(r.members.length,0);assert.equal(r.issues.length,4);
});
