import {hubEntry} from './hub-model.js';
import {memberName} from './references-model.js';
import {agTypes} from './notices-model.js';
const validEmail=s=>typeof s==='string'&&/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(s);
export function noticeMailDraft(kind,doc){
 if(!['convocations','invitations'].includes(kind))throw Error('Convocation ou invitation requise.');
 const ag=kind==='convocations',draft=hubEntry('communication',doc.title);
 draft.sourceKind=kind;draft.sourceId=doc.id;draft.projectId=doc.projectId||'';
 const lines=[ag?'Convocation — '+agTypes[doc.type]:'Invitation de réunion',doc.title,doc.object||'',
  'Référence : '+doc.id+(doc.revision!==undefined?' · version '+doc.revision:''),
  doc.status==='Brouillon'?'BROUILLON — document de travail':'',
  doc.date?'Date : '+doc.date:'Date à préciser',doc.startTime?'Début : '+doc.startTime:'',doc.endTime?'Fin prévue : '+doc.endTime:'',
  doc.place?'Lieu : '+doc.place:'',doc.address?'Adresse : '+doc.address:'',doc.video?'Visioconférence : '+doc.video:'',
  doc.convener?'Organisation : '+doc.convener:'',ag?(doc.convocation==='second'?'Seconde convocation':'Première convocation'):'',
  ag&&doc.type==='MIXTE'?[doc.agoTime?'Partie AGO : '+doc.agoTime:'',doc.ageTime?'Partie AGE : '+doc.ageTime:''].filter(Boolean).join('\n'):'',
  'Ordre du jour',...(doc.agenda||[]).map((p,i)=>[(i+1)+'. '+(ag&&doc.type==='MIXTE'?p.part+' — ':'')+(p.title||'Point à préciser'),p.description||'',p.resolution?'Projet de résolution (non voté) : '+p.resolution:'',p.speaker?'Intervenant : '+p.speaker:'',p.duration?'Durée indicative : '+p.duration+' minutes':'',p.attachment?'Pièce associée (référence, non jointe automatiquement) : '+p.attachment:''].filter(Boolean).join('\n')),
  ag&&doc.rules?.powers?'Informations relatives aux pouvoirs :\n'+doc.rules.powers:'',
  ...[['practical','Informations pratiques'],['attachments','Documents associés (références, non joints automatiquement)'],['notes','Notes']].map(([key,label])=>doc[key]?label+' :\n'+doc[key]:''),
  doc.signer?'Signataire : '+doc.signer:''];
 draft.notes=lines.filter(Boolean).join('\n\n');return draft;
}
export function noticeMailMembers(ids,repositories){
 const members=[],issues=[];
 for(const id of [...new Set(ids)]){const m=repositories.members.find(m=>m.id===id);if(!m||m.archived||m.activity==='archived'){issues.push((m?memberName(m):'Membre absent')+' : fiche indisponible ou archivée');continue;}
 const email=String(m.email||'').trim().toLowerCase();if(!validEmail(email)){issues.push(memberName(m)+' : adresse mail absente ou invalide');continue;}members.push({id:m.id,name:memberName(m),email});}
 const recipients=[...new Set(members.map(m=>m.email))];return {members,recipients,issues};
}
