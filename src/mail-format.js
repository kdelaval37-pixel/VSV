// Small, deterministic email HTML vocabulary shared by browser and server.
// All attributes are discarded except explicitly validated presentation values.
const tags=new Set('p div br strong b em i u s span ul ol li blockquote table tbody thead tr td th h1 h2 h3'.split(' '));
export const escapeMail=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export function sanitizeMailHtml(input=''){
 if(typeof input!=='string'||input.length>100000)throw Error('Message mis en forme trop long.');
 return input.split(/(<[^>]*>)/g).map(part=>{
 if(!part.startsWith('<'))return part.replace(/</g,'&lt;');
 const match=part.match(/^<(\/?)\s*([a-z][a-z0-9]*)\b([^>]*)>$/i);if(!match)return escapeMail(part);
 const [,close,raw,attrs]=match,tag=raw.toLowerCase();if(!tags.has(tag))return '';
 if(close)return tag==='br'?'':`</${tag}>`;
 const style=(attrs.match(/\bstyle\s*=\s*"([^"]*)"/i)||attrs.match(/\bstyle\s*=\s*'([^']*)'/i))?.[1]||'';
 const safe=style.split(';').map(v=>v.trim().toLowerCase().replace(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/g,(all,...args)=>{const rgb=args.slice(0,3).map(Number);return rgb.every(v=>v<=255)?'#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join(''):all;})).filter(v=>/^(color|background-color)\s*:\s*#[0-9a-f]{6}$/.test(v)||/^font-size\s*:\s*(12|14|16|18|20|24|28|32)px$/.test(v)||/^text-align\s*:\s*(left|center|right)$/.test(v)||/^font-weight\s*:\s*(bold|700)$/.test(v)||/^font-style\s*:\s*italic$/.test(v)||/^text-decoration\s*:\s*underline$/.test(v));
 if(['table','td','th'].includes(tag))safe.push('border:1px solid #808080',...(tag==='table'?['border-collapse:collapse']:['padding:6px']));
 return `<${tag}${safe.length?' style="'+safe.join(';')+'"':''}>`;
 }).join('');
}
export const plainMailHtml=text=>'<p>'+escapeMail(text||'').replaceAll('\n','<br>')+'</p>';
