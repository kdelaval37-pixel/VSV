import {documentView,esc} from './document.js';
import {validate} from './model.js';
import {meetingDocument} from './meeting-document.js';
import {validatePublication} from './meeting-model.js';
import {pvDocument} from './pv-document.js';
import {validatePvDocument} from './pv-model.js';
export function pdfHtml(document,base){
  const kind=document.kind;
  if(kind==='pv')validatePvDocument(document);else if(kind==='meeting')validatePublication(document);else validate(document);
  const content=kind==='pv'?pvDocument(document):kind==='meeting'?meetingDocument(document):documentView(document);
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><base href="${esc(base)}"><title>${esc('VSV — '+(document.title||document.name))}</title><link rel="stylesheet" href="src/style.css"></head><body class="pdf-body">${content}</body></html>`;
}
export async function exportPdf(project){
  const html=pdfHtml(project,new URL('.',location.href).href);
  const frame=document.createElement('iframe');
  frame.title='Document prêt pour export PDF';
  frame.style.cssText='position:fixed;left:-10000px;top:0;width:900px;height:1200px;border:0';
  const loaded=new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Le document n’a pas pu être préparé. Réessayez.')),15000);frame.onload=()=>{clearTimeout(timeout);resolve();};});
  frame.srcdoc=html;document.body.append(frame);
  try{
    await loaded;
    const win=frame.contentWindow;
    await Promise.all([...win.document.images].map(img=>img.decode()));
    await win.document.fonts.ready;
    // Garder le document jusqu’à la fermeture de la fenêtre d’impression.
    win.addEventListener('afterprint',()=>frame.remove(),{once:true});
    win.focus();win.print();
  }catch(error){frame.remove();throw error;}
}
