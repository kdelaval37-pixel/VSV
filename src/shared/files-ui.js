import {esc} from '../document.js';
import {fileType} from './files.js';
import {sharedDialog} from './dialog.js';
export async function filePayload(file){
 if(!file||file.size>8000000)throw Error('Fichier : maximum 8 Mo pour une photo à réduire, 5 Mo pour un PDF.');
 if(file.size>5242880&&!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('PDF : maximum 5 Mo.');
 const bytes=new Uint8Array(await file.arrayBuffer()),[mime]=fileType(bytes);
 if(mime==='application/pdf'&&bytes.length>5242880)throw Error('PDF : maximum 5 Mo.');
 if(mime.startsWith('image/')&&bytes.length>225000){if(typeof createImageBitmap!=='function')throw Error('Image : maximum 225 Ko. Utilisez une image réduite.');const image=await createImageBitmap(file);try{let width=Math.min(1400,image.width),height=Math.round(image.height*width/image.width);for(let attempt=0;attempt<5;attempt++){const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(width));canvas.height=Math.max(1,Math.round(height));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.75));if(blob&&blob.size<=225000)return filePayload(new File([blob],file.name.replace(/\.[^.]+$/,'')+'.webp',{type:'image/webp'}));width*=.75;height*=.75;}throw Error('Image : maximum 225 Ko après réduction.');}finally{image.close();}}
 let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 return {name:file.name,base64:btoa(binary)};
}
export function privateFiles(store,{onSelect,confidential=false}={}){
 const d=sharedDialog(onSelect?'Choisir un fichier privé':'Fichiers partagés privés'),root=d.querySelector('[data-body]'),status=d.querySelector('[role=status]');
 let busy=false,search='';const say=t=>status.textContent=t;
 async function load(){
  try{const {files}=await store.call({action:'files',confidential});if(!d.isConnected)return;
   root.innerHTML=`<p>PDF : 5 Mo maximum. Images PNG, JPEG ou WebP : 225 Ko maximum. Accès réservé aux comptes actifs. Aucun envoi par e-mail.</p><label>Rechercher un fichier<input data-file-search type="search" value="${esc(search)}"></label><label>Ajouter un fichier privé<input data-upload type="file" accept="application/pdf,image/png,image/jpeg,image/webp"></label><div data-files></div>`;
   function render(){const q=search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');const found=files.filter(f=>f.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').includes(q));root.querySelector('[data-files]').innerHTML=found.map(f=>`<div class="reference-item"><span>${esc(f.name)} <small>${Math.ceil(f.size/1024)} Ko</small></span>${onSelect?`<button type="button" data-select="${esc(f.path)}">Choisir</button>`:''}<button type="button" data-download="${esc(f.path)}" class="secondary">Télécharger</button></div>`).join('')||'<p>Aucun fichier correspondant.</p>';
    root.querySelectorAll('[data-select]').forEach(b=>b.onclick=()=>{const f=files.find(f=>f.path===b.dataset.select);onSelect(f);d.querySelector('[data-close]').click();});
    root.querySelectorAll('[data-download]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{const f=files.find(f=>f.path===b.dataset.download),{data,error}=await store.client.storage.from(confidential?'vsv-private-admin':'vsv-private').download(f.path);if(error)throw Error('Accès au fichier refusé.');const url=URL.createObjectURL(data),a=document.createElement('a');a.href=url;a.download=f.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){say(e.message);}finally{b.disabled=false;}});
   }
   root.querySelector('[data-file-search]').oninput=e=>{search=e.target.value;render();};render();if(status.textContent==='Chargement…')say('');
   root.querySelector('[data-upload]').onchange=async e=>{if(busy)return;const input=e.target,file=input.files[0];if(!file)return;busy=true;input.disabled=true;say('Enregistrement du fichier…');try{await store.call({action:'upload',confidential,...await filePayload(file)});say('Fichier enregistré sur le serveur.');await load();}catch(e){say('Fichier non confirmé : '+e.message+' Vous pouvez réessayer avec le même fichier ; son contenu identique ne crée pas de copie supplémentaire.');}finally{busy=false;input.disabled=false;}};
  }catch(e){say('Liste des fichiers indisponible : '+e.message);}
 }
 say('Chargement…');load();return d;
}
// Le champ reste une référence textuelle compatible avec les anciennes sauvegardes/PDF.
export function attachPrivateFile(input,store){
 if(!input||!store)return;const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent='Choisir un fichier privé';button.setAttribute('aria-label','Choisir un fichier privé pour '+(input.closest('label')?.firstChild?.textContent||'ce champ').trim());
 input.after(button);button.onclick=()=>privateFiles(store,{onSelect:file=>{const ref=`${file.name} — vsv-file:${file.path}`;input.value=input.tagName==='TEXTAREA'&&input.value?input.value+'\n'+ref:ref;input.dispatchEvent(new Event('input',{bubbles:true}));}});
}
