// Dates civiles normalisées en UTC uniquement pour l’arithmétique, sans conversion locale.
export function isCivilDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;}
export function civilDays(start,end){return isCivilDate(start)&&isCivilDate(end)?Math.round((Date.parse(end+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/86400000):null;}
export function addCivilDays(value,days){if(!isCivilDate(value)||!Number.isSafeInteger(days))return null;const d=new Date(Date.parse(value+'T00:00:00Z')+days*86400000);return Number.isFinite(d.getTime())&&d.getUTCFullYear()>=0&&d.getUTCFullYear()<=9999?d.toISOString().slice(0,10):null;}
