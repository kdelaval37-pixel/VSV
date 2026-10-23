import {esc} from '../document.js';
let sequence=0;
// Même fermeture clavier et retour du focus pour les outils partagés.
export function sharedDialog(title){
 const previous=document.activeElement,d=document.createElement('dialog'),id=`shared-dialog-title-${++sequence}`;
 d.className='reference-dialog shared-dialog';d.setAttribute('aria-labelledby',id);
 d.innerHTML=`<div class="heading"><h2 id="${id}" tabindex="-1">${esc(title)}</h2><button type="button" class="secondary" data-close>Fermer</button></div><div data-body></div><p role="status" aria-live="polite"></p>`;
 document.body.append(d);
 const close=()=>{d.close();d.remove();if(previous?.isConnected)previous.focus();};
 d.querySelector('[data-close]').onclick=close;d.addEventListener('cancel',e=>{e.preventDefault();close();});
 d.showModal();return d;
}
