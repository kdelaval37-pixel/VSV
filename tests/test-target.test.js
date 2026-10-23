import test from 'node:test';import assert from 'node:assert/strict';
import {testTarget,TEST_URL,TEST_SITE} from '../scripts/test-target.mjs';
const env=()=>({VSV_BUILD_TARGET:'test',VSV_SUPABASE_URL:TEST_URL,VSV_SITE_URL:TEST_SITE,VSV_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fictif'});
test('VSV-TEST : cible exacte et clé publique explicites',()=>{assert.equal(testTarget(env()).url,TEST_URL);});
test('VSV-TEST : production, sous-domaines trompeurs et secrets refusés',()=>{for(const patch of [{VSV_BUILD_TARGET:''},{VSV_SUPABASE_URL:'https://zbbxhhtqcyryabfftbvq.supabase.co'},{VSV_SITE_URL:'https://vsv-byl.pages.dev/'},{VSV_SUPABASE_URL:TEST_URL+'.example.invalid'},{VSV_SUPABASE_PUBLISHABLE_KEY:'sb_secret_fictif'},{VSV_SUPABASE_PUBLISHABLE_KEY:undefined}])assert.throws(()=>testTarget({...env(),...patch}));});
