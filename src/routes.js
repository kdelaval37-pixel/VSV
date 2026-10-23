export const documentRoutes=['projects','meetings','pvs','reviews','convocations','invitations','hub'];
export const pages=['home',...documentRoutes,'stocks','cash','shopping','settings','agenda','tasks','association','teams','communication','dossier'];
export function parseRoute(hash){try{const [page,id,...rest]=hash.replace(/^#/,'').split('/').map(decodeURIComponent);return pages.includes(page)&&!rest.length&&(!id||(documentRoutes.includes(page)||page==='dossier')&&id.length<=200)?{page,id:id||null}:null;}catch{return null;}}
export const routeHash=(page,id)=>'#'+encodeURIComponent(page)+(id?'/'+encodeURIComponent(id):'');

export const pageTitles={home:"Accueil",projects:"Fiches projets",meetings:"Comptes rendus",pvs:"Procès-verbaux",reviews:"Bilans d’action",convocations:"Convocations",invitations:"Invitations",stocks:"Stocks",cash:"Caisse",shopping:"Liste de courses",settings:"Paramètres",agenda:"Agenda",tasks:"Tâches et décisions",association:"Documents et partenaires",teams:"Bénévolat et équipes",communication:"Communication",dossier:"Dossier projet",hub:"Document partagé"};
