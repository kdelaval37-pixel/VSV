import {registerScheduledSave,shared,markDraft} from './runtime.js';
export function documentAutosave({kind,getDocument,save,changed,delay=4000}){
 let timer=null,localTimer=null;
 const cancel=()=>{clearTimeout(timer);clearTimeout(localTimer);timer=null;localTimer=null;registerScheduledSave(flush,false);};
 const flush=()=>{if(timer===null)return;cancel();return save();};
 function schedule(){cancel();const doc=getDocument();if(!doc)return;changed();const k=typeof kind==='function'?kind():kind;markDraft(k,true);
 localTimer=setTimeout(()=>{const store=shared();if(store){const data=store.read(),items=data[k]??=[];data[k]=items.filter(x=>x.id!==doc.id).concat(structuredClone(doc));store.remember(data);}},300);
 timer=setTimeout(()=>{Promise.resolve(flush()).catch(()=>{});},delay);registerScheduledSave(flush,true);}
 return {schedule,cancel,flush};
}
