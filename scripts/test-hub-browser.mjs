import {spawn} from 'node:child_process';import net from 'node:net';
const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const {port}=s.address();s.close(()=>resolve(port));});});
const server=spawn(process.execPath,['server.js'],{env:{...process.env,VSV_PORT:String(port)},stdio:['ignore','pipe','pipe']});process.env.VSV_TEST_URL=`http://127.0.0.1:${port}`;process.env.VSV_BROWSER_EXECUTABLE??='/usr/bin/chromium';
try{let ready=false;for(let n=0;n<100;n++){try{if((await fetch(process.env.VSV_TEST_URL)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error('Serveur de test indisponible.');
 for(const name of ['deployment-guard','hub-integrated','collaboration-ui','member-import','references-smoke','notices','shared','hub-shared']){console.log('Parcours navigateur : '+name);await import('../tests/browser/'+name+'.mjs');}
}finally{server.kill();}
