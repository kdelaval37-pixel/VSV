import {hash} from './files.js';
export const validToken=token=>typeof token==='string'&&/^[A-Za-z0-9_-]{43}$/.test(token);
export async function publicResponse(db,p){
 if(!validToken(p.token))throw Error('Lien expiré ou invalide.');
 const digest=await hash(p.token),r=await db.rsvpGet(digest);
 if(!r||r.revoked||Date.parse(r.expires_at)<=Date.now()||!(await db.access(r.creator))?.active)throw Error('Lien expiré, révoqué ou invalide. Demandez un nouveau lien à VSV.');
 if(p.action==='rsvp-view')return {invitation:r.invitation,personName:r.person_name,response:r.response};
 if(p.confirmed!==true||!['Accepté','Refusé'].includes(p.response)||!/^[-a-f0-9]{36}$/i.test(p.requestId||''))throw Error('Confirmez explicitement votre réponse.');
 return db.rsvpReply(digest,p.requestId,p.response);
}
export async function issueResponse(db,actor,p){
 if(!/^[-a-f0-9]{36}$/i.test(p.id||''))throw Error('Identifiant de demande requis.');
 if(!['convocations','invitations'].includes(p.kind))throw Error('Invitation inconnue.');
 const existing=await db.rsvpById(p.id);if(existing){if(existing.creator!==actor||existing.source_id!==p.sourceId||existing.member_id!==p.memberId)throw Error('Demande déjà utilisée.');return {token:existing.link_token};}
 const snap=await db.snapshot(actor),source=snap.rows.find(r=>r.kind===p.kind&&r.id===p.sourceId&&!r.deleted)?.payload,member=snap.rows.find(r=>r.kind==='members'&&r.id===p.memberId&&!r.deleted)?.payload;
 if(!source||!member||member.archived)throw Error('Document ou membre indisponible.');
 if(p.kind==='invitations'&&!source.participants.some(m=>m.id===member.id))throw Error('Cette personne ne figure pas parmi les invités.');
 const bytes=crypto.getRandomValues(new Uint8Array(32)),token=btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
 const row={id:p.id,creator:actor,token_hash:await hash(token),link_token:token,source_kind:p.kind,source_id:p.sourceId,member_id:member.id,person_name:member.fullName||[member.firstName,member.lastName].filter(Boolean).join(' '),invitation:{title:source.title,date:source.date,startTime:source.startTime,place:source.place},expires_at:new Date(Date.now()+90*86400000).toISOString(),response:'En attente'};
 const stored=await db.rsvpCreate(row);return {token:stored.link_token};
}
