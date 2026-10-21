import {previewMemberImport,applyMemberImport} from './csv.js';
import {sameMember} from './member-identity.js';
import {record} from './shared/command-context.js';
function impl(data,{rows,mapping,decisions={},file,observed=[]}){
 if(typeof file!=='string'||file.length>1000||!Array.isArray(observed)||observed.length>50000)throw Error('Demande d’import de membres invalide.');
 const entries=previewMemberImport(data.repositories,rows,mapping,decisions);
 for(const e of entries){
  if(e.mode!=='update'||e.errors.length)continue;
  const baseline=observed.find(m=>m.id===e.target.id);
  // Une création concurrente identique devient « inchangée ». Une différence impose un nouvel aperçu.
  if(!baseline||!sameMember(baseline,e.target))throw Object.assign(Error('Un membre a changé depuis l’aperçu. Comparez de nouveau avant l’import.'),{code:'CONFLICT',record:'vsv_references/members/'+e.target.id,remote:{payload:structuredClone(e.target)}});
 }
 data.repositories=applyMemberImport(data.repositories,entries,file);
 return data.repositories.lastImport;
}
export const importMembers=(...args)=>record('importMembers',args,()=>impl(...args));
