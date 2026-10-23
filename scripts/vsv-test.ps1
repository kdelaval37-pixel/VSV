# Point d'entrée réservé à VSV-TEST. Aucun SQL appliqué automatiquement.
param([ValidateSet('Verifier','Construire','Api','Site')][string]$Action='Verifier')
$ErrorActionPreference='Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$ref='grgvwyedfrxnwhgdqpoj'
$branch=(git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $branch -ne 'feature/hub-associatif-test') { throw 'Utilisez exclusivement feature/hub-associatif-test.' }
$env:VSV_BUILD_TARGET='test'
$env:VSV_SUPABASE_URL="https://$ref.supabase.co"
$env:VSV_SITE_URL='https://vsv-test.pages.dev/'
if ($Action -eq 'Verifier') {
 npm test
 if ($LASTEXITCODE -ne 0) { throw 'Tests échoués.' }
 Write-Host "Cibles autorisées : $ref et vsv-test.pages.dev. Aucun déploiement effectué."
 exit
}
if ($Action -eq 'Api') {
 # La cible est explicite : ne dépend pas du projet lié localement.
 supabase functions deploy vsv-api --project-ref $ref --no-verify-jwt
 if ($LASTEXITCODE -ne 0) { throw 'Déploiement API de test échoué.' }
 exit
}
# Efface un ancien dist AVANT construction ; ne jamais réutiliser un paquet ancien.
if (Test-Path dist) { Remove-Item dist -Recurse -Force }
npm run build:pages
if ($LASTEXITCODE -ne 0) { throw 'Construction échouée : ne rien téléverser.' }
if ($Action -eq 'Site') {
 # Conserver les identifiants Cloudflare dans la session wrangler, pas dans le dépôt.
 npx wrangler pages deploy dist --project-name vsv-test --branch $branch
 if ($LASTEXITCODE -ne 0) { throw 'Déploiement Pages de test échoué.' }
 Write-Host 'Vérifier l’URL retournée : une branche de travail peut produire une URL de prévisualisation.'
}
