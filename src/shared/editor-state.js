import {markDraft} from './runtime.js';
// Les formulaires manuels utilisent le même état que les documents auto-enregistrés.
// Aucune promesse de copie locale avant une tentative d’enregistrement.
export function observeEditor(form){
 const token='editor-'+crypto.randomUUID();
 const changed=()=>markDraft(token,true),clear=()=>markDraft(token,false);
 form.addEventListener('input',changed);form.addEventListener('change',changed);
 const observer=new MutationObserver(()=>{if(!form.isConnected){clear();observer.disconnect();}});
 observer.observe(document.body,{childList:true,subtree:true});
 return clear;
}
