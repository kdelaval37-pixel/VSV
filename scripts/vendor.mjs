import {build} from 'esbuild';
import {readFile,readdir,writeFile} from 'node:fs/promises';
const result=await build({stdin:{contents:"export {createClient} from '@supabase/supabase-js';",resolveDir:process.cwd(),sourcefile:'supabase-client.js'},bundle:true,minify:true,metafile:true,format:'esm',platform:'browser',target:['safari15','chrome100','firefox100'],outfile:'src/vendor/supabase.js',legalComments:'eof'});
const packages=[...new Set(Object.keys(result.metafile.inputs).flatMap(p=>{const m=p.replaceAll('\\','/').match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);return m?[m[1]]:[];}))];
let licenses='Client Supabase officiel — dépendances incluses dans le fichier généré\n';for(const name of packages){const dir='node_modules/'+name;for(const file of await readdir(dir))if(/^(license|copying|copyrightnotice)(\.|$)/i.test(file)){try{licenses+='\n\n=== '+name+' / '+file+' ===\n'+await readFile(dir+'/'+file,'utf8');}catch{}}}await writeFile('src/vendor/THIRD_PARTY_LICENSES.txt',licenses);
