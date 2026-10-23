param([ValidateSet('Preparer','Deployer')][string]$Action='Preparer')
$ErrorActionPreference='Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$branch=(git branch --show-current).Trim()
if ($branch -ne 'feature/hub-associatif-test') { throw 'Cette commande exige la branche feature/hub-associatif-test.' }
$env:VSV_BUILD_TARGET='test'
$env:VSV_SUPABASE_URL='https://grgvwyedfrxnwhgdqpoj.supabase.co'
$env:VSV_SITE_URL='https://vsv-test.pages.dev/'
if (!$env:VSV_SUPABASE_PUBLISHABLE_KEY) { $env:VSV_SUPABASE_PUBLISHABLE_KEY=Read-Host 'Clé publique publishable du projet Supabase TEST' }
npm test
if ($LASTEXITCODE -ne 0) { throw 'Tests échoués. Aucun déploiement.' }
node scripts/prepare-global.mjs
if ($LASTEXITCODE -ne 0) { throw 'Préparation SQL échouée.' }
if (Test-Path dist) { Remove-Item dist -Recurse -Force }
npm run build:pages
if ($LASTEXITCODE -ne 0) { throw 'Construction échouée. Ne rien téléverser.' }
Compress-Archive -Path dist/* -DestinationPath release/vsv-test-site.zip -Force
if ($Action -eq 'Preparer') { Write-Host 'Prêt : une seule mise à jour SQL, API puis site. Voir docs/hub/LIVRAISON-GLOBALE.md.'; exit }
# Aucun SQL exécuté ici : la cible doit être vérifiée dans le tableau de bord TEST.
$confirmation=Read-Host 'Après sauvegarde et SQL réussi dans grgvwyedfrxnwhgdqpoj, saisir exactement SQL TEST OK'
if ($confirmation -ne 'SQL TEST OK') { throw 'Arrêt : SQL de test non confirmé.' }
supabase functions deploy vsv-api --project-ref grgvwyedfrxnwhgdqpoj --no-verify-jwt
if ($LASTEXITCODE -ne 0) { throw 'API non déployée : ne pas publier le site.' }
# Branche de déploiement explicitement sélectionnée : vérifier dans Cloudflare qu’elle dessert vsv-test.pages.dev.
npx wrangler pages deploy dist --project-name vsv-test --branch feature/hub-associatif-test
if ($LASTEXITCODE -ne 0) { throw 'Site non déployé. Le ZIP reste disponible pour téléversement manuel dans vsv-test.' }
Write-Host 'Vérifier l’URL retournée : une URL de prévisualisation ne remplace pas nécessairement vsv-test.pages.dev. Ne modifier aucun paramètre de production.'
