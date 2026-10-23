# Passage du hub sur VSV officiel

Cible : **VSV**, `https://vsv-byl.pages.dev/`, Supabase
`zbbxhhtqcyryabfftbvq`. Le site TEST reste indépendant.
Aucune réinitialisation ni copie de la base TEST : conserver les données officielles.
Cette procédure ne lance aucun courriel automatiquement.

## 1. Sauvegarder et préparer

Dans VSV officiel, télécharger une sauvegarde JSON complète. Conserver les
sauvegardes Supabase disponibles et le déploiement Cloudflare actuel pour retour
arrière. La sauvegarde JSON ne remplace pas une sauvegarde SQL du schéma et de
l'authentification. Ne pas effacer les navigateurs.

PowerShell :

```powershell
Set-Location "$env:USERPROFILE\Downloads\VSV-hub-global"
git fetch origin
git switch release/hub-production
git pull --ff-only
npm.cmd ci
npm.cmd test
$env:VSV_BUILD_TARGET = "production"
node scripts/prepare-production.mjs
notepad release/vsv-production-mise-a-jour.sql
```

Ne pas fusionner `main` à cette étape : Cloudflare publie automatiquement `main`.

## 2. Base officielle avant API et site

Dans le SQL Editor du projet **zbbxhhtqcyryabfftbvq**, exécuter le contenu complet
`release/vsv-production-mise-a-jour.sql`. Le script vérifie le socle, ajoute les
protections membres si absentes et les six migrations du hub. Transaction globale,
aucune suppression ni nettoyage. Une installation partielle ou des doublons
provoquent un arrêt : ne pas contourner l'erreur. Les marqueurs permettent une
nouvelle exécution sans réimporter les données. La sélection du projet dans le
Dashboard reste indispensable : le SQL ne peut pas identifier à lui seul le projet.

Puis :

```powershell
npx.cmd supabase functions deploy vsv-api --project-ref zbbxhhtqcyryabfftbvq --no-verify-jwt
```

Attendre `Deployed Functions on project zbbxhhtqcyryabfftbvq`.

## 3. Connecteurs de production

Dans **ce projet officiel uniquement**, Edge Functions > Secrets :

| Nom | Valeur |
| --- | --- |
| VSV_SITE_URL | https://vsv-byl.pages.dev/ |
| VSV_CONNECTOR_ENVIRONMENT | production |
| VSV_GOOGLE_CLIENT_ID | identifiant OAuth du client Google |
| VSV_GOOGLE_CLIENT_SECRET | secret du client Google |
| VSV_GMAIL_SENDER | veillesolidairedevierzon@gmail.com |
| VSV_GMAIL_ALLOWLIST | adresses autorisées séparées par des virgules ; commencer par les comptes de vérification |
| VSV_CONNECTOR_ENCRYPTION_KEY | nouvelle clé aléatoire de 32 octets, encodée en Base64 |
| VSV_PAHEKO_HOST | veille-solidaire-de-vierzon.paheko.cloud |
| VSV_PAHEKO_CATEGORY_IDS | 1,3,4 |
| VSV_PAHEKO_AUTHORIZATION | autorisation Basic de l'identifiant API Paheko en lecture seule |
| VSV_PAHEKO_VERSION | 1.3.24 |

Les noms Paheko et la liste Gmail de production ne contiennent pas `_TEST_`.
Ne pas copier les tokens OAuth ni les tables du TEST. Conserver une clé de
chiffrement stable une fois Google connecté. Pour générer la nouvelle clé et la
copier sans l'afficher dans PowerShell :

```powershell
$vsvBytes = New-Object byte[] 32
$vsvRng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$vsvRng.GetBytes($vsvBytes)
[Convert]::ToBase64String($vsvBytes) | Set-Clipboard
$vsvRng.Dispose()
Remove-Variable vsvBytes, vsvRng
```

Coller uniquement dans le secret `VSV_CONNECTOR_ENCRYPTION_KEY` du projet officiel.
Ne pas communiquer de secret dans une conversation ni les mettre dans Cloudflare.

Dans le client OAuth Google, **ajouter** le callback officiel sans retirer celui
qui sert à TEST :

```
https://zbbxhhtqcyryabfftbvq.supabase.co/functions/v1/vsv-api?route=google-oauth
```

L'état « test » ou « production » du consentement Google est indépendant du site
VSV. Les restrictions du compte Google restent applicables. Une nouvelle connexion
OAuth depuis VSV officiel sera nécessaire. Le logiciel garde la limite de dix
adresses par demande et la liste autorisée obligatoire, y compris en production.
Les messages sont individuels. Aucun envoi planifié ni synchronisation automatique.

## 4. Site officiel en dernier

Après réussite du SQL et du déploiement API, fusionner la branche de livraison
vers `main` via la PR. Vérifier dans Cloudflare **VSV** :

- branche de production `main` ;
- commande `npm run build:pages` ; sortie `dist` ;
- `VSV_BUILD_TARGET=production` (jamais `test`) ;
- retirer les variables de compilation TEST si présentes.

Le paquet production utilise la configuration publique officielle déjà présente
dans `src/shared/config.js`. Aucun secret n'est nécessaire dans Cloudflare.
Attendre le succès du déploiement du commit fusionné, puis recharger VSV officiel.
La version dans Paramètres doit correspondre au commit publié. Ne pas téléverser
le `dist` construit pour TEST sur le site officiel.

## 5. Vérification groupée et retour arrière

Vérifier une fois : connexion administrateur + adhérent, données existantes,
menu Agenda, ouverture/enregistrement d'un document, Google (renouvellement sans
envoi), puis un message individuel aux seules adresses de vérification. Récupérer
Paheko et lire l'aperçu avant confirmation ; ne pas créer de doublons. Ajouter les
autres destinataires autorisés seulement après ce contrôle.

Si le site pose problème, restaurer le précédent déploiement Cloudflare. Désactiver
les connecteurs en retirant `VSV_CONNECTOR_ENVIRONMENT` si nécessaire. Conserver
les nouvelles tables et les données : aucune migration inverse destructive. Si
l'API doit être restaurée, utiliser le commit précédent et redéployer `vsv-api` sur
le projet officiel, après examen de sa compatibilité avec les nouvelles données.

## Vérifications de cette préparation

199 tests Node réussis, dont isolation TEST/production, OAuth officiel avec retour
au bon site, chiffrement, idempotence d'envoi et Paheko GET. Services externes
simulés, aucun message réel envoyé. Compilation production réussie. Les migrations
sources ont déjà été utilisées sur TEST ; le nouveau paquet SQL de production n'a
pas été exécuté ici sur PostgreSQL ou Supabase. Aucun accès administrateur aux
consoles hébergées dans cette session. Les essais utilisateurs Gmail et Paheko
précédents concernent TEST uniquement, pas la production.
