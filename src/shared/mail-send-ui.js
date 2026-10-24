export function bindMailSend({button,status,store,getEntry,save}){
 if(!store||!store.access?.technical_admin&&!store.access?.can_send_mail){button.disabled=true;status.textContent=store?'Votre compte peut préparer le message ; un administrateur doit vous accorder le droit d’envoi.':'Connectez-vous à VSV pour envoyer ce message.';return;}
 let attempt=null,busy=false;
 button.onclick=async()=>{if(busy)return;busy=true;button.disabled=true;
 try{
 if(!store)throw Error('Connectez-vous à VSV pour envoyer ce message.');
 if(!attempt){if(!await save())throw Error('Le brouillon doit être enregistré avant l’envoi.');const e=getEntry();if(e.members.some(m=>!m.email?.trim()))throw Error('Un membre sélectionné n’a pas d’adresse mail. Complétez sa fiche ou retirez-le de la sélection.');
 const payload={documentId:e.id,subject:e.title,body:e.notes,bodyHtml:e.bodyHtml||'',recipients:[...new Set([...e.members.map(m=>m.email),...(e.email||'').split(/[,;\s]+/)].filter(Boolean).map(s=>s.trim().toLowerCase()))],attachments:e.attachments?.length?e.attachments:e.file?[e.file]:[]};
 if(!payload.recipients.length)throw Error('Sélectionnez au moins un destinataire.');if(payload.recipients.length>10)throw Error('La limite actuelle est de 10 destinataires par envoi.');attempt={action:'mail-send',id:crypto.randomUUID(),payload};}
 status.textContent='Envoi en cours…';const {job}=await store.call(attempt);
 status.textContent=({sent:'Messages envoyés individuellement par Gmail. La réception n’est pas vérifiée.',sending:'Envoi en cours : vérifiez cette demande avant de recommencer.',queued:'Envoi en attente.',failed:'Échec : consultez l’historique dans Communication pour reprendre les échecs certains.',uncertain:'Résultat incertain : vérifiez la boîte Envoyés. Aucun renvoi automatique.'})[job.state]+' '+(job.error||'');
 button.textContent=job.state==='sent'?'ENVOYÉ':'VÉRIFIER CET ENVOI';if(job.state==='sent')button.dataset.sent='true';
 }catch(e){status.textContent=e.message;if([400,422].includes(e.status)){attempt=null;button.textContent='ENVOYER';}if(attempt)button.textContent='VÉRIFIER CET ENVOI';}finally{busy=false;button.disabled=button.dataset.sent==='true';}
 };
}
