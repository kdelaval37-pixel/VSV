# Correctif des doublons d’adhérents — VSV-TEST

Branche : `fix/doublons-adherents`, créée depuis `main` (`d6498fc`). Aucune fusion ni publication en production. Aucun accès aux données réelles, aucun nettoyage et aucune restauration des 92 copies déjà supprimées.

## Diagnostic : défauts démontrés et limites du constat

Le chemin CSV **reconnaissait déjà** un `externalId` existant, conservait son identifiant interne et préservait plusieurs champs non associés. Le problème n’était pas l’absence de ce rapprochement.

Les contournements présents dans le code de `main` étaient :

1. `previewMemberImport` trouvait la fiche par Paheko, mais la décision `create` pouvait ensuite remplacer son mode par « création ». L’interface proposait ce choix même pour un rapprochement exact.
2. `applyMemberImport` faisait confiance au mode de l’aperçu : sa branche création ajoutait directement la fiche, sans recontrôler l’identifiant Paheko dans l’annuaire courant.
3. `mergeRepositories` ne dédoublonnait que par identifiant **interne**. Deux sauvegardes avec des UUID différents et le même numéro Paheko pouvaient donc ajouter deux fiches. Les documents ayant des liens internes, une fusion arbitraire n’aurait pas été sûre.
4. Les écritures serveur vérifiaient les versions par UUID, mais ni le modèle d’écriture ni la base n’imposaient l’unicité Paheko. Les migrations locales vers Supabase ne comparaient également que les clés internes. Une révision globale ne suffit pas à reconnaître deux créations indépendantes portant des UUID différents.
5. L’aperçu ne séparait pas les fiches inchangées des mises à jour. Le nom complet importé effaçait les champs nom/prénom même si ces colonnes étaient absentes. Un état ambigu explicitement mappé pouvait également réinitialiser une archive. Les autres préservations de colonnes absentes déjà présentes dans le CSV sont conservées.

Ces défauts sont reproductibles avec des personnes fictives. Les 184 fiches pour 92 personnes décrites dans la demande sont compatibles avec plusieurs de ces chemins, **sans permettre de désigner le responsable de l’incident** : aucun journal d’import ou historique de requêtes de production n’a été consulté. Le chemin CSV normal, sans choix forcé « créer », savait déjà retrouver un numéro connu. Deux imports passant par l’ancienne interface pouvaient aussi rencontrer un conflit sur les métadonnées : il ne faut donc pas affirmer que toute concurrence produisait automatiquement des doublons.

Un autre défaut vérifié sur PostgreSQL réel a été corrigé : la comparaison par `JSON.stringify` considérait des objets aux clés réordonnées par JSONB comme différents. La comparaison est désormais structurelle (l’ordre des tableaux reste significatif), ce qui évite de faux conflits de migration sans ignorer les véritables différences.

## Comportement du correctif

### Import CSV

- Numéro Paheko non vide : recherche par texte exact après retrait des espaces de bord, sans conversion en nombre. `0007` reste distinct de `7`.
- Une fiche connue, même archivée, est mise à jour **sur le même UUID**. Ses références dans les documents restent inchangées. « Créer » ne peut pas contourner ce rapprochement.
- Réimport identique : fiche **inchangée**, pas nouvelle création. Un import constitué uniquement de fiches inchangées est un succès ; le rapport et la date du dernier import sont conservés.
- Les colonnes non associées ne sont pas écrasées. Une catégorie vide, une cotisation ambiguë, une expiration non interprétable ou un état inconnu ne réinitialisent pas silencieusement une valeur connue / une archive.
- Un numéro répété dans le CSV invalide toutes ses lignes, sans choisir arbitrairement la première. Les autres lignes valides restent importables après l’avertissement et la confirmation existants. Un fichier sans ligne exploitable ne modifie rien.
- Sans numéro fiable : les ressemblances de nom **ou de courriel** sont proposées avec comparaison. Aucune fusion automatique ; les homonymes et courriels partagés restent possibles. Un rapprochement choisi n’efface pas un numéro Paheko existant.
- Bilan avant confirmation : créations, mises à jour, fiches inchangées, ambiguïtés et lignes invalides. Annuler ne modifie pas l’annuaire.

L’interface envoie une commande `importMembers` avec les lignes, les colonnes, les décisions et les fiches observées dans l’aperçu. Le serveur refait les rapprochements sur son instantané actuel. Si un autre utilisateur vient de créer les mêmes fiches, elles deviennent inchangées. Si une fiche a réellement changé et que l’import ferait une autre modification, un conflit impose de refaire la comparaison. La révision globale et la transaction SQL rendent l’ensemble atomique ; l’identifiant de requête conserve l’idempotence après coupure.

### JSON et transfert local

Une ancienne sauvegarde reste lisible pour examen, mais les doublons de numéro Paheko ne sont plus fusionnés silencieusement par UUID :

- restauration locale : refus explicite avant toute écriture si la fusion introduit un doublon ;
- transfert administrateur : aperçu des conflits par numéro, y compris les UUID supprimés et les identités déjà connues ; aucune confirmation de transfert n’est proposée tant que les conflits subsistent ;
- le serveur revérifie au moment de transférer ; un ancien aperçu n’est pas une autorisation de réintroduire une fiche ;
- un transfert déjà enregistré ne rejoue pas ses lignes lors d’une nouvelle tentative, même si un membre a ensuite été supprimé.

Il n’y a pas de fusion automatique d’anciens UUID ni de réécriture des noms et instantanés dans les documents. En présence d’une ancienne sauvegarde comportant deux UUID pour un numéro, le transfert est **refusé avec rapport**, au lieu de choisir une fiche ou de casser ses liens. Ce correctif ne constitue pas un nouvel outil de nettoyage des sauvegardes.

### Base et suppressions logiques

La migration `supabase/migrations/202610210002_member_identity.sql` ajoute :

- un index unique sur le numéro Paheko normalisé des fiches **non supprimées**, archives comprises ; les numéros vides restent autorisés ;
- une contrainte de type texte et une limite de 200 caractères ;
- un trigger refusant la réactivation d’un UUID supprimé et le réemploi automatique d’une identité supprimée quand son numéro historique est conservé ;
- la conservation du payload lors des **futures** suppressions logiques, pour ne pas perdre cette identité historique.

**Aucune ligne existante n’est nettoyée, réactivée ou réécrite par la migration.** Les copies déjà `deleted=true`, leurs versions et la révision globale restent inchangées. L’index les exclut ; la fiche canonique peut toujours être modifiée malgré leur présence. Les droits et politiques RLS ne changent pas.

Si un ancien tombstone a déjà perdu son payload, son UUID reste interdit à la réactivation. On ne peut pas deviner son ancien numéro à partir d’un payload nul. Dans le cas signalé, la fiche canonique portant ce numéro reste présente : l’index unique empêche également d’en créer une nouvelle copie sous un autre UUID.

## Installation uniquement sur VSV-TEST

1. **Première action : télécharger une sauvegarde complète**, puis vérifier l’identité du projet Supabase et du site Pages de test. Ne pas importer une sauvegarde personnelle pour ces essais ; utiliser les exemples fictifs ci-dessous.
2. Récupérer la branche `fix/doublons-adherents`. Ne pas fusionner dans `main` et ne pas changer la branche de production de Cloudflare.
3. **SQL — nécessaire :** sur la base Supabase de test seulement, exécuter une fois `202610210002_member_identity.sql` dans SQL Editor (après les migrations déjà installées). Le script est transactionnel. S’il reste des doublons non supprimés ou des identifiants invalides dans cette base de test, il s’arrête sans modifier les fiches : examiner le rapport, ne pas relancer un nettoyage de production. Il n’incrémente aucune version et ne rejoue aucune opération métier.
4. **API — nécessaire :** redéployer la fonction sur le projet Supabase de test :

   ```
   supabase functions deploy vsv-api --project-ref IDENTIFIANT_DU_PROJET_TEST --no-verify-jwt
   ```

   La vérification du jeton et des comptes actifs reste faite par la fonction. Garder les secrets côté Supabase, et ses origines de test déjà configurées. Le redéploiement est nécessaire pour reconnaître `importMembers` et les nouvelles protections.
5. **Site — nécessaire :** reconstruire manuellement le projet Pages VSV-TEST depuis cette branche : framework None, Node ≥ 22, commande `npm run build:pages`, sortie `dist`. Conserver `VSV_BUILD_TARGET=test` et les variables publiques `VSV_SUPABASE_URL`, `VSV_SUPABASE_PUBLISHABLE_KEY`, `VSV_SITE_URL` propres au test. Aucune clé secrète dans Pages.
6. Fermer puis rouvrir VSV-TEST sur les deux appareils pour charger le nouveau frontend. Tester les scénarios suivants avant toute décision ultérieure de mise en production.

## Essais manuels sur VSV-TEST

CSV fictif initial, séparé par point-virgule :

```
id;nom complet;courriel
0007;Adhérent CSV fictif;partage@example.invalid
0008;Autre adhérent fictif;partage@example.invalid
```

Associer explicitement le courriel si ce format manuel n’est pas préassocié. Pour le format complet Paheko VSV, le préremplissage déjà existant reste en place.

- Importer, puis réimporter : 2 créations, puis 2 inchangées ; toujours 2 UUID et zéros conservés.
- Modifier un courriel ou ajouter une colonne de cotisation explicitement mappée : mise à jour du même UUID ; téléphone / catégorie / archive non fournis conservés.
- Ouvrir deux aperçus avant de confirmer : deux confirmations du même fichier ne créent qu’une série. Si l’aperçu a changé, l’interface peut demander de l’examiner à nouveau.
- Deux courriels différents importés simultanément pour le même numéro : une écriture réussit, l’autre signale le conflit.
- Supprimer le numéro dans le CSV : comparer les ressemblances, sans fusion automatique sur le nom ou le courriel.
- Répéter `0007` sur deux lignes : elles sont toutes deux signalées invalides.
- Sur une base **de test fictive**, vérifier un tombstone : le transfert d’une ancienne sauvegarde ne doit pas le réactiver. Ne pas créer de nouveaux doublons dans la vraie base et ne pas refaire son nettoyage.
- Vérifier qu’un projet / PV lié à l’UUID canonique retrouve toujours ce membre et garde son ancienne copie de nom.

## Tests automatisés et limites

```
npm test
npm run test:sql
npm run test:shared:browser
npm run build:pages
```

`test:sql` utilise PostgreSQL 17 dans un conteneur jetable, jamais Supabase réel. Il vérifie deux imports concurrents, l’unicité avec archives et espaces, l’impossibilité de réactiver un tombstone, la conservation de ses données / version et la mise à jour du membre canonique. Les tests de droits, RLS, caisse et stock restent exécutés.

`test:shared:browser` utilise deux comptes et une API/Auth/Realtime simulés, avec de vrais écrans Chromium. Il vérifie désormais les deux imports CSV concurrents puis un réimport inchangé. Le test `tests/browser/member-import.mjs` couvre aussi le bilan, les coordonnées, les comparaisons et l’annulation ; `references-smoke.mjs` conserve les parcours des autres référentiels et documents.

Seules des personnes fictives et des adresses `example.invalid` sont utilisées. Aucun fichier personnel de production n’a été consulté ou commité. L’incident historique n’a pas été reproduit sur les données réelles. Les essais de Supabase hébergé, VSV-TEST déployé et appareils physiques restent à effectuer.

## Retour arrière conservant les données

Si nécessaire, revenir au précédent déploiement **de test** et au précédent code de `vsv-api` ensemble. Conserver l’index et le trigger SQL : ils protègent aussi l’ancien frontend en refusant les créations invalides. Ne pas restaurer globalement une ancienne sauvegarde par-dessus les nouvelles données, supprimer les tombstones, désactiver la RLS ou retirer les garde-fous pour contourner une erreur. Aucun retour arrière n’exige de refaire le nettoyage déjà réalisé.

### Résultats de cette livraison

- **154 tests Node réussis**, dont réimports, modifications, nouveaux numéros, homonymes, courriel partagé, numéros absents/répétés, anciens JSON, transferts répétés après suppression et conservation des identifiants / liens.
- **PostgreSQL 17 jetable : réussi**, y compris deux imports réellement concurrents, index d’unicité, espaces, archives, upserts du membre canonique, refus de réactivation et tombstone conservé à la même version.
- **Chromium local : réussi** pour l’import dédié et la non-régression des référentiels ; **deux contextes partagés : réussi** pour imports concurrents / réimport, conflits, sauvegardes de travail, coupure réseau et caisse existante.
- Construction statique et contrôle Deno de `vsv-api` réussis. Aucun déploiement ni SQL exécuté sur Supabase réel.

Pour le test navigateur local dédié : démarrer `VSV_PORT=4190 npm start`, puis, dans un autre terminal, `node tests/browser/member-import.mjs` (Chromium doit être installé). Les commandes de test de base restent celles indiquées plus haut.
