# Paheko 1.3.24 : catégories vers VSV-TEST

Cette correction ajoute la lecture de plusieurs exports CSV à la suite, puis ouvre
l'assistant d'import existant. Aucun import automatique, aucun appel d'écriture
à Paheko et aucun changement de droits VSV. Production et `main` exclus.

## Périmètre vérifié

L'utilisateur a vérifié l'authentification réelle avec `GET /api/user/categories/`
et communiqué les résultats : catégorie 1, Membres actifs (85), catégorie 3,
Administrateurs (1), catégorie 4, Bureau (6). Catégories 2 et 5 : zéro membre au
moment du contrôle. La sélection `1,3,4` est explicite, elle ne s'étend pas
silencieusement aux catégories futures ou aux anciens membres.

La source est le Paheko réel de l'association, autorisé en lecture seule par
l'utilisateur pour cette connexion au site TEST. Seul Supabase TEST conserve
l'autorisation API. L'autorisation Paheko de lecture donne accès à davantage de
données que les membres : le connecteur n'appelle que les trois exports choisis,
jamais la sauvegarde complète ni une route de mutation.

Documentation fournie par l'utilisateur pour sa version :
`GET /api/user/category/{ID}.csv`. Les douze en-têtes de son export manuel sont
ceux déjà reconnus par VSV. L'export réel de l'API reste à vérifier ; s'il diffère,
le connecteur refuse l'import au lieu de supposer une correspondance.

## Une seule mise à jour du serveur TEST

1. Télécharger une sauvegarde VSV-TEST depuis les paramètres.
2. Dans PowerShell, dans le dépôt :

```powershell
Set-Location "$env:USERPROFILE\Downloads\VSV-hub-global"
git status --short
git pull --ff-only
npx.cmd supabase functions deploy vsv-api --project-ref grgvwyedfrxnwhgdqpoj --no-verify-jwt
```

Si Git signale des modifications locales, ne pas les supprimer globalement.
Le module `src/shared/paheko.js` doit apparaître dans les fichiers téléversés.
Aucune migration SQL. Pas de nouvelle compilation ni de téléversement Cloudflare
nécessaire : le contrat d'aperçu CSV existant est conservé.

3. Supabase **TEST** `grgvwyedfrxnwhgdqpoj` > Edge Functions > Secrets :

| Nom | Valeur |
|---|---|
| `VSV_PAHEKO_TEST_HOST` | `veille-solidaire-de-vierzon.paheko.cloud` |
| `VSV_PAHEKO_TEST_CATEGORY_IDS` | `1,3,4` |
| `VSV_PAHEKO_VERSION` | `1.3.24` |
| `VSV_PAHEKO_TEST_AUTHORIZATION` | `Basic ` suivi de l'encodage de l'identifiant API et du mot de passe |

La liste de catégories est prioritaire sur l'ancien `VSV_PAHEKO_TEST_CSV_URL`.
Ne pas mettre de liste d'URL dans cet ancien secret. Ne pas modifier les secrets Google.

Pour préparer l'autorisation sans écrire le mot de passe dans la commande ou
l'afficher dans le terminal, coller ce bloc PowerShell. La boîte de dialogue
permet de saisir/coller l'identifiant API et son mot de passe :

```powershell
$vsvCredential = Get-Credential -Message "Acces API Paheko en lecture seule" -UserName "vsv_test"
if ($null -ne $vsvCredential) {
    try {
        $vsvPair = $vsvCredential.UserName + ":" + $vsvCredential.GetNetworkCredential().Password
        $vsvHeader = "Basic " + [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($vsvPair))
        Set-Clipboard -Value $vsvHeader
        Write-Host "Autorisation copiee. Collez-la uniquement dans le secret Supabase TEST."
    }
    finally {
        Remove-Variable vsvCredential,vsvPair,vsvHeader -ErrorAction SilentlyContinue
    }
}
```

Le résultat encodé est un secret, pas un chiffrement. Après l'avoir collé et
sauvegardé dans Supabase, remplacer le presse-papiers avec `Set-Clipboard -Value ""`.
Ne transmettre ni le mot de passe ni cette valeur à un tiers ou dans une capture.

## Un contrôle intégré

Dans **VSV-TEST > Paramètres > Configurer / connecter Google**, la fenêtre commune
contient aussi Paheko (le libellé actuel reste centré sur Google).
Cliquer **Récupérer l'export et ouvrir l'aperçu** dans la section Paheko.
Depuis Communication, le même panneau ne reçoit pas le rappel d'import : utiliser
les Paramètres pour cette opération.

Comparer le total avec Paheko : 92 si rien n'a changé depuis le contrôle. Vérifier
que les catégories Membres actifs, Administrateurs et Bureau sont toutes présentes.
Si les mêmes fiches sont déjà dans TEST, elles doivent être rapprochées par leur
numéro, sans 92 créations supplémentaires. L'import reprend les choix du système
existant (ambiguïtés à confirmer, colonnes facultatives, aucune suppression des
absents). Confirmer seulement l'aperçu attendu. Un second aperçu identique doit
retrouver les fiches inchangées.

Le numéro de membre reste du texte (zéros initiaux conservés). Il est distinct de
l'ID interne API de Paheko et peut être modifié dans Paheko : il n'est pas présenté
comme une identité immuable. Changer ce numéro demande un rapprochement explicite.
Ni catégorie, ni abonnement à la lettre d'information ne prouve une cotisation payée.

## Refus sûrs et limites

- Échec HTTP, interruption, schéma divergent ou catégorie supprimée : aucun CSV
  partiel retourné ; annuaire VSV inchangé.
- Catégorie vide avec en-tête valide : acceptée. Toutes vides : annuaire inchangé.
- Numéro absent ou répété : récupération refusée, sans fusion automatique.
- Une modification dans Paheko entre les requêtes peut donner une photographie
  non simultanée. Éviter les changements pendant l'import et contrôler l'aperçu.
- 20 catégories, 50 000 membres, 20 Mo au total, délai global 45 s.
- Pas de suivi automatique des nouvelles catégories, pas de planification.
- Authentification réelle aux catégories confirmée par l'utilisateur ; nouveaux
  exports multi-catégories et import hébergé non testés depuis cet environnement.

## Validation du correctif

Tests locaux avec HTTP simulé : 92 membres fictifs sur 3 catégories, réimport
stable, ordre des colonnes, accents/CSV multilignes, catégorie vide, refus 401/403/
404/500, réseau interrompu, doublons, identifiants manquants, HTML à la place du
CSV, schémas divergents, limites de taille et refus de la cible production.
Le test traverse `createConnectors`, le parseur, l'aperçu et l'import existants.
Aucun accès au contenu réel des membres et aucune connexion Google utilisés.

## Retour arrière

Retirer `VSV_PAHEKO_TEST_CATEGORY_IDS` et `VSV_PAHEKO_TEST_AUTHORIZATION` désactive
ce mode si aucun ancien CSV n'est configuré. L'import CSV manuel reste disponible.
Pour révoquer complètement cet accès, supprimer l'identifiant API dédié dans Paheko.
Cela ne supprime aucun membre déjà importé. Ne pas effacer la base pour revenir en arrière.

## Correction du bouton des paramètres

Le bouton des paramètres transmettait le fichier CSV comme callback à
`csvImport`, au lieu de son deuxième argument `providedFile`. L'assistant
s'ouvrait donc sans fichier. Le branchement transmet maintenant le fichier
à la bonne position, comme le parcours Communication.

Après installation de l'API multi-catégories, cette correction nécessite
uniquement de récupérer la branche, reconstruire avec les quatre variables
VSV-TEST habituelles et téléverser le dossier `dist` complet dans Cloudflare
**vsv-test** (pas une archive ZIP). Aucune migration, modification de secret
ni nouveau déploiement de vsv-api requis pour ce branchement.

Validation locale : 195 tests Node réussis et compilation TEST réussie avec
une clé publique fictive. Le parcours `tests/browser/paheko-settings.mjs`
est fourni pour contrôler le fichier préchargé et l'aperçu sans écriture,
avec un connecteur simulé. Il n'a pas pu être exécuté ici : Chromium absent
et téléchargement du navigateur bloqué (HTTP 403). Aucun nouveau test
Paheko hébergé n'est revendiqué.
