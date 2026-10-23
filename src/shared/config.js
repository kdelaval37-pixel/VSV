// Clé PUBLIQUE publishable, autorisée dans le navigateur. Les secrets restent dans Supabase.
const testConfig=typeof location!=='undefined'&&['localhost','127.0.0.1'].includes(location.hostname)?globalThis.__VSV_TEST_CONFIG__:null;
export const cloudConfig=testConfig||{url:'https://zbbxhhtqcyryabfftbvq.supabase.co',key:'sb_publishable_XaB2tEJyRJ71B6iaEIKtkQ_ToOlCrf3',redirect:'https://vsv-byl.pages.dev/'};
export const usesShared=()=>typeof location!=='undefined'&&(!['localhost','127.0.0.1',''].includes(location.hostname)||new URLSearchParams(location.search).get('partage')==='1');

// Une prévisualisation ou un paquet mal construit ne doit jamais se connecter au backend d’un autre site.
export const validDeployment=()=>typeof location!=='undefined'&&(['localhost','127.0.0.1'].includes(location.hostname)||location.origin===new URL(cloudConfig.redirect).origin);
