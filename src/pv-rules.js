// Les règles et confirmations sont copiées dans chaque PV, jamais lues dans un réglage global.
export function statutoryRules() {
  return {version:1,source:'Règles fournies pour VSV : articles 10 (AGO) et 11 (AGE).',
    convention:'Différence de dates civiles : jour de départ exclu, jour de l’assemblée inclus ; pas de jours francs.',
    ago:{noticeDays:15,quorumDivisor:4,proxyLimit:2,majority:'simple',secondDays:7},
    age:{noticeDays:15,quorumDivisor:3,majority:'two-thirds'},secondNoQuorum:true,
    confirmations:{initialRepresented:'',initialRepresentedReason:'',ageProxyLimit:'',ageProxyLimitReason:'',
      secondAgoOrigin:'',secondAgoOriginReason:'',secondAgeDelay:'',secondAgeDays:'',secondAgeOrigin:'',secondAgeDelayReason:''}};
}
export function count(value) {
  if(value==='')return null;
  if(typeof value!=='string'||!/^\d+$/.test(value)||Number(value)>1_000_000_000)return NaN;
  return Number(value);
}
export const norm=name=>name.trim().normalize('NFC').toLocaleLowerCase('fr');
export function civilDays(start,end){
  if(!start||!end)return null;
  const a=Date.parse(start+'T00:00:00Z'),b=Date.parse(end+'T00:00:00Z');
  return Number.isFinite(a)&&Number.isFinite(b)?Math.round((b-a)/86400000):null;
}
export function powerCheck(pv){
  const c=pv.rules.confirmations;
  const same=(a,aid,b,bid)=>aid&&bid?aid===bid:norm(a)===norm(b);
  const has=(list,name,id)=>list.some(p=>same(p.name,p.memberId,name,id));
  const limit=pv.type==='AGO'?pv.rules.ago.proxyLimit:c.ageProxyLimit==='yes'&&c.ageProxyLimitReason.trim()?pv.rules.ago.proxyLimit:c.ageProxyLimit==='no'&&c.ageProxyLimitReason.trim()?Infinity:null;
  const rows=pv.powers.map(p=>{
    const issues=[];if(!norm(p.donor)||!norm(p.receiver))issues.push('Noms du mandant et du mandataire à compléter.');
    if(!p.paid)issues.push('Cotisation du mandant à confirmer.');
    if(pv.powers.filter(q=>norm(q.donor)&&same(q.donor,q.donorMemberId,p.donor,p.donorMemberId)).length>1)issues.push('Mandant en double : aucun de ses pouvoirs n’est retenu tant que le doublon subsiste.');
    if(has(pv.present,p.donor,p.donorMemberId))issues.push('Mandant déjà compté comme présent.');
    if(norm(p.donor)&&same(p.donor,p.donorMemberId,p.receiver,p.receiverMemberId))issues.push('Le mandant et le mandataire sont identiques.');
    if(has(pv.excused,p.receiver,p.receiverMemberId))issues.push('Mandataire également dans les excusés : présence à vérifier.');
    if(has(pv.guests,p.receiver,p.receiverMemberId))issues.push('Mandataire indiqué comme invité sans droit de vote : qualité à vérifier.');
    if(count(pv.presentCount)===0&&norm(p.receiver))issues.push('Aucun membre présent déclaré : mandataire présent à vérifier.');
    if(!has(pv.present,p.receiver,p.receiverMemberId)&&!p.receiverConfirmed)issues.push('Mandataire absent de la liste : confirmer sa présence et son droit de vote, ou compléter la liste.');
    if(limit===null)issues.push('À vérifier : application à l’AGE de la limite de deux pouvoirs.');
    else if(pv.powers.filter(q=>norm(q.donor)&&q.paid&&same(q.receiver,q.receiverMemberId,p.receiver,p.receiverMemberId)).length>limit)issues.push(`Plus de ${limit} pouvoirs pour ce mandataire : corriger les pouvoirs retenus ; aucun de ses pouvoirs n’est retenu pour le calcul.`);
    return {id:p.id,valid:issues.length===0,issues};
  });
  const valid=pv.powers.filter(p=>rows.find(r=>r.id===p.id).valid);
  return {rows,valid,represented:valid.length,pending:rows.some(r=>!r.valid),limit};
}
function result(state,text,details=[]){return {state,text,details};}
export function noticeCheck(pv){
  const c=pv.rules.confirmations;
  let start=pv.noticeDate,minimum=pv.type==='AGO'?pv.rules.ago.noticeDays:pv.rules.age.noticeDays;
  let origin='Date d’envoi effectif de la première convocation';
  const issues=[];
  if(pv.convocation==='second'){
    if(!pv.firstDate)issues.push('Date de la première assemblée à renseigner.');
    if(pv.firstQuorum!=='insufficient')issues.push('Constat de quorum insuffisant à confirmer.');
    if(!pv.secondNoticeDate)issues.push('Date d’envoi de la seconde convocation à renseigner.');
    if(pv.firstDate&&pv.date&&civilDays(pv.firstDate,pv.date)<=0)issues.push('La seconde assemblée doit être postérieure à la première.');
    if(pv.firstDate&&pv.secondNoticeDate&&civilDays(pv.firstDate,pv.secondNoticeDate)<0)issues.push('La seconde convocation précède la première assemblée : à vérifier.');
    if(pv.type==='AGO'){
      minimum=pv.rules.ago.secondDays;
      if(!c.secondAgoOrigin||!c.secondAgoOriginReason.trim())return result('pending','À vérifier : point de départ du délai de 7 jours de la seconde AGO.',issues);
      start=c.secondAgoOrigin==='first-assembly'?pv.firstDate:pv.secondNoticeDate;
      origin=c.secondAgoOrigin==='first-assembly'?'Première assemblée':'Envoi de la seconde convocation';
    }else{
      if(!c.secondAgeDelay||!c.secondAgeDelayReason.trim())return result('pending','À vérifier : délai applicable à la seconde AGE « dans les mêmes conditions ».',issues);
      if(c.secondAgeDelay==='15-notice'){minimum=pv.rules.age.noticeDays;start=pv.secondNoticeDate;origin='Envoi de la seconde convocation';}
      else if(c.secondAgeDelay==='7-first'){minimum=pv.rules.ago.secondDays;start=pv.firstDate;origin='Première assemblée';}
      else if(c.secondAgeDelay==='7-notice'){minimum=pv.rules.ago.secondDays;start=pv.secondNoticeDate;origin='Envoi de la seconde convocation';}
      else {minimum=count(c.secondAgeDays);start=c.secondAgeOrigin==='first-assembly'?pv.firstDate:pv.secondNoticeDate;origin=c.secondAgeOrigin==='first-assembly'?'Première assemblée':'Envoi de la seconde convocation';if(minimum===null||!Number.isFinite(minimum)||!c.secondAgeOrigin)return result('pending','À vérifier : délai confirmé et point de départ à compléter.',issues);}
    }
    if(pv.secondNoticeDate&&pv.date&&civilDays(pv.secondNoticeDate,pv.date)<0)issues.push('La seconde convocation est postérieure à l’assemblée.');
  }
  const days=civilDays(start,pv.date);
  if(days===null)return result('pending','À vérifier : dates nécessaires au calcul manquantes.',issues);
  const details=[`${origin} : ${start} ; assemblée : ${pv.date}.`,`${days} jour(s) civil(s) ; minimum retenu : ${minimum}.`,pv.rules.convention,...issues];
  if(days<minimum||days<0)return result('fail','Délai non respecté selon la règle retenue.',details);
  if(issues.length)return result('pending','Délai calculé suffisant ; conditions de seconde convocation à vérifier.',details);
  return result('pass','Délai respecté selon la règle retenue.',details);
}
export function quorumCheck(pv,powers=powerCheck(pv)){
  const total=count(pv.memberTotal),present=count(pv.presentCount),represented=powers.represented;
  if(pv.convocation==='second')return {...result('not-required','Quorum non exigé sur seconde convocation.', ['L’absence de quorum ne supprime pas les règles de majorité.']),required:null,present,represented,retained:null};
  const divisor=pv.type==='AGO'?pv.rules.ago.quorumDivisor:pv.rules.age.quorumDivisor;
  const required=total!==null&&Number.isFinite(total)?Math.ceil(total/divisor):null;
  const base={required,present,represented,retained:null};
  if(total===null||total<=0||!Number.isFinite(total)||present===null||!Number.isFinite(present))return {...result('pending','À vérifier : effectif adhérent positif et nombre de présents à renseigner.'),...base};
  const c=pv.rules.confirmations;
  if(!c.initialRepresented||!c.initialRepresentedReason.trim())return {...result('pending','À vérifier : prise en compte des représentés pour le quorum initial.',[`Quorum requis : plafond(${total} / ${divisor}) = ${required}.`]),...base};
  const retained=present+(c.initialRepresented==='yes'?represented:0);
  const details=[`Quorum requis : plafond(${total} / ${divisor}) = ${required}.`,`${present} présent(s) ; ${represented} représenté(s) retenu(s).`,c.initialRepresented==='yes'?'Représentés inclus dans le quorum, selon la confirmation enregistrée.':'Représentés exclus du quorum, selon la confirmation enregistrée.',`Effectif retenu pour le quorum : ${retained}.`,c.initialRepresentedReason];
  if(present>total||present+represented>total)return {...result('fail','Effectifs incohérents : présents et représentés dépassent les adhérents.',details),...base,retained};
  if(powers.pending)return {...result('pending','À vérifier : des pouvoirs sont incomplets ou incohérents.',details),...base,retained};
  return {...result(retained>=required?'pass':'fail',retained>=required?'Quorum atteint selon les confirmations enregistrées.':'Quorum non atteint selon les confirmations enregistrées.',details),...base,retained};
}
export function preparationChecks(pv){
  const powers=powerCheck(pv),notice=noticeCheck(pv),quorum=quorumCheck(pv,powers),issues=[];
  const total=count(pv.memberTotal),present=count(pv.presentCount),named=pv.present.filter(p=>norm(p.name)).length;
  if(total===null||total===0)issues.push('Effectif total des adhérents à jour à renseigner (positif).');
  if(present===null)issues.push('Nombre déclaré de membres présents votants à renseigner.');
  if(named&&present!==null&&named!==present)issues.push(`Liste nominative : ${named} nom(s), contre ${present} présents déclarés. Le nombre déclaré reste inchangé.`);
  if(pv.present.some(p=>pv.excused.some(q=>p.memberId&&q.memberId?p.memberId===q.memberId:norm(p.name)&&norm(p.name)===norm(q.name))))issues.push('Une personne figure parmi les présents et les excusés : vérifier les listes, sans supprimer automatiquement les homonymes.');
  if(pv.present.some(p=>pv.guests.some(q=>p.memberId&&q.memberId?p.memberId===q.memberId:norm(p.name)&&norm(p.name)===norm(q.name))))issues.push('Une personne figure parmi les présents votants et les invités sans droit de vote : vérifier sa qualité.');
  const names=pv.present.map(p=>norm(p.name)).filter(Boolean);if(new Set(names).size!==names.length)issues.push('Noms de présents en double : vérifier les homonymes et préciser les noms si nécessaire.');
  if(total!==null&&present!==null&&present+powers.represented>total)issues.push('Présents et représentés dépassent l’effectif adhérent.');
  for(const [key,label] of [['date','date de l’assemblée'],['place','lieu'],['startTime','heure de début'],['chair','présidence de séance'],['secretary','secrétariat de séance'],['convener','personne ou instance ayant convoqué']])if(!pv[key].trim())issues.push(`${label} à compléter.`);
  if(!pv.agenda.length)issues.push('Ordre du jour à compléter.');
  if(pv.referenceAgenda!==null&&JSON.stringify(pv.referenceAgenda)!==JSON.stringify(pv.agenda.filter(p=>p.origin==='announced').map(p=>({pointId:p.id,title:p.title}))))issues.push('L’ordre annoncé courant diffère de la copie de référence : vérifier ou corriger explicitement la copie.');
  if(pv.convocation==='second'){
    if(!pv.firstDate)issues.push('Date de la première assemblée à compléter.');
    if(pv.firstQuorum!=='insufficient')issues.push('Quorum insuffisant de la première assemblée à confirmer.');
  }
  return {powers,notice,quorum,issues};
}
export function voteResult(r){
  const eligible=count(r.eligible),issues=[];
  if(!r.text.trim())issues.push('Texte exact de la résolution à renseigner.');
  if(r.kind==='election'){
    if(eligible===null||!Number.isFinite(eligible))issues.push('Nombre de voix disponibles à renseigner.');
    if(!r.electionRule.trim())issues.push('Règle du scrutin particulier à renseigner.');
    if(!r.candidates.length)issues.push('Candidats ou options à renseigner.');
    if(r.candidates.some(c=>!c.name.trim()||!Number.isFinite(count(c.votes))))issues.push('Résultats structurés incomplets.');
    const choices=count(r.choicesPerVoter);if(choices!==null&&(!Number.isFinite(choices)||choices<1))issues.push('Nombre maximum de choix à vérifier (entier positif).');
    const sum=r.candidates.reduce((s,c)=>s+(Number.isFinite(count(c.votes))?count(c.votes):0),0);
    if(eligible!==null&&choices!==null&&Number.isFinite(choices)&&sum>eligible*choices)issues.push('Voix des candidats supérieures aux voix disponibles multipliées par les choix autorisés.');
    if(!r.electionResult.trim())issues.push('Conclusion du scrutin à renseigner par le rédacteur.');
    return {state:issues.length?'pending':'manual',outcome:issues.length?'À vérifier — scrutin particulier sans résultat automatique.':'Résultat saisi par le rédacteur, sans calcul d’élection automatique.',expressed:null,threshold:null,sum,missing:issues,nonParticipation:null};
  }
  const keys=['for','against','abstain','blank','invalid'];const numbers=keys.map(k=>count(r[k]));
  const missing=keys.filter((k,i)=>numbers[i]===null);
  if(numbers.some(n=>n!==null&&!Number.isFinite(n))||!Number.isFinite(eligible)&&eligible!==null)return {state:'fail',outcome:'Décompte invalide : entiers positifs ou nuls uniquement.',missing:[],expressed:null,threshold:null,sum:null,nonParticipation:null};
  const expressed=numbers[0]!==null&&numbers[1]!==null?numbers[0]+numbers[1]:null;
  const sum=numbers.reduce((s,n)=>s+(n??0),0);
  const threshold=expressed===null?null:r.rule.majority==='two-thirds'?Math.ceil(2*expressed/3):Math.floor(expressed/2)+1;
  const non=count(r.nonParticipation);
  if(non!==null&&!Number.isFinite(non))issues.push('Non-participations invalides.');
  if(eligible!==null&&(sum>eligible||(non!==null&&Number.isFinite(non)&&sum+non>eligible)))issues.push('Le total dépasse les voix disponibles.');
  if(missing.length)issues.push('Décompte partiel : renseignez pour, contre, abstentions, blancs et nuls ; zéro est une valeur à saisir explicitement.');
  if(eligible===null)issues.push('Nombre de voix pouvant participer au vote à renseigner.');
  const difference=eligible!==null?eligible-sum:null;
  if(!missing.length&&eligible!==null&&difference>0&&(non===null||non!==difference))issues.push('Total inférieur aux voix disponibles : indiquez les non-participations.');
  const details=expressed===null?'Suffrages exprimés non calculables sans les voix pour et contre.':`Suffrages exprimés = pour + contre = ${expressed}. ${r.rule.majority==='two-thirds'?`Seuil AGE = plafond(2 × ${expressed} / 3) = ${threshold}.`:`AGO : adoption uniquement si pour > contre ; seuil = ${threshold} pour ${expressed} exprimés.`} Abstentions, blancs et nuls exclus des suffrages exprimés.`;
  if(issues.length)return {state:issues.some(s=>s.includes('dépasse')||s.includes('invalides'))?'fail':'pending',outcome:'Résultat non conclu : décompte à vérifier.',expressed,threshold,sum,details,missing:issues,nonParticipation:!missing.length&&difference>0?difference:null};
  if(expressed===0)return {state:'pending',outcome:'Aucun suffrage exprimé : aucune adoption automatique.',expressed,threshold:null,sum,details,missing:[],nonParticipation:null};
  const adopted=r.rule.majority==='two-thirds'?3*numbers[0]>=2*expressed:numbers[0]>numbers[1];
  return {state:'pass',outcome:adopted?'Adoptée selon le décompte saisi.':'Rejetée selon le décompte saisi.',expressed,threshold,sum,details,missing:[],nonParticipation:null};
}
export function pvVoteResult(pv,r){const result=voteResult(r);if(r.rule.assemblyType!==pv.type)return {...result,state:'pending',outcome:'À vérifier : le type de l’AG diffère de la règle copiée pour ce vote.',missing:[...(result.missing||[]),'La règle conservée du vote reste inchangée ; corrigez-la explicitement si nécessaire.']};return result;}
