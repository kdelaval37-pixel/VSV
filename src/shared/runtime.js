let current=null;const pending=new Set();
export const shared=()=>current;
export const installShared=store=>{current=store;};
export function track(p){if(!p?.then)return p;pending.add(p);p.then(()=>pending.delete(p),()=>pending.delete(p));return p;}
export async function flushWrites(){while(pending.size)await Promise.allSettled([...pending]);}
export const pinDocument=(kind,id)=>current?.pin(kind,id);

const dirtyEditors=new Set();
export function markDraft(kind,dirty){dirty?dirtyEditors.add(kind):dirtyEditors.delete(kind);}
export const hasDrafts=()=>dirtyEditors.size>0;
