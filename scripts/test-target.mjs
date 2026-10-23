// Cibles autorisées pour les outils de test. Aucune valeur secrète ici.
export const TEST_PROJECT='grgvwyedfrxnwhgdqpoj';
export const TEST_URL=`https://${TEST_PROJECT}.supabase.co`;
export const TEST_SITE='https://vsv-test.pages.dev/';
export function testTarget(env){
 if(env.VSV_BUILD_TARGET!=='test')throw Error('Définissez VSV_BUILD_TARGET=test.');
 if(env.VSV_SUPABASE_URL!==TEST_URL||env.VSV_SITE_URL!==TEST_SITE)throw Error('Cible refusée : utilisez exclusivement le projet Supabase et le site VSV-TEST documentés.');
 if(!/^sb_publishable_[A-Za-z0-9_-]+$/.test(env.VSV_SUPABASE_PUBLISHABLE_KEY??''))throw Error('Renseignez la clé publique publishable de VSV-TEST, jamais une clé secrète.');
 return {url:TEST_URL,key:env.VSV_SUPABASE_PUBLISHABLE_KEY,redirect:TEST_SITE};
}
