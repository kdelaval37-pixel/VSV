import {civilDays,addCivilDays,isCivilDate} from './civil-date.js';
export const noticeRuleSource='Statut asso.pdf — article 10 (AGO) et article 11 (AGE), texte fourni le 21 octobre 2026.';
export const noticeConvention='Convention de calcul retenue : différence entre dates civiles, jour d’envoi exclu et jour de l’AG inclus. Les statuts ne précisent pas « jours francs » ; aucun jour supplémentaire n’est ajouté. Calcul indépendant du fuseau horaire.';
export const mixedNoticeWarning='L’AG mixte n’est pas explicitement prévue par les statuts : la possibilité de réunir AGO et AGE reste à confirmer. Les délais sont contrôlés séparément, sans certification globale de l’assemblée.';
export const civilLabel=value=>isCivilDate(value)?value.split('-').reverse().join('/'):'à renseigner';
export function verifiedFirstNotice(part){return {verified:true,days:'15',origin:'send',reason:part==='AGO'?'Article 10 : convocation « adressée au moins 15 jours à l’avance ».':'Article 11 : « convoquée selon les mêmes formes que l’AGO » ; délai de 15 jours de l’article 10.'};}
// Les confirmations historiques restent dans les documents. Elles ne remplacent pas le délai vérifié de première convocation.
export function delayCheck(n,part){
 const second=n.convocation==='second',send=n.actualSendDate||n.plannedSendDate||'',r=n.rules?.[(second?'second':'')+part]||{};
 const interpreted=Boolean(r.verified&&r.reason?.trim()&&['send','first'].includes(r.origin));
 const origin=second?(interpreted?r.origin:''): 'send';
 const required=!second?15:part==='AGO'?7:interpreted&&/^\d{1,3}$/.test(r.days)?Number(r.days):null;
 const calculated=civilDays(send,n.date),start=origin==='first'?n.firstDate:send,retainedDays=origin?civilDays(start,n.date):null;
 const earliest=origin==='send'&&required!==null?addCivilDays(send,required):null;
 const latest=origin==='send'&&required!==null?addCivilDays(n.date,-required):null;
 const originEarliest=origin==='first'&&required!==null?addCivilDays(n.firstDate,required):null;
 const issues=[],violations=[];
 const reference=second?(part==='AGO'?'Article 10 : seconde AGO, minimum de 7 jours ; point de départ non explicite.':'Article 11 : seconde AGE « dans les mêmes conditions » ; délai et point de départ à confirmer.'):verifiedFirstNotice(part).reason;
 if(!send)issues.push('Date d’envoi effectif ou, avant l’envoi, date d’envoi prévue à renseigner.');
 else if(!isCivilDate(send))violations.push('Date d’envoi invalide.');
 if(!n.date)issues.push('Date de l’assemblée à renseigner.');
 else if(!isCivilDate(n.date))violations.push('Date de l’assemblée invalide.');
 if(calculated!==null&&calculated<0)violations.push('Dates inversées : l’envoi est postérieur à l’assemblée.');
 if(second){
  issues.push(reference+' Aucune conformité certaine n’est déduite de l’interprétation enregistrée.');
  if(!interpreted)issues.push('Choisir et justifier une hypothèse de calcul dans « Règles utilisées » pour obtenir des dates indicatives.');
  if(!n.firstDate)issues.push('Date de la première assemblée à renseigner.');
  else if(!isCivilDate(n.firstDate))violations.push('Date de la première assemblée invalide.');
  if(!n.firstQuorum)issues.push('Défaut de quorum de la première assemblée à confirmer.');
  const afterFirst=civilDays(n.firstDate,n.date),noticeAfterFirst=civilDays(n.firstDate,send);
  if(afterFirst!==null&&afterFirst<=0)violations.push('La seconde assemblée doit être postérieure à la première.');
  if(noticeAfterFirst!==null&&noticeAfterFirst<0)violations.push('La seconde convocation précède la première assemblée : chronologie à vérifier.');
 }
 if(required!==null&&retainedDays!==null&&retainedDays<required)violations.push(second?'Délai insuffisant selon l’hypothèse retenue (interprétation statutaire à confirmer).':'Délai de convocation non respecté.');
 if(n.type==='MIXTE')issues.push(mixedNoticeWarning);
 const missingDates=!isCivilDate(send)||!isCivilDate(n.date);
 const state=violations.length?'fail':second||missingDates?'pending':'pass';
 let text=state==='fail'?'Délai de convocation non respecté':state==='pass'?'Délai de convocation respecté':'À vérifier : délai de convocation incomplet ou ambigu';
 if(second&&state==='fail')text='Anomalie de dates / délai indicatif insuffisant — seconde convocation à vérifier';
 let alert=violations.join(' ');
 if(state==='fail'&&!second&&calculated!==null&&earliest&&latest){alert=`Délai de convocation non respecté : ${calculated} jours ${n.actualSendDate?'constatés':'prévus'} au lieu de ${required}. Pour conserver cette date d’AG, la convocation devait être envoyée au plus tard le ${civilLabel(latest)}. Pour un envoi le ${civilLabel(send)}, prévoyez l’AG à partir du ${civilLabel(earliest)}.${calculated<0?' Dates inversées : l’envoi est postérieur à l’assemblée.':''}`;}
 return {part,required,calculated,retainedDays,earliest,latest,originEarliest,origin,send,state,provisional:!n.actualSendDate,issues,violations,text,alert,reference,uncertain:second,convention:noticeConvention};
}
export function delaySummary(n){const parts=(n.type==='MIXTE'?['AGO','AGE']:[n.type]).map(part=>delayCheck(n,part));const state=parts.some(p=>p.state==='fail')?'fail':parts.some(p=>p.state==='pending')?'pending':'pass';return {parts,state,text:state==='fail'?(n.convocation==='second'?'Anomalie de dates ou délai indicatif insuffisant — seconde convocation à vérifier':'Délai de convocation non respecté'):state==='pending'?(n.convocation==='second'?'Seconde convocation : délai et point de départ à vérifier':'Délai de convocation à vérifier'):n.type==='MIXTE'?'Délai de convocation respecté pour les parties AGO et AGE':'Délai de convocation respecté'};}
export function delayPrintWarning(n){if(n.kind!=='convocations')return '';const summary=delaySummary(n);return summary.state==='fail'?'⚠ '+summary.parts.filter(p=>p.state==='fail').map(p=>p.part+' : '+p.alert).join('\n')+'\n\nLe document sera imprimé avec cette anomalie. Continuer « Imprimer / Enregistrer en PDF » ?':'';}
