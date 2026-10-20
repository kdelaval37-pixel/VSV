import {shared,flushWrites,pinDocument,markDraft} from './shared/runtime.js';
import {meeting,participant,point,action,meetingFields,pointStatuses,duplicateMeeting,movePoint,participantConflicts,validateMeeting,validatePublication,unresolvedNotes,pendingPoints,hasNotes} from './meeting-model.js';
import {meetingDocument,meetingDate} from './meeting-document.js';
import {esc,date} from './document.js';
import {exportPdf} from './pdf.js';

export function createMeetingModule({app,getMeetings,persist,blocked,navigation,download,importFile,notice}) {
  let current=null,dirty=false,query='',lastFeedback='',feedbackError=false;
  const openDetails=new Set(['general','people','agenda']);
  const findPoint=id=>current.agenda.find(p=>p.id===id);
  function feedback(text,error=false){lastFeedback=text;feedbackError=error;const el=app.querySelector('#feedback');if(el){el.textContent=text;el.className=error?'error':'success';}}
  function feedbackMarkup(){return `<p id="feedback" role="status" aria-live="polite" class="${feedbackError?'error':'success'}">${esc(lastFeedback)}</p>`;}
  async function store(next){try{if(blocked())throw Error('Les données existantes sont illisibles. Elles sont préservées ; aucune écriture possible.');await persist(next);return true;}catch(e){feedback('Échec de l’enregistrement. Les changements ne sont pas sauvegardés. '+e.message+' Réessayez ou téléchargez une sauvegarde JSON.',true);return false;}}
  let saveVersion=0;
 async function save(){const ticket=++saveVersion;
    dirty=true;markDraft('meetings',true);if(shared())feedback('Enregistrement…');
    try{
      validateMeeting(current);
      const copy=structuredClone(current);copy.updatedAt=new Date().toISOString();
      const existing=getMeetings();const next=existing.some(m=>m.id===copy.id)?existing.map(m=>m.id===copy.id?copy:m):[...existing,copy];
      if(await store(next)){if(ticket!==saveVersion||current?.id!==copy.id)return false;current.updatedAt=copy.updatedAt;dirty=false;markDraft('meetings',false);shared()?.state('Enregistré');feedback((shared()?'Enregistré · ':'Sauvegardé sur cet appareil · ')+date(copy.updatedAt));}
    }catch(e){feedback('Non sauvegardé : '+e.message,true);}
    updateIndicators();return !dirty;
  }
  function leave(){return !dirty||confirm('Ce compte rendu contient des changements non sauvegardés. Quitter et les perdre ?');}
  function clear(){current=null;dirty=false;markDraft('meetings',false);lastFeedback='';feedbackError=false;}
  function list(){shared()?.releasePins();
    clear();navigation('meetings');
    app.innerHTML=`${notice}<div class="heading"><div><p class="eyebrow">Les échanges de l’association</p><h1>Comptes rendus</h1></div><button id="new-meeting" ${blocked()?'disabled':''}>Nouveau compte rendu</button></div><div class="toolbar"><label>Rechercher par titre<input type="search" id="meeting-search" value="${esc(query)}" placeholder="Titre de la réunion"></label><button class="secondary" id="export">Télécharger la sauvegarde JSON</button><label class="file">Importer une sauvegarde<input id="import" type="file" accept=".json,application/json" ${blocked()?'disabled':''}></label></div>${feedbackMarkup()}<div id="meeting-list"></div>`;
    if(blocked())feedback('Les données enregistrées sont illisibles. Aucun écrasement effectué. Ne les effacez pas avant de demander de l’aide.',true);
    renderList();app.querySelector('#new-meeting').onclick=start;
    app.querySelector('#meeting-search').oninput=e=>{query=e.target.value;renderList();};
    app.querySelector('#export').onclick=download;app.querySelector('#import').onchange=importFile;
  }
  function renderList(){
    const matches=getMeetings().filter(m=>m.title.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr'))).sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt));
    app.querySelector('#meeting-list').innerHTML=matches.length?`<div class="cards">${matches.map(m=>`<article class="card"><span class="badge">${esc(m.status)}</span><h2>${esc(m.title)}</h2><p>Date de réunion : ${meetingDate(m.date)||'À renseigner'}</p><small>Modifié le ${date(m.updatedAt)}</small><div class="actions"><button data-meeting-action="open" data-id="${esc(m.id)}">Ouvrir</button><button class="secondary" data-meeting-action="duplicate" data-id="${esc(m.id)}">Dupliquer</button><button class="danger" data-meeting-action="delete" data-id="${esc(m.id)}">Supprimer</button></div></article>`).join('')}</div>`:'<div class="empty"><h2>Aucun compte rendu à afficher</h2><p>Créez une réunion ou adaptez votre recherche.</p></div>';
    app.querySelector('#meeting-list').onclick=async e=>{
      const button=e.target.closest('button');if(!button)return;
      const m=getMeetings().find(m=>m.id===button.dataset.id);if(!m)return;
      if(button.dataset.meetingAction==='open')open(m);
      if(button.dataset.meetingAction==='delete'&&confirm(`Supprimer définitivement le compte rendu « ${m.title} » ?`)&&await store(getMeetings().filter(item=>item.id!==m.id))){renderList();feedback('Compte rendu supprimé.');}
      if(button.dataset.meetingAction==='duplicate')duplicateDialog(m);
    };
  }
  function modal(markup,handler){
    const dialog=document.createElement('dialog');dialog.className='meeting-dialog';dialog.innerHTML=markup+'<button class="secondary" data-modal="cancel">Annuler</button>';document.body.append(dialog);
    const close=()=>{dialog.close();dialog.remove();};
    dialog.onclick=async e=>{const button=e.target.closest('[data-modal]');if(button){if(button.dataset.modal==='cancel')close();else handler(button.dataset.modal,close,dialog);}};
    dialog.addEventListener('cancel',()=>dialog.remove(),{once:true});dialog.showModal();
  }
  function duplicateDialog(m){
    modal(`<h2>Dupliquer la réunion</h2><p>L’original reste intact. La copie sera un brouillon indépendant.</p><div class="duplicate-options"><button data-modal="full">Copier tout le compte rendu</button><p>Conserve les participants, les dates et toutes les notes.</p><button data-modal="structure">Reprendre uniquement la structure</button><p>Conserve le lieu, les personnes animant et rédigeant, et les titres des points. Les dates, horaires et participants sont à renseigner ; notes, décisions, actions et motifs sont vidés. Les points reviennent à « À aborder ».</p></div>`,async(choice,close)=>{const copy=duplicateMeeting(m,choice==='structure');if(await store([...getMeetings(),copy])){close();renderList();feedback('Copie créée. L’original est conservé.');}});
  }
  function start(){current=meeting();dirty=false;markDraft('meetings',false);lastFeedback='Nouveau compte rendu : saisissez le titre pour enregistrer.';feedbackError=false;openDetails.clear();['general','people','agenda'].forEach(id=>openDetails.add(id));editor();app.querySelector('[data-meeting-field=title]').focus();}
  function open(m){current=structuredClone(m);dirty=false;markDraft('meetings',false);lastFeedback=(shared()?'Enregistré · ':'Sauvegardé sur cet appareil · ')+date(m.updatedAt);feedbackError=false;openDetails.clear();['general','people','agenda',...m.agenda.map(p=>p.id)].forEach(id=>openDetails.add(id));editor();}
  function captureDetails(){app.querySelectorAll('details[data-detail]').forEach(d=>{if(d.open)openDetails.add(d.dataset.detail);else openDetails.delete(d.dataset.detail);});}
  function detail(id,title,content){return `<details class="panel meeting-details" data-detail="${esc(id)}" ${openDetails.has(id)?'open':''}><summary>${title}</summary>${content}</details>`;}
  function general(){return `<div class="grid">${meetingFields.map(([key,label,type])=>`<label>${label}${key==='title'?' *':''}<input data-meeting-field="${key}" type="${type}" value="${esc(current[key])}" ${key==='title'?'required':''}></label>`).join('')}</div><label class="meeting-status">Statut${current.status==='Finalisé'?'<input value="Finalisé" readonly>':`<select data-meeting-field="status"><option ${current.status==='Brouillon'?'selected':''}>Brouillon</option><option ${current.status==='En cours'?'selected':''}>En cours</option></select>`}</label>`;}
  function people(key,label){return `<section class="people-group"><h3>${label} (<span data-count="${key}">0</span>)</h3><div>${current[key].map(p=>`<div class="line"><label>Nom<input data-person-list="${key}" data-person="${esc(p.id)}" data-person-field="name" value="${esc(p.name)}"></label><label>Fonction ou organisme (facultatif)<input data-person-list="${key}" data-person="${esc(p.id)}" data-person-field="role" value="${esc(p.role)}"></label><button type="button" class="danger" data-remove-person="${esc(p.id)}" data-person-list="${key}" aria-label="Retirer ${esc(p.name||'ce participant')}">Retirer</button></div>`).join('')}</div><div class="line participant-add"><label>Ajouter un nom<input data-add-person-name="${key}" placeholder="Nom, puis Entrée"></label><label>Fonction ou organisme (facultatif)<input data-add-person-role="${key}"></label><button type="button" class="secondary" data-add-person="${key}">Ajouter</button></div></section>`;}
  function actions(p){return `<div class="meeting-actions"><h4>Actions (facultatives)</h4>${p.actions.map(a=>`<div class="line"><label>Action à réaliser<input data-point="${esc(p.id)}" data-action-id="${esc(a.id)}" data-action-field="text" value="${esc(a.text)}"></label><label>Responsable<input data-point="${esc(p.id)}" data-action-id="${esc(a.id)}" data-action-field="owner" value="${esc(a.owner)}"></label><label>Échéance<input type="date" data-point="${esc(p.id)}" data-action-id="${esc(a.id)}" data-action-field="due" value="${esc(a.due)}"></label><button type="button" class="danger" data-remove-action="${esc(a.id)}" data-point="${esc(p.id)}">Retirer</button></div>`).join('')}<button type="button" class="secondary" data-add-action="${esc(p.id)}">Ajouter une action</button></div>`;}
  function pointCard(p,index){return detail(p.id,`<span data-point-heading="${esc(p.id)}">${index+1}. ${esc(p.title||'Point sans titre')}</span> <span class="badge" data-point-badge="${esc(p.id)}">${esc(p.status)}</span>`, `<div class="point-content"><div class="grid"><label>Titre du point<input data-point="${esc(p.id)}" data-point-field="title" value="${esc(p.title)}"></label><label>État du point<select data-point="${esc(p.id)}" data-point-field="status">${pointStatuses.map(s=>`<option ${p.status===s?'selected':''}>${s}</option>`).join('')}</select></label></div><div class="point-controls"><button type="button" class="secondary" data-move="-1" data-point="${esc(p.id)}" ${index===0?'disabled':''} aria-label="Monter le point ${index+1}">↑ Monter</button><button type="button" class="secondary" data-move="1" data-point="${esc(p.id)}" ${index===current.agenda.length-1?'disabled':''} aria-label="Descendre le point ${index+1}">↓ Descendre</button><button type="button" class="danger" data-delete-point="${esc(p.id)}">Supprimer ce point</button></div>${p.status==='Non discuté'?`<div class="not-discussed-box"><strong>Non discuté</strong><p>Les notes restent conservées dans la saisie et la sauvegarde JSON, même si vous les masquez dans le document.</p><label>Motif ou note de report (facultatif)<textarea rows="3" data-point="${esc(p.id)}" data-point-field="reportNote">${esc(p.reportNote)}</textarea></label><fieldset class="notes-choice"><legend>Si ce point contient des notes, décisions ou actions : les inclure dans le document ?</legend><label><input type="radio" name="notes-${esc(p.id)}" data-point="${esc(p.id)}" data-point-field="includeNotes" value="yes" ${p.includeNotes===true?'checked':''}> Oui, afficher les notes conservées</label><label><input type="radio" name="notes-${esc(p.id)}" data-point="${esc(p.id)}" data-point-field="includeNotes" value="no" ${p.includeNotes===false?'checked':''}> Non, masquer les notes dans le document</label></fieldset></div>`:''}<label>Discussions<textarea rows="7" data-point="${esc(p.id)}" data-point-field="discussion" placeholder="Saisissez vos notes. Pour une liste à puces : une ligne commençant par - suivi d’un espace.">${esc(p.discussion)}</textarea></label><label>Décisions prises (facultatif)<textarea rows="4" data-point="${esc(p.id)}" data-point-field="decisions">${esc(p.decisions)}</textarea></label>${actions(p)}</div>`);}
  function compactAgenda(){return `<div class="compact-agenda" aria-label="Accès rapide aux points de l’ordre du jour"><p><strong>Ordre du jour — accès rapide</strong></p><div>${current.agenda.map((p,i)=>`<button type="button" class="secondary" data-jump="${esc(p.id)}" ${p.status==='En cours'?'aria-current="step"':''}>${i+1}. ${esc(p.title||'Point sans titre')} <span>${esc(p.status)}</span></button>`).join('')}</div></div>`;}
  function editor(){
    captureDetails();navigation('meetings');pinDocument('meetings',current.id);const finalized=current.status==='Finalisé';
    app.innerHTML=`${notice}<div class="heading"><h1>Compte rendu de réunion</h1><div class="actions"><button class="secondary" id="meeting-back">Mes comptes rendus</button><button class="secondary" id="meeting-preview">Aperçu</button><button class="secondary" id="meeting-pdf">Exporter en PDF</button></div></div><p>Le titre suffit pour enregistrer. Les propos sont repris tels que vous les saisissez. « Finalisé » ne constitue pas une approbation officielle.</p>${finalized?'<div class="finalized-notice"><strong>Compte rendu finalisé : lecture seule.</strong><p>Pour le modifier, choisissez explicitement de le rouvrir.</p><button id="meeting-reopen">Rouvrir pour modifier</button></div>':''}<div class="savebar">${feedbackMarkup()}${finalized?'':'<button id="meeting-save">Enregistrer maintenant</button>'}<button class="secondary" id="export">Sauvegarde JSON</button>${finalized?'':'<button class="secondary" id="meeting-finalize">Finaliser</button>'}</div><form id="meeting-form"><fieldset class="meeting-fields" ${finalized?'disabled':''}>${detail('general','Informations générales',general())}${detail('people','Participants',people('present','Présents')+people('excused','Excusés')+'<p id="participant-warning" role="status"></p>')}${detail('agenda','Ordre du jour',`<div class="line"><label>Nouveau point<input id="new-point-title" placeholder="Titre du point, puis Entrée"></label><button type="button" id="add-point">Ajouter un point</button></div><p>Les flèches déplacent les points sans changer leurs notes.</p>`)}</fieldset></form>${compactAgenda()}<form id="points-form"><fieldset class="meeting-fields" ${finalized?'disabled':''}>${current.agenda.map(pointCard).join('')}</fieldset></form>`;
    for(const form of app.querySelectorAll('form')){
      form.onsubmit=e=>e.preventDefault();form.oninput=onInput;form.onclick=onClick;
      form.onkeydown=e=>{if(e.key==='Enter'&&e.target.matches('input[data-add-person-name], input[data-add-person-role], #new-point-title')){e.preventDefault();if(e.target.id==='new-point-title')addPoint();else addPerson(e.target.dataset.addPersonName||e.target.dataset.addPersonRole);}};
    }
    app.querySelectorAll('details[data-detail]').forEach(d=>d.ontoggle=()=>{if(d.open)openDetails.add(d.dataset.detail);else openDetails.delete(d.dataset.detail);});
    app.querySelector('#meeting-back').onclick=()=>{if(leave())list();};
    app.querySelector('#meeting-preview').onclick=preview;app.querySelector('#meeting-pdf').onclick=pdf;
    app.querySelector('#export').onclick=download;
    if(finalized)app.querySelector('#meeting-reopen').onclick=()=>{if(confirm('Rouvrir ce compte rendu finalisé pour le modifier ? Son statut deviendra « En cours ».')){current.status='En cours';save();editor();}};
    else {app.querySelector('#meeting-save').onclick=save;app.querySelector('#meeting-finalize').onclick=finalize;}
    app.querySelector('#add-point').onclick=addPoint;
    app.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>jump(b.dataset.jump));
    updateIndicators();
  }
  function updateIndicators(){
    if(!current)return;
    for(const key of ['present','excused']){const el=app.querySelector(`[data-count="${key}"]`);if(el)el.textContent=current[key].filter(p=>p.name.trim()).length;}
    const warning=app.querySelector('#participant-warning');if(warning){const names=participantConflicts(current);warning.textContent=names.length?'Nom présent dans les deux listes : '+names.join(', ')+'. Vérifiez ; les homonymes restent autorisés.':'';warning.className=names.length?'warning':'';}
    current.agenda.forEach((p,i)=>{
      const heading=app.querySelector(`[data-point-heading="${p.id}"]`);if(heading)heading.textContent=`${i+1}. ${p.title||'Point sans titre'}`;
      const badge=app.querySelector(`[data-point-badge="${p.id}"]`);if(badge)badge.textContent=p.status;
      const button=app.querySelector(`[data-jump="${p.id}"]`);if(button){button.textContent=`${i+1}. ${p.title||'Point sans titre'} · ${p.status}`;if(p.status==='En cours')button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');}
      const details=app.querySelector(`details[data-detail="${p.id}"]`);if(details)details.classList.toggle('point-in-progress',p.status==='En cours');
    });
  }
  function onInput(e){
    const t=e.target;if(current.status==='Finalisé')return;
    if(t.dataset.meetingField)current[t.dataset.meetingField]=t.value;
    else if(t.dataset.personField){const p=current[t.dataset.personList].find(p=>p.id===t.dataset.person);p[t.dataset.personField]=t.value;}
    else if(t.dataset.pointField){const p=findPoint(t.dataset.point);p[t.dataset.pointField]=t.dataset.pointField==='includeNotes'?t.value==='yes':t.value;}
    else if(t.dataset.actionField){const a=findPoint(t.dataset.point).actions.find(a=>a.id===t.dataset.actionId);a[t.dataset.actionField]=t.value;}
    else return;
    save();
    if(t.dataset.pointField==='status'){const id=t.dataset.point;editor();const field=app.querySelector(`[data-point="${id}"][data-point-field="status"]`);field.focus({preventScroll:true});}
  }
  function addPerson(key){
    if(current.status==='Finalisé')return;
    const name=app.querySelector(`[data-add-person-name="${key}"]`),role=app.querySelector(`[data-add-person-role="${key}"]`);
    if(!name.value.trim()){name.focus();return;}
    current[key].push(participant(name.value.trim(),role.value.trim()));save();editor();app.querySelector(`[data-add-person-name="${key}"]`).focus({preventScroll:true});
  }
  function addPoint(){
    if(current.status==='Finalisé')return;
    const input=app.querySelector('#new-point-title');const p=point(input.value.trim());current.agenda.push(p);openDetails.add(p.id);save();editor();app.querySelector('#new-point-title').focus({preventScroll:true});
  }
  function onClick(e){
    const b=e.target.closest('button');if(!b||current.status==='Finalisé')return;
    if(b.dataset.addPerson){addPerson(b.dataset.addPerson);return;}
    if(b.dataset.removePerson){current[b.dataset.personList]=current[b.dataset.personList].filter(p=>p.id!==b.dataset.removePerson);save();editor();return;}
    if(b.dataset.deletePoint){const p=findPoint(b.dataset.deletePoint);if((hasNotes(p)||p.reportNote.trim())&&!confirm('Ce point contient des notes, décisions ou actions. Le supprimer définitivement avec son contenu ?'))return;current.agenda=current.agenda.filter(p=>p.id!==b.dataset.deletePoint);openDetails.delete(b.dataset.deletePoint);save();editor();return;}
    if(b.dataset.move){const id=b.dataset.point;movePoint(current,id,Number(b.dataset.move));save();editor();jump(id);return;}
    if(b.dataset.addAction){findPoint(b.dataset.addAction).actions.push(action());save();editor();const fields=app.querySelectorAll(`[data-point="${b.dataset.addAction}"][data-action-field="text"]`);fields[fields.length-1].focus({preventScroll:true});return;}
    if(b.dataset.removeAction){const p=findPoint(b.dataset.point),a=p.actions.find(a=>a.id===b.dataset.removeAction);if((a.text.trim()||a.owner.trim()||a.due)&&!confirm('Retirer cette action renseignée ?'))return;p.actions=p.actions.filter(a=>a.id!==b.dataset.removeAction);save();editor();}
  }
  function jump(id){const d=app.querySelector(`details[data-detail="${id}"]`);if(!d)return;d.open=true;openDetails.add(id);d.scrollIntoView({block:'start',behavior:'instant'});d.querySelector('summary').focus({preventScroll:true});}
  function publicationReady(){
    try{validatePublication(current);return true;}
    catch(e){feedback('Document non disponible : '+e.message,true);const pending=unresolvedNotes(current)[0];if(pending){jump(pending.id);}return false;}
  }
  function preview(){
    if(!publicationReady())return;
    captureDetails();app.innerHTML=`<div class="heading"><h1>Aperçu du compte rendu</h1><div class="actions"><button id="meeting-edit">Revenir au compte rendu</button><button class="secondary" id="meeting-pdf">Exporter en PDF</button></div></div>${feedbackMarkup()}${dirty?'<p class="error">Cet aperçu contient des changements non sauvegardés.</p>':''}${meetingDocument(current)}`;
    app.querySelector('#meeting-edit').onclick=editor;app.querySelector('#meeting-pdf').onclick=pdf;
  }
  async function pdf(){
    try{validatePublication(current);feedback('Dans la fenêtre d’impression, choisissez « Enregistrer au format PDF ». '+(dirty?'Attention : les changements ne sont pas sauvegardés.':''));await exportPdf(structuredClone(current));}
    catch(e){feedback('Export PDF impossible : '+e.message,true);}
  }
  function finalize(){
    if(!publicationReady())return;
    const pending=pendingPoints(current);
    modal(`<h2>Finaliser le compte rendu</h2><p>Ce statut est un repère de rédaction, sans approbation officielle. Le compte rendu passera en lecture seule ; vous pourrez le rouvrir.</p>${pending.length?`<div class="warning"><p>Ces points sont encore « À aborder » ou « En cours ». Leurs états ne seront pas modifiés automatiquement.</p><ul>${pending.map(p=>`<li>${esc(p.title||'Point sans titre')} — ${esc(p.status)} <button class="secondary" data-modal="review-${esc(p.id)}">Vérifier ce point</button></li>`).join('')}</ul></div>`:'<p>Les états des points sont renseignés.</p>'}<button data-modal="finish">${pending.length?'Finaliser malgré ces points':'Confirmer la finalisation'}</button>`,async(choice,close)=>{
      if(choice.startsWith('review-')){close();jump(choice.slice(7));return;}
      if(choice==='finish'){const oldStatus=current.status;current.status='Finalisé';if(await save()){close();editor();}else{current.status=oldStatus;}}
    });
  }
  return {restoreDraft:value=>{current=structuredClone(value);dirty=true;markDraft('meetings',true);editor();},refreshList:()=>{if(app.querySelector('#meeting-list'))renderList();},list,start,leave,clear,getCurrent:()=>current,saveReference:()=>save(),renderEditor:()=>editor(),hasUnsaved:()=>dirty,getDraft:()=>dirty?current:null};
}
