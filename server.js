import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve(import.meta.dirname);
http.createServer(async(req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(path!==root&&!path.startsWith(root+'/'))throw Error();if(path!==root&&path!==root+'/index.html'&&!path.startsWith(root+'/src/'))throw Error();const file=path===root+'/'?root+'/index.html':path;const target=new URL(req.url,'http://localhost').pathname==='/'?root+'/index.html':file;const data=await readFile(target);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'})[extname(target)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end('Introuvable');}}).listen(4173,'127.0.0.1',()=>console.log('VSV : ouvrez http://localhost:4173 — Ctrl+C pour arrêter.'));
