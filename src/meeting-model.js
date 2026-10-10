export const meetingStatuses = ['Brouillon', 'En cours', 'Finalisé'];
export const pointStatuses = ['À aborder', 'En cours', 'Discuté', 'Non discuté'];
export const meetingFields = [
  ['title', 'Titre de la réunion', 'text'], ['place', 'Lieu', 'text'],
  ['date', 'Date', 'date'], ['startTime', 'Heure de début', 'time'],
  ['endTime', 'Heure de fin (facultative)', 'time'],
  ['facilitator', 'Personne animant la réunion (facultatif)', 'text'],
  ['writer', 'Personne rédigeant le compte rendu (facultatif)', 'text']
];
export function meeting() {
  return {kind: 'meeting', id: crypto.randomUUID(), updatedAt: new Date().toISOString(),
    status: 'Brouillon', ...Object.fromEntries(meetingFields.map(([key]) => [key, ''])),
    present: [], excused: [], agenda: []};
}
export const participant = (name = '', role = '') => ({id: crypto.randomUUID(), name, role});
export const action = () => ({id: crypto.randomUUID(), text: '', owner: '', due: ''});
export function point(title = '') {
  return {id: crypto.randomUUID(), title, status: 'À aborder', discussion: '', decisions: '',
    reportNote: '', includeNotes: null, actions: []};
}
export function hasNotes(p) {
  return Boolean(p.discussion.trim() || p.decisions.trim() || p.actions.some(a => a.text.trim() || a.owner.trim() || a.due));
}
export function unresolvedNotes(m) {
  return m.agenda.filter(p => p.status === 'Non discuté' && hasNotes(p) && p.includeNotes === null);
}
export const pendingPoints = m => m.agenda.filter(p => ['À aborder', 'En cours'].includes(p.status));
export const notesVisible = p => p.status !== 'Non discuté' || p.includeNotes === true;
export function duplicateMeeting(original, structureOnly = false) {
  const m = structuredClone(original);
  m.id = crypto.randomUUID(); m.title += structureOnly ? ' (prochaine réunion)' : ' (copie)';
  m.status = 'Brouillon'; m.updatedAt = new Date().toISOString();
  m.present.forEach(p => p.id = crypto.randomUUID()); m.excused.forEach(p => p.id = crypto.randomUUID());
  m.agenda.forEach(p => {p.id = crypto.randomUUID(); p.actions.forEach(a => a.id = crypto.randomUUID());});
  if (structureOnly) {
    m.date = ''; m.startTime = ''; m.endTime = ''; m.present = []; m.excused = [];
    m.agenda = m.agenda.map(p => point(p.title));
  }
  return m;
}
export function movePoint(m, id, delta) {
  const index = m.agenda.findIndex(p => p.id === id);
  const target = index + delta;
  if (index < 0 || target < 0 || target >= m.agenda.length) return false;
  [m.agenda[index], m.agenda[target]] = [m.agenda[target], m.agenda[index]];
  return true;
}
export function participantConflicts(m) {
  const normalize = name => name.trim().normalize('NFC').toLocaleLowerCase('fr');
  const present = new Set(m.present.map(p => normalize(p.name)).filter(Boolean));
  return [...new Set(m.excused.filter(p => present.has(normalize(p.name))).map(p => p.name.trim()))];
}
function text(value) {if (typeof value !== 'string' || value.length > 100000) throw Error('Champ du compte rendu invalide.');}
function identity(value) {text(value); if (!/^[A-Za-z0-9_-]{1,200}$/.test(value)) throw Error('Identifiant du compte rendu invalide.');}
function list(value) {if (!Array.isArray(value) || value.length > 1000) throw Error('Liste du compte rendu invalide.');}
function dateValue(value) {
  text(value);
  if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value)) throw Error('Date du compte rendu invalide.');
}
export function validateMeeting(m) {
  if (!m || m.kind !== 'meeting') throw Error('Compte rendu invalide.');
  identity(m.id); text(m.updatedAt);
  if (!Number.isFinite(Date.parse(m.updatedAt))) throw Error('Date de modification invalide.');
  meetingFields.forEach(([key]) => text(m[key]));
  if (!m.title.trim()) throw Error('Le titre de la réunion est obligatoire.');
  if (!meetingStatuses.includes(m.status)) throw Error('Statut du compte rendu invalide.');
  dateValue(m.date);
  for (const key of ['startTime','endTime']) if (m[key] && !/^([01]\d|2[0-3]):[0-5]\d$/.test(m[key])) throw Error('Horaire invalide.');
  const ids = new Set();
  function unique(id) {identity(id); if (ids.has(id)) throw Error('Identifiant de ligne en double.'); ids.add(id);}
  for (const key of ['present', 'excused']) {
    list(m[key]); m[key].forEach(p => {if (!p) throw Error('Participant invalide.');unique(p.id);text(p.name);text(p.role);});
  }
  list(m.agenda); m.agenda.forEach(p => {
    if (!p) throw Error('Point invalide.');unique(p.id);
    for (const key of ['title','discussion','decisions','reportNote']) text(p[key]);
    if (!pointStatuses.includes(p.status) || ![null,true,false].includes(p.includeNotes)) throw Error('État du point invalide.');
    list(p.actions);p.actions.forEach(a => {if(!a)throw Error('Action invalide.');unique(a.id);text(a.text);text(a.owner);dateValue(a.due);});
  });
  return m;
}
export function validatePublication(m) {
  validateMeeting(m);
  if (unresolvedNotes(m).length) throw Error('Choisissez si les notes des points « Non discuté » doivent apparaître dans le document.');
  return m;
}
