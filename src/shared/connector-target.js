// Destinations exactes ; la production nécessite une activation serveur explicite.
export const TEST_BACKEND='https://grgvwyedfrxnwhgdqpoj.supabase.co';
export const PROD_BACKEND='https://zbbxhhtqcyryabfftbvq.supabase.co';
export function connectorTarget(env){
 const url=env('SUPABASE_URL'),test=url===TEST_BACKEND;
 const production=url===PROD_BACKEND&&env('VSV_CONNECTOR_ENVIRONMENT')==='production';
 return {enabled:test||production,test,production,url:test?TEST_BACKEND:PROD_BACKEND,
 site:test?'https://vsv-test.pages.dev/':'https://vsv-byl.pages.dev/',
 label:test?'VSV-TEST':'VSV',pahekoPrefix:test?'VSV_PAHEKO_TEST_':'VSV_PAHEKO_',
 allowKey:test?'VSV_GMAIL_TEST_ALLOWLIST':'VSV_GMAIL_ALLOWLIST'};
}
