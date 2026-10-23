# Installer le premier lot sur VSV-TEST — Windows PowerShell

**Première action :** ouvrir le tableau de bord Supabase et vérifier que le projet affiché est **`grgvwyedfrxnwhgdqpoj`**, puis télécharger une sauvegarde complète de VSV-TEST avant toute modification. Ne pas utiliser les données de production pour les essais.

## 1. Récupérer le code et vérifier

Dans PowerShell, depuis votre dossier de travail :

```powershell
git clone https://github.com/kdelaval37-pixel/VSV.git
Set-Location VSV
git fetch origin
git switch feature/hub-associatif-test
npm ci
powershell -ExecutionPolicy Bypass -File scripts/vsv-test.ps1 Verifier
```

Si le dossier existe déjà, ouvrir ce dossier, conserver vos modifications locales avant de changer de branche et ne pas refaire clone. Node 22 minimum requis. `Verifier` ne déploie rien.

## 2. SQL — migration nécessaire, vérifier celles déjà appliquées

Dans SQL Editor **du projet test**, examiner les migrations déjà installées. Les anciennes migrations initiales peuvent avoir été exécutées manuellement : ne pas les relancer aveuglément. Le lot 1 exige les migrations précédentes (partage et convocations) puis **une seule nouvelle migration** :

`supabase/migrations/202610210002_member_identity.sql`

Si cette migration a déjà été appliquée lors de l’essai de la branche de correction, ne pas la réexécuter. Sinon copier son contenu dans SQL Editor, vérifier la cible puis exécuter une fois. Elle ne nettoie et ne restaure aucun membre. En cas de doublons actifs signalés, elle s’arrête : examiner uniquement la base de test. Ne jamais refaire le nettoyage de production.

## 3. API — redéploiement distinct

Installer Supabase CLI selon sa documentation, puis se connecter dans son terminal, sans copier de jeton dans la conversation :

```powershell
supabase login
powershell -ExecutionPolicy Bypass -File scripts/vsv-test.ps1 Api
```

Cette commande cible explicitement `grgvwyedfrxnwhgdqpoj` et refuse la branche main. Les secrets restent dans Supabase. Vérifier la configuration de test existante : `VSV_SITE_URL=https://vsv-test.pages.dev/` et origines autorisées de test. Ne rien changer dans le projet de production.

## 4. Site — construction distincte

Dans Supabase TEST > paramètres API, copier uniquement sa **clé publique publishable**. La saisir dans votre terminal (ce n’est pas un secret serveur) :

```powershell
$env:VSV_SUPABASE_PUBLISHABLE_KEY = Read-Host 'Clé publique publishable de Supabase TEST'
powershell -ExecutionPolicy Bypass -File scripts/vsv-test.ps1 Construire
```

La commande fixe l’URL test, le site test et le mode test. Elle refuse toute autre cible et ne publie rien. Le paquet est dans `dist`. Ne jamais renseigner une clé service_role ou une clé secrète ici.

La configuration effective de Cloudflare n’a pas été inspectée avec un compte connecté : ne pas affirmer qu’il utilise déjà Git ou un téléversement manuel.

- **Projet Pages en téléversement manuel :** ouvrir uniquement **vsv-test**, créer un déploiement avec le contenu de `dist` selon le parcours affiché par Cloudflare.
- **CLI déjà configurée :** `npx wrangler login`, puis `powershell -ExecutionPolicy Bypass -File scripts/vsv-test.ps1 Site`. Elle reconstruit puis cible exclusivement le projet Pages `vsv-test`. La branche de travail peut produire une **URL de prévisualisation**, pas l’URL canonique ; lire la sortie. Si l’URL n’est pas autorisée par Auth/CORS de test, utiliser le déploiement manuel canonique de vsv-test au lieu d’élargir les origines sans contrôle.
- **Projet test relié à Git :** dans ce seul projet, choisir la branche de travail, framework None, commande `npm run build:pages`, sortie `dist`, Node ≥22, variables `VSV_BUILD_TARGET=test`, `VSV_SUPABASE_URL=https://grgvwyedfrxnwhgdqpoj.supabase.co`, `VSV_SITE_URL=https://vsv-test.pages.dev/`, sa clé publique test. Ne pas modifier vsv-byl ni main.

## 5. Vérifier sur deux appareils

- Fermer et rouvrir VSV-TEST pour charger le nouveau site, après avoir terminé les saisies/ventes en cours. Aucun rechargement forcé par ce lot.
- Avec deux comptes de test autorisés, importer le même CSV fictif : une seule série de membres. Réimport : inchangés.
- Modifier un courriel, vérifier l’UUID conservé et les coordonnées non fournies conservées.
- Essayer homonymes, numéro absent et répété ; les ambiguïtés restent explicites.
- Importer une sauvegarde fictive avec doublon / fiche supprimée : refus, aucune réactivation.
- Exporter puis restaurer sur une installation isolée de test ; vérifier documents et liens.
- Vérifier projet, réunion, PV, bilan, stocks, courses et une vente fictive. Ne pas envoyer de mails réels.

Guide détaillé et CSV fictif : [correctif adhérents](../DOUBLONS-ADHERENTS.md).

## Retour arrière

Revenir ensemble au précédent site de test et à son code API si nécessaire. Conserver l’index/trigger de protection SQL : aucune suppression de données n’est requise. Les anciens clients peuvent recevoir un refus de création en double ; ce refus est voulu. Ne pas retirer la RLS ni restaurer une ancienne sauvegarde par-dessus les données courantes pour contourner une erreur.

## Passage futur en production — non exécuté

Après validation explicite : sauvegarde production, inventaire migrations déjà appliquées, revue de la PR, migration additive manquante, API et site compatibles ; main reste soumis à une instruction séparée. Construire avec la configuration production habituelle, jamais transférer `dist` de test, ses données fictives, ses accès ni ses paramètres. Prévoir les caisses/formulaires encore ouverts et vérifier les parcours après mise à jour. Ce document ne donne pas l’autorisation de le faire maintenant.
