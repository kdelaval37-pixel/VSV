# Convocations, invitations et menu — installation sur VSV-TEST

Cette branche ne doit pas être fusionnée dans `main` pour cet essai. Aucun envoi de courrier n’est ajouté. Ne changez pas la branche de production de vsv-byl.pages.dev.

## Première action : sauvegarder et identifier l’environnement de test

1. Depuis VSV, téléchargez une sauvegarde complète. Conservez-la hors du navigateur.
2. Identifiez le projet Supabase et l’adresse Cloudflare de **VSV-TEST**. Ces coordonnées ne sont pas fournies dans la demande. Utilisez de préférence une base de test séparée avec des données fictives. Brancher VSV-TEST sur la base réelle permettrait de modifier les vraies données.
3. Récupérez la branche `feature/convocations-invitations-navigation`, issue de `main` (`cc73c62`). Ne déployez pas `main` et ne publiez pas cette branche sur le site de production.

## A. Migration SQL Supabase — uniquement dans le projet de test

Dans Supabase → SQL Editor, exécutez **uniquement** `supabase/migrations/202610210001_notices.sql` si l’installation partagée est déjà en place. Elle élargit la contrainte des types de documents, sans toucher aux données, droits ni mouvements.

Sur une base de test neuve, installez d’abord `202610200001_shared_vsv.sql` et les deux administrateurs explicites selon `INSTALLATION-PARTAGE.md`, puis la nouvelle migration. Ne réexécutez pas la migration initiale sur une base déjà installée.

## B. Redéploiement de vsv-api — séparé du site

Depuis le dossier du projet, avec la CLI Supabase connectée au **projet de test** :

```
supabase functions deploy vsv-api --project-ref IDENTIFIANT_DU_PROJET_TEST --no-verify-jwt
```

Le contrôle des jetons et des comptes actifs reste réalisé par la fonction. La fonction importe les nouveaux validateurs : son redéploiement est nécessaire même si son fichier principal n’a pas changé.

Dans les secrets de la fonction de test, configurez `VSV_SITE_URL` avec l’origine HTTPS du site VSV-TEST (sans slash final), et `VSV_ALLOWED_ORIGINS` avec cette même origine. Gardez les clés secrètes uniquement dans Supabase. Dans Authentication → URL Configuration, autorisez l’adresse de test et sa redirection. Ne changez pas les redirections de production pour tester.

## C. Reconstruction du site — VSV-TEST uniquement

Dans le projet Cloudflare Pages **de test**, sélectionnez cette branche et configurez :

- Framework : None.
- Node : 22 ou plus.
- Commande : `npm run build:pages`.
- Répertoire de sortie : `dist`.
- Variables de construction publiques :
  - `VSV_BUILD_TARGET` = `test`
  - `VSV_SUPABASE_URL` = URL HTTPS du projet Supabase de test
  - `VSV_SUPABASE_PUBLISHABLE_KEY` = sa clé publique commençant par `sb_publishable_`
  - `VSV_SITE_URL` = adresse HTTPS complète de VSV-TEST, avec `/` final

Ne renseignez aucune clé `service_role`, SMTP ou mot de passe dans Cloudflare. Une configuration de test incomplète fait échouer la construction plutôt que d’utiliser silencieusement la production. Le fichier de configuration et les en-têtes CSP de `dist` sont adaptés au projet choisi. La configuration source de production reste inchangée.

Cette branche est préparée, pas déployée automatiquement. Déclenchez manuellement la reconstruction du **projet Pages de test** après les étapes A et B.

## D. Vérification sur deux appareils

Connectez deux comptes actifs fictifs. A crée une convocation ou invitation ; B actualise sa liste, ouvre le document et poursuit sa saisie. Gardez ensuite le même document ouvert sur A et B : enregistrez avec B puis avec A. Le conflit doit être signalé et la saisie A rester disponible dans les copies de travail. Vérifiez également le refus d’un compte suspendu.

Testez les PDF avec un ordre du jour long, une AG mixte, les dates limites et le menu mobile. Aucune vente ni entrée de stock ne doit être produite par les documents. Les essais avec de vrais comptes Supabase, les e-mails Auth et les appareils physiques restent à faire sur VSV-TEST.

## Utilisation

- Ouvrez **AG → Convocations** ou **Réunion → Invitations**. Le titre suffit pour enregistrer ; les autres informations peuvent attendre. La sauvegarde automatique n’annonce « Enregistré » qu’après confirmation du serveur.
- Les participants d’une invitation restent des **invités**, pas des présents. Renseignez les présences réelles dans le compte rendu.
- « Préparer le procès-verbal / compte rendu » reprend la préparation. Si un document lié existe, il est proposé à l’ouverture plutôt que dupliqué. Depuis un PV ou compte rendu, utilisez « Récupérer une convocation / invitation ».
- Une copie de la source est conservée. « Comparer / actualiser explicitement » présente les anciennes et nouvelles valeurs avant application. Les discussions et votes restent conservés ; un changement de partie incompatible avec des votes existants est refusé.
- Pour une nouvelle séance, dupliquez la convocation ou invitation : les dates et le statut d’envoi sont vidés. L’export PDF n’envoie rien et ne change pas le statut.
- Les pièces associées sont des références ou liens textuels vers les fichiers privés gérés dans l’administration existante. Cette version n’intègre pas de pièce jointe binaire à l’intérieur du PDF.

## Statuts : réserve explicite

Aucun fichier de statuts n’était disponible : seules la fiche projet PDF/ODT et un CSV Paheko étaient joints au dossier de travail. Il n’a donc pas été possible de comparer les articles réels à `src/pv-rules.js`.

Les 15 jours de première AGO/AGE et les 7 jours de seconde AGO sont des **valeurs historiques à vérifier**, pas des règles certifiées. Restent notamment à confirmer : compétence de convocation, destinataires, forme d’envoi, calcul civil du délai, point de départ de seconde AGO, délai de seconde AGE, possibilité de regrouper AGO/AGE, pouvoirs et inclusion des représentés au quorum. Les contrôles des convocations restent « À vérifier » tant que la règle nécessaire n’a pas une confirmation et une référence. Aucun quorum réel n’est certifié dans une convocation.

Les PV repris depuis une convocation signalent les règles statutaires non vérifiées. Les résultats arithmétiques des votes utilisent les règles historiques AGO/AGE conservées par vote ; ils ne constituent pas une validation juridique. Les anciens PV conservent leur contenu et leurs règles.

## Retour arrière sans suppression de données

1. Téléchargez une sauvegarde V11 et conservez la version de code correspondante.
2. Revenez au précédent déploiement **de test**, et au précédent code de fonction si nécessaire.
3. **Ne supprimez pas** les nouvelles lignes et ne resserrez pas la contrainte SQL : l’ancien logiciel ignore les nouveaux types. Ne restaurez pas une ancienne sauvegarde par-dessus les données récentes.
4. Pour consulter tous les nouveaux documents, revenez à cette branche. La sauvegarde V11 nécessite cette version ou une version ultérieure. La restauration ne rejoue aucun mouvement.

## Vérifications automatisées

```
npm ci
npm test
npm run test:sql
npm run test:shared:browser
npm run build:pages
```

Le test SQL utilise un PostgreSQL jetable Docker, jamais la base réelle. Le navigateur partagé utilise une API/Auth/Realtime simulée localement ; ce n’est pas un test de votre Supabase hébergé. `tests/browser/notices.mjs` teste les écrans localement (serveur `VSV_PORT=4187 npm start`, puis `node tests/browser/notices.mjs`).

### Résultats de cette livraison

- 130 tests Node réussis : modèles, délais limites/manquants, secondes convocations, AG mixtes, sources indépendantes, imports sans doublons et compatibilité des sauvegardes, modules historiques.
- PostgreSQL 17 jetable : migration appliquée, nouveaux types inclus dans les lectures RLS, refus des visiteurs/comptes non autorisés et suspendus, interdiction d’écritures directes, atomicité et concurrence de caisse.
- Chromium Linux : parcours des deux outils, comparaison avant récupération et annulation, rechargement, séparation invités/présents, menu mobile ; partage et conflit dans deux contextes avec serveur simulé ; régressions des PV, comptes rendus et bilans ; éditeurs mobiles en thème sombre.
- Impression et PDF réel : convocation mixte longue de 13 pages A4, logo chargé, dernier point présent, statut brouillon inchangé. Contrôle visuel de la première page ; toutes les pages n’ont pas été relues visuellement une à une.
- Construction standard et construction de test avec coordonnées fictives/CSP adaptées ; contrôle Deno de `vsv-api` réussi.
- Non effectués : comparaison avec les statuts absents, migration et déploiement réels, essais de votre Supabase sur deux appareils physiques, Safari/iPhone/Android et Windows/macOS. La mise en service partagée ne doit donc pas être considérée comme vérifiée en ligne.
