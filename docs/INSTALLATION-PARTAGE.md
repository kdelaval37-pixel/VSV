# Installer l’espace partagé VSV

**État de livraison : code préparé sur une branche, pas de migration ni de déploiement de production exécutés.** La mise en réseau ne sera validée qu’après installation dans Supabase, déploiement Cloudflare et essai sur deux vrais appareils.

## Première action : sauvegarder l’existant

Sur **chaque ordinateur qui possède des données utiles**, ouvrez l’ancien logiciel et téléchargez sa sauvegarde JSON. Faites également une sauvegarde depuis le site actuel si vous y avez saisi des documents. Rangez ces fichiers à part, sans les modifier. Ne videz pas les navigateurs.

Le logiciel local, le site Cloudflare et chaque profil de navigateur ont des stockages différents. Ils ne sont **jamais fusionnés à la première connexion**. Choisissez avec les deux administrateurs la sauvegarde de référence ; des identifiants identiques avec des valeurs différentes seront signalés, jamais remplacés automatiquement.

## 1. Faire d’abord un essai isolé

Utilisez un projet Supabase **de test**, distinct du projet réel, et une adresse de préproduction Cloudflare. N’utilisez pas de sauvegarde personnelle dans cet essai : créez quelques données fictives avec la version locale. Aucun envoi d’invitation réel n’est requis par les tests fournis.

Dans cette copie de configuration de préproduction :

- `src/shared/config.js` : remplacez URL, **clé publique publishable** et adresse de retour par celles du test.
- `_headers` : remplacez les deux destinations Supabase HTTPS/WSS par celles du test.
- Supabase Auth : e-mail/mot de passe, inscription libre et connexion anonyme désactivées ; configurez l’adresse de retour exacte de préproduction.
- Edge Function : configurez `VSV_SITE_URL` avec cette adresse, et `VSV_ALLOWED_ORIGINS` avec son origine exacte, par exemple `https://votre-preproduction.pages.dev` (sans barre finale). Pas de joker. Plusieurs origines explicites peuvent être séparées par des virgules.

La configuration livrée contient les valeurs publiques du projet VSV réel, pour l’installation ultérieure en production. Aucun secret serveur n’est fourni ni à ajouter au frontend.

## 2. Installer les tables et protections

Dans Supabase, ouvrez **SQL Editor**, créez une nouvelle requête et copiez le contenu complet de :

`supabase/migrations/202610200001_shared_vsv.sql`

Exécutez-la **une seule fois** dans le projet choisi. La requête est transactionnelle : une erreur annule l’installation. Conservez le fichier versionné et le résultat. Avec Supabase CLI et une base gérée par migrations, vous pouvez utiliser `supabase db push` après avoir vérifié le projet lié ; ne mélangez pas aveuglément les deux méthodes.

Cette migration crée :

- `vsv_documents` : un enregistrement versionné par projet, réunion, PV ou bilan.
- `vsv_references` : un enregistrement par adhérent, article, lieu, fournisseur ou catégorie.
- `vsv_operations` : un enregistrement par mouvement, réservation, prêt, achat, session, vente, remboursement, attente, panier ou bon.
- `vsv_settings` : paramètres communs et métadonnées, sans les préférences d’affichage de l’appareil.
- Contrôle des comptes, journal d’idempotence, rapports de migration, fichiers privés et compteur de changements.

Toutes les tables exposées ont une RLS. Les utilisateurs actifs peuvent lire les données associatives. **Les écritures directes sont interdites**, même à un administrateur connecté : elles passent par les contrôles serveur. Les fonctions d’écriture ne sont exécutables que par le rôle serveur. Les droits explicites sont inclus, sans dépendre de l’exposition automatique des nouvelles tables.

Dans **API / Data API**, vérifiez que le schéma `public` est exposé et que la Data API est activée. Dans **Realtime / Publications**, vérifiez `vsv_clock` et `vsv_access` (la migration les ajoute à `supabase_realtime`). Ne créez aucune politique « tout autoriser » pour résoudre une erreur.

Dans **Storage**, vérifiez le bucket **privé** `vsv-private`. Ne le rendez pas public. Examinez aussi les éventuelles politiques préexistantes de votre projet : une politique générale permissive ne doit pas rendre tous les buckets accessibles. Les nouvelles règles fournies n’autorisent la lecture de ce bucket qu’aux comptes VSV actifs ; les téléversements sont contrôlés par la fonction serveur.

## 3. Désigner explicitement les deux administrateurs

Dans **Authentication → Users**, retrouvez ou créez les deux comptes concernés avec les outils Supabase. Copiez leurs **User UID** : ce sont les UUID, pas les numéros Paheko. Les invitations initiales peuvent être acceptées une fois le nouvel écran déployé ; si un lien expire, renvoyez-le depuis le tableau de bord.

Ouvrez `supabase/bootstrap-admins.sql`, remplacez **REMPLACER_UUID_1** et **REMPLACER_UUID_2** par ces deux UUID distincts, puis exécutez ce script dans SQL Editor. Il vérifie que les comptes existent et refuse un changement silencieux d’une liste d’administrateurs déjà initialisée.

Il n’y a aucun administrateur « premier connecté ». Les catégories Paheko « Bureau » ou « Administrateurs » ne donnent aucun droit technique. L’application ne permet pas de promouvoir d’autres comptes. Les deux administrateurs peuvent inviter, suspendre et rétablir les accès opérationnels. Le dernier administrateur actif ne peut pas être suspendu depuis l’application.

Les droits sur le dépôt, le code et les déploiements restent gérés dans **GitHub et Cloudflare**, indépendamment du rôle dans VSV.

## 4. Déployer la fonction serveur

Installez Node.js 22 et utilisez Supabase CLI. Depuis le dossier du dépôt :

```sh
npx supabase login
npx supabase functions deploy vsv-api --project-ref REFERENCE_DU_PROJET_TEST
```

Le fichier `supabase/config.toml` contient `verify_jwt = false` pour accepter les nouvelles clés publishable à la passerelle. **La fonction vérifie elle-même chaque jeton auprès de Supabase Auth**, puis les droits VSV, avant tout accès. Ce réglage ne rend pas les données publiques.

Supabase fournit à la fonction `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans son environnement serveur. Si elles ne sont pas disponibles dans votre configuration, configurez-les uniquement dans les secrets de la fonction, depuis Supabase. Ne les collez ni dans le code, ni dans Cloudflare frontend, ni dans Git, ni dans une conversation. Brevo reste le SMTP de Supabase ; aucun client Brevo n’est ajouté.

Pour la préproduction, ajoutez `VSV_SITE_URL` et `VSV_ALLOWED_ORIGINS` dans les secrets/configurations de la fonction. En production, leurs valeurs par défaut sont `https://vsv-byl.pages.dev` ; l’API ignore toute redirection fournie par le navigateur. Une invitation déjà envoyée ou en cours est refusée pour éviter un double envoi accidentel. En cas d’envoi non confirmé, examinez Authentication → Users avant de réessayer.

L’import de la fonction inclut les modèles JavaScript métier du dépôt. Lancez la commande depuis la racine du dépôt. Aucun service SQL public ne peut appeler directement les fonctions réservées au serveur avec la clé publishable.

## 5. Régler Cloudflare Pages

Le site reste statique et sans framework. **Nouveaux paramètres exacts :**

| Paramètre | Valeur |
| --- | --- |
| Branche de production | `main` (ne pas fusionner avant validation) |
| Framework | `None` |
| Répertoire racine | racine du dépôt, laissé vide |
| Commande de compilation | `npm run build:pages` |
| Répertoire de sortie | `dist` |
| Version Node | `22` (également dans `.node-version`) |

Cloudflare installe les dépendances à partir de `package-lock.json`. La compilation génère le client Supabase officiel et copie uniquement le site public dans `dist`, sans migrations, tests ou secrets. N’utilisez plus `exit 0` avec `.` comme sortie pour cette version.

Les prévisualisations de branche ne sont pas autorisées automatiquement à accéder à la base réelle. Une URL de préproduction doit être autorisée explicitement dans Supabase Auth et dans `VSV_ALLOWED_ORIGINS`, et utiliser les valeurs publiques du projet de test. Ne contournez pas ce refus avec une origine `*`.

## 6. Vérifier l’essai avant la production

Avec deux comptes distincts et deux navigateurs/appareils :

1. Invité non connecté : aucun document accessible. Compte Auth sans ligne active dans `vsv_access` : accès refusé.
2. Invitation et choix du mot de passe, déconnexion, reconnexion, oubli de mot de passe et lien expiré. Les inscriptions libres restent absentes.
3. A crée une fiche, B la retrouve et la complète. A garde la même fiche ouverte : sa modification concurrente doit afficher un conflit et conserver sa copie.
4. Deux personnes ajoutent le dernier article dans leur panier, puis encaissent presque simultanément : une seule vente, un seul retrait. Le panier refusé reste présent.
5. Coupez la connexion lors d’un enregistrement : aucune confirmation de sauvegarde anticipée. Après reconnexion, utilisez **Vérifier l’opération** avant une nouvelle validation.
6. Réceptionnez un achat, retentez la même opération, vérifiez l’absence de doublon. Testez packs, kg et litres.
7. Vendez puis remboursez un sandwich sans suivi : aucun ingrédient ne doit être déduit ou remis en stock.
8. Suspendez B pendant qu’il est connecté : ses nouvelles lectures/écritures doivent être refusées. Le rétablissement est suivi d’une nouvelle connexion.
9. Migrez deux fois une même sauvegarde fictive ; vérifiez les identifiants, relations et historiques, puis exportez une sauvegarde complète et contrôlez les photos/fichiers.
10. Essayez un téléphone réel, un ordinateur et les navigateurs réellement utilisés par l’association.

## 7. Passer en production, uniquement après ces vérifications

Reprenez les étapes 2 à 4 sur **le projet réel**, après vos sauvegardes et votre validation. Sa référence est `zbbxhhtqcyryabfftbvq`. Pour la fonction, la commande finale est :

```sh
npx supabase functions deploy vsv-api --project-ref zbbxhhtqcyryabfftbvq
```

Rétablissez la configuration publique de production dans `src/shared/config.js` et `_headers`, ainsi que l’adresse Auth autorisée `https://vsv-byl.pages.dev/`. Initialisez les deux vrais UUID administrateurs. Réglez Cloudflare selon l’étape 5, puis faites relire et fusionnez la branche dans `main`. **Ces actions n’ont pas été exécutées pendant le développement.**

Connectez-vous comme administrateur. Ouvrez **Administration → Migrer une sauvegarde**, choisissez le fichier de référence, lisez l’aperçu puis confirmez. Les images et fichiers ne sont transférés qu’après confirmation. Le rapport distingue les types d’enregistrements et les conflits. Une reprise du même fichier réutilise ses identifiants et son rapport ; elle ne rejoue pas les ventes ni les mouvements. Un conflit de contenu bloque le transfert sans écraser les données partagées. Les anciens navigateurs restent intacts.

L’assistant accepte des fichiers JSON de **20 Mo maximum**. Les fichiers privés individuels sont limités à **5 Mo pour un PDF**, **225 Ko pour une image** (les photos du formulaire sont déjà réduites). Si une archive dépasse la limite, conservez-la intégralement et préparez une migration accompagnée ; ne la découpez pas arbitrairement en cassant ses relations. L’ensemble des documents d’un transfert est validé atomiquement ; des fichiers déjà téléversés après confirmation peuvent être réutilisés lors d’une reprise.

Faites ensuite l’essai **sur deux vrais appareils** à l’adresse de production. La mise en réseau n’est pas considérée terminée avant cette vérification.

## Utilisation quotidienne

- Les mêmes fonctions opérationnelles sont accessibles à tous les comptes autorisés et actifs. L’annuaire Paheko reste indépendant des comptes.
- Les formulaires conservent leur saisie pendant les actualisations. Les listes se mettent à jour ; le bouton **Actualiser les listes** permet aussi de les recharger. **Enregistré** nécessite une confirmation du serveur. Une coupure ou un conflit ne constitue pas un enregistrement.
- En cas de conflit, comparez les deux copies et téléchargez la vôtre. **Copies de travail** permet aussi de reprendre un document dans le formulaire, sans le sauvegarder automatiquement. Vérifiez les différences avant de cliquer sur Enregistrer. Les copies de travail sont locales à ce navigateur et à ce compte.
- **Vérifier l’opération** interroge son identifiant avant de retenter une requête incertaine. Ne créez pas une nouvelle opération pour contourner ce contrôle. Consultez l’historique après confirmation.
- Chaque utilisateur dispose de son panier dans la session commune. Les **tickets en attente** sont partagés, sans paiement, réservation ou mouvement de stock. Une session ne peut pas être clôturée pendant qu’un autre panier contient encore des articles ; mettez ces commandes en attente ou annulez-les explicitement.
- Les sandwiches sont vendus à l’unité sans suivi et sans conversion vers un poids d’ingrédients. Les matériels, achats, réservations, retours et mouvements conservent leurs règles.
- La couleur principale est commune. Le thème clair/sombre, le menu et les autres préférences d’affichage restent propres à l’appareil.
- **Fichiers partagés** donne accès aux PDF/images privés. Les photos et les fichiers utilisent un accès authentifié, sans URL publique permanente.
- L’export partagé contient les documents, référentiels, opérations, paniers, paramètres et fichiers privés. Le format **V10** ajoute ces fichiers ; les sauvegardes V1 à V9 restent importables. Conservez la version actuelle du logiciel pour lire V10. Une restauration partagée passe par l’assistant administrateur, jamais par un remplacement silencieux de toute la base.
- Une suspension empêche les nouveaux accès côté serveur. Elle ne peut pas effacer un fichier ou des données qu’une personne avait déjà téléchargés.

## Retour arrière sans perdre les données

1. Arrêtez les opérations, clôturez ou mettez en attente les commandes, puis exportez la sauvegarde partagée et conservez les anciennes sauvegardes locales. Ne réimportez pas une ancienne caisse comme si ses mouvements étaient nouveaux.
2. Si le site doit être arrêté, définissez la variable de compilation Cloudflare **`VSV_MAINTENANCE=1`** et redéployez cette version : une page sans fonction d’encaissement remplace l’application. Suspendez les accès opérationnels dans l’administration (ou dans `vsv_access` depuis Supabase) pour bloquer également les anciens onglets. Gardez au moins un administrateur actif pour exporter et diagnostiquer.
3. Conservez **toutes les tables et le bucket**. N’exécutez aucun `DROP`, ne réinitialisez pas les stocks et n’importez pas un ancien JSON par-dessus les opérations récentes. Les changements SQL doivent être corrigés par une nouvelle migration versionnée.
4. Restaurez le code précédent dans une branche de correction ou revenez au déploiement Cloudflare antérieur, mais maintenez les opérations à l’arrêt : l’ancien logiciel est local et ne lit pas la base partagée. Il ne doit pas servir de caisse parallèle.
5. Après correction, retirez `VSV_MAINTENANCE`, rétablissez les accès et vérifiez les stocks, tickets et identifiants sur deux appareils avant reprise.

## Vérifications fournies et limites

Commandes depuis la racine du dépôt (Node 22 ; Docker nécessaire pour SQL) :

```sh
npm ci
npm test
npm run test:sql
npm run test:shared:browser
npm run build:pages
```

Le test navigateur utilise Chromium installé sur la machine (`VSV_BROWSER_EXECUTABLE` permet d’en choisir un autre). Il démarre un serveur HTTP et un faux service Auth/Realtime isolés : **aucun compte ni e-mail réel n’est créé**. Les tests SQL utilisent PostgreSQL 17 temporaire, les politiques réelles et un schéma Auth/Storage minimal. Ils contrôlent les accès, la suspension, les privilèges, l’atomicité et une véritable concurrence SQL sur le dernier article.

Les parcours Auth/SMTP, Storage et Realtime **du projet Supabase hébergé n’ont pas été exécutés**. La fonction a été vérifiée par Deno, mais n’a pas été déployée. Les essais de navigateur ont été réalisés sous Chromium/Linux avec plusieurs largeurs, pas sur Windows, macOS, Android ou un iPhone réel. Le téléchargement de WebKit dans l’environnement de travail a échoué : Safari reste à vérifier manuellement. Les anciens parcours locaux des projets, réunions, PV, bilans, référentiels, achats, stocks et caisse ont été rejoués.

Cette première version conserve un chargement complet des enregistrements à la connexion et lors des reprises Realtime, ainsi qu’un contrôle périodique de connexion. Les écritures restent par objet et les opérations métier sont sérialisées par une révision PostgreSQL ; ce choix privilégie la cohérence d’une petite association, sans promettre un débit de grande enseigne. Surveillez les quotas **Database, Storage, Realtime et egress** dans Supabase ainsi que ceux de Cloudflare et de votre SMTP. Aucun nouveau service payant n’est nécessaire au code, mais une gratuité illimitée n’est pas garantie.
