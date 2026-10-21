// Différence UTC entre deux dates civiles ; indépendante des changements d’heure.
export function civilDays(start,end){
  if(!start||!end)return null;
  const a=Date.parse(start+'T00:00:00Z'),b=Date.parse(end+'T00:00:00Z');
  return Number.isFinite(a)&&Number.isFinite(b)?Math.round((b-a)/86400000):null;
}
