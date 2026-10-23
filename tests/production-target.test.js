import test from 'node:test';import assert from 'node:assert/strict';
import {connectorTarget,PROD_BACKEND,TEST_BACKEND} from '../src/shared/connector-target.js';
import {pahekoConnector} from '../src/shared/paheko.js';import {pahekoHeaders} from '../src/csv.js';
test('Production : opt-in exact et absence de retombée sur les secrets TEST',async()=>{
 for(const url of [PROD_BACKEND,'https://example.invalid',PROD_BACKEND+'.evil.invalid'])assert.equal(connectorTarget(k=>k==='SUPABASE_URL'?url:'').enabled,false);
 assert.equal(connectorTarget(k=>k==='SUPABASE_URL'?TEST_BACKEND:'').enabled,true);
 const envs={SUPABASE_URL:PROD_BACKEND,VSV_CONNECTOR_ENVIRONMENT:'production',VSV_PAHEKO_TEST_HOST:'test.example.invalid',VSV_PAHEKO_TEST_CATEGORY_IDS:'1',VSV_PAHEKO_TEST_AUTHORIZATION:'Basic fictif'};
 const p=pahekoConnector({env:k=>envs[k],fetcher:()=>{throw Error('Aucun réseau attendu');}});assert.equal(p.ready(),false);await assert.rejects(p.preview());
});
test('Paheko production : GET uniquement, hôte configuré et aperçu sans écriture (HTTP simulé)',async()=>{
 const envs={SUPABASE_URL:PROD_BACKEND,VSV_CONNECTOR_ENVIRONMENT:'production',VSV_PAHEKO_HOST:'association.example.invalid',VSV_PAHEKO_CATEGORY_IDS:'1',VSV_PAHEKO_AUTHORIZATION:'Basic fictif'};
 let calls=0;const p=pahekoConnector({env:k=>envs[k],fetcher:async(url,options)=>{calls++;assert.equal(url,'https://association.example.invalid/api/user/category/1.csv');assert.equal(options.method,'GET');assert.equal(options.redirect,'error');assert.equal(options.headers.Authorization,'Basic fictif');return new Response([pahekoHeaders,['001','Membre fictif','','','','','','','','','','Actifs']].map(r=>r.map(x=>JSON.stringify(x)).join(',')).join('\n'));}});
 assert.equal(p.ready(),true);assert.equal((await p.preview()).total,1);assert.equal(calls,1);
});
