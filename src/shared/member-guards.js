import {pahekoId,assertMemberUniqueness} from '../member-identity.js';
export const memberRows=rows=>rows.filter(r=>r.table==='vsv_references'&&r.kind==='members');
export function memberWriteGuard(rows,changes){
 const known=memberRows(rows);
 for(const c of changes){
  if(c.table!=='vsv_references'||c.kind!=='members'||c.deleted)continue;
  const old=known.find(r=>r.id===c.id),external=pahekoId(c.payload.externalId);
  if(old?.deleted)throw Object.assign(Error('Cette fiche a été supprimée logiquement. Elle ne peut pas être restaurée par un import.'),{code:'CONFLICT',record:'vsv_references/members/'+c.id,remote:old});
  if(external&&(!old||pahekoId(old.payload.externalId)!==external)&&known.some(r=>r.deleted&&r.payload&&pahekoId(r.payload.externalId)===external))throw Error('Cet identifiant Paheko figure dans une suppression logique. Import refusé, sans restauration automatique.');
 }
}
export function memberMigrationConflicts(rows,incoming){
 const known=memberRows(rows),seen=new Map(),conflicts=[];
 for(const m of incoming.repositories?.members||[]){
  const external=pahekoId(m.externalId);if(!external)continue;
  const same=known.find(r=>r.id===m.id&&!r.deleted&&r.payload&&pahekoId(r.payload.externalId)===external);
  const match=known.find(r=>r.id!==m.id&&r.payload&&pahekoId(r.payload.externalId)===external&&(!r.deleted||!same));
  const duplicate=seen.get(external);
  if(match||duplicate)conflicts.push({kind:'members',id:m.id,reason:match?.deleted?'deleted-member-identity':'duplicate-paheko-id',existingId:match?.id||duplicate});
  seen.set(external,m.id);
 }
 return conflicts;
}
export function validateLiveMembers(data){assertMemberUniqueness(data.repositories?.members||[]);}
