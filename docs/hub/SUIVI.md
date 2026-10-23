# VSV — évolution vers un hub associatif

Dernière mise à jour : 23 octobre 2026. Branche d’intégration : `feature/hub-associatif-test`, créée depuis `main` à `d6498fc` après lecture de `FETCH_HEAD`. Ne pas fusionner dans main : cette branche déclenche la production. Ce document est le point de reprise pour une autre session.

## Cibles et limites

- Autorisé : site https://vsv-test.pages.dev/ ; Supabase `grgvwyedfrxnwhgdqpoj`.
- À préserver : https://vsv-byl.pages.dev/ ; Supabase `zbbxhhtqcyryabfftbvq`.
- Aucun accès aux données réelles, import du CSV personnel, nettoyage, mail ou déploiement de production.
- Le PDF des statuts a été lu, articles 10 et 11 comparés aux contrôles existants. Première convocation : 15 jours. Réserves sur le point de départ des 7 jours de seconde AGO, seconde AGE et AG mixte conservées. Le fichier joint CSV sert à vérifier son en-tête uniquement ; tests et captures : personnes fictives.
- Le logo existant et les modèles PDF sont conservés. Aucun remplacement graphique ni framework ajouté.

## Inventaire et branches examinées

L’application est une application ES modules sans framework. `main` contient les projets, comptes rendus, PV AGO/AGE/mixte, bilans, convocations et invitations liés, répertoires, stocks, courses, fournisseurs, bons de commande, caisse, paramètres et Auth Supabase. L’intégration partagée utilise des enregistrements versionnés, un moteur de commandes serveur, des transactions SQL, Realtime, des copies de travail et des conflits. Ces composants restent la référence.

- `feature/convocations-invitations-navigation` est déjà intégrée dans main via PR #2 : ne pas la réintégrer.
- `feature/partage-supabase` est un travail antérieur : ne pas fusionner aveuglément.
- `fix/doublons-adherents` contient `aa221ad`, absent de main : examiné et repris par cherry-pick (`2cf8763`) dans le lot 1. Diagnostic détaillé et limites de causalité : [DOUBLONS-ADHERENTS](../DOUBLONS-ADHERENTS.md).
- Pas d’instructions AGENTS.md trouvées dans le dépôt ni les répertoires inspectés.

Composants à réutiliser : `referencePicker`, `references-ui`, `article-ui`, `transactions`, `shared/engine`, `shared/store`, `backup`, `theme`, `navigation-ui`, `exportContentPdf`. Distinguer les préférences utilisateur futures, les paramètres communs et les préférences d’appareil actuelles.

## Feuille de route ordonnée

Chaque lot doit livrer un parcours utilisable, tests, captures fictives, documentation, migration additive si nécessaire et retour arrière. Les lignes « à faire » ne sont pas des fonctions livrées, aucun bouton fictif n’est ajouté.

| Lot | Contenu / dépendances | Critère de réussite | État |
| --- | --- | --- | --- |
| 1 | Fiabilité membres/imports ; sécuriser VSV-TEST | Réimports et concurrence sans doublons, tombstones protégés, bilan complet, cible de production refusée | Installé sur VSV-TEST ; essais hébergés partiels confirmés par l’utilisateur |
| 2 | Collaboration et composants communs, après 1 | Conflits lisibles par champs avec comparaison et copie conservée ; états serveur/local/échec cohérents ; même sélecteur et pièce jointe partout | Code livré ; validation hébergée du lot 2 à effectuer |
| 3 | Liens directs, recherche globale, récents/favoris/raccourcis personnels, après 2 | Recherche limitée aux droits, ouverture stable sans perte de saisie, préférences par utilisateur | Intégré : liens/recherche/favoris/récents/raccourcis de compte |
| 4 | Dossier projet/événement, après 3 | Accès aux documents, achats, réservations, caisse, bilan sans copies divergentes ; duplication prochaine édition sans données réelles passées | Intégré : dossiers, liens, commentaires et prochaine édition |
| 5 | Agenda partagé, tâches et décisions, après 4 | Calendrier/liste, jours entiers et heures corrects, décision transformée une seule fois en tâche, source conservée, export calendrier | Intégré : agenda/tâches/ICS ; notifications externes non activées |
| 6 | Association : bibliothèque privée et partenaires, après 2–4 | Classement/recherche/échéances, confidentialité serveur, version validée immuable et correction traçable | Intégré : bibliothèque et partenaires ; visibilité association/administrateurs |
| 7 | Bénévolat et équipes, après 4–5 | Créneaux volontaires, affectations cumulables, chevauchements, mission mobile et temps facultatif | Intégré : équipes, disponibilités, créneaux, missions et temps déclaratif |
| 8 | Stocks/courses/caisse, après 4–5 | Réservations datées, alertes, code-barres manuel/scan, achats pris en charge et justificatifs/avances, aucune régression atomique | Intégré : courses/justificatifs/scan/alertes/retours ; réservation conservatrice |
| 9 | Paheko → VSV, après 1 | Documentation officielle/version réelle vérifiées, simulation paginée, configuration serveur, aperçu et idempotence ; test externe distinct | Adaptateur CSV TEST préparé ; API native/version/accès externes à confirmer |
| 10 | Communication Gmail, après 2/6 | OAuth minimal côté serveur, permissions cumulables, file idempotente/résultats incertains, liste de destinataires test autorisés, aucun mail aveugle | OAuth, droits, file et historique préparés/testés en simulation ; connexion réelle à configurer |
| 11 | Réponses invitations / présence, après 10 | Liens individuels bornés, GET sans mutation, confirmation explicite, invités ≠ présents ≠ pouvoirs/votes | Intégré : liens RSVP individuels et réponses manuelles ; hébergé à vérifier |
| 12 | Mobile/hors connexion et administration, transversal après 2 | Brouillons appareil signalés, révocation/changement compte sûrs, diagnostic sans secrets, restauration isolée vérifiée | Copies/états/fichiers renforcés ; consultation hors ligne complète et caisse hors ligne non promises |
| 13 | Procédure et automatisation de test, puis préparation production | Migrations connues, site/API compatibles, contrôles et retour arrière ; production uniquement sur nouvelle instruction | Paquet SQL/API/site global préparé ; déploiement hébergé bloqué par accès |

Les règles d’accès sensibles doivent être contrôlées côté serveur. Aucun rôle technique tiré des catégories Paheko ni équipes. Gmail/Paheko : aucune connexion opérationnelle livrée dans le lot 1. Aucun abonnement activé.

## Lot 1 — livré

Réutilisation du correctif existant au lieu de le redévelopper : identité textuelle, mises à jour sur UUID conservé, champs absents préservés, homonymes comparés sans fusion automatique, revalidation serveur, index SQL unique et protection contre la réactivation des suppressions. Les 92 copies retirées ne sont pas restaurées. Rapport enrichi : total des lignes ignorées avant confirmation et après résultat serveur.

Construction test : `scripts/test-target.mjs` exige le site et le projet exacts autorisés, une clé publishable et un mode test explicite. Validation avant création de dist ; le script PowerShell enlève aussi l’ancien paquet avant construction. Cela protège les commandes de test documentées, sans prétendre empêcher un administrateur de lancer un autre outil manuellement. Aucun paramètre de production modifié.

### Comparaison visuelle limitée au lot 1

Les compétences externes demandées `emil-design-eng`, `mobile-native`, `break-ui` ont été consultées depuis le dépôt d’Emil Kowalski, sans installation de bibliothèque. Pas d’animation ajoutée dans un import répétitif. Leur application est limitée à la surface modifiée, pas un audit intégral annoncé.

| Avant | Après | Pourquoi |
| --- | --- | --- |
| Bilan : nouveaux, modifiés, inchangés, ambiguïtés, invalides | Même présentation, total ignorées explicites + invalides ajouté | Éviter de confondre ligne ignorée et mise à jour |
| Modèles PDF existants | Modèles inchangés | Préserver la présentation appréciée |

Captures reproductibles : `tests/browser/hub-lot1.mjs` ; données fictives identiques avant/après et mobile sombre. La version « avant » intercepte uniquement l’ancien module UI `2cf8763` ; ce n’est pas une capture du site de production. Artefacts dans `docs/hub/captures/`.

## Reprise de la livraison globale

1. Lire la dernière section « Livraison intégrée » et `ETAT-INTEGRE.md`, vérifier la branche `feature/hub-associatif-test` et les derniers commits.
2. Ne demander aucune installation par lot. Utiliser uniquement `LIVRAISON-GLOBALE.md` pour la mise à jour complète de VSV-TEST.
3. Les quatre essais hébergés du lot 1 restent acquis. Tous les autres essais hébergés sont à distinguer des simulations locales.
4. Les réglages externes connus sont regroupés dans le guide global ; continuer les tâches indépendantes sans attendre une validation de détail.

## Vérifications réellement effectuées pour ce lot

- `npm test` : **157 tests réussis**, aucun échec. Identités, imports successifs/concurrents, colonnes absentes, archives/tombstones, anciennes sauvegardes et liens couverts ; deux nouveaux contrôles de cible et bilan ignorées.
- `npm run test:sql` : PostgreSQL 17 jetable, toutes migrations appliquées à neuf, RLS/droits/suspension, concurrence vente du dernier article, idempotence et imports membres concurrents réussis. Aucun Supabase hébergé utilisé.
- `npm run test:shared:browser` : Chromium, deux contextes, Auth/API/Realtime **simulés**, partage/conflits/copies, imports concurrents, caisse, suspension et tailles d’écran réussis. Ce n’est pas un test réel sur deux appareils.
- `tests/browser/member-import.mjs` : création/réimport inchangé, mise à jour UUID stable, comparaison courriel et annulation réussis.
- `tests/browser/hub-lot1.mjs` : capture avant/après, mobile sombre 390 px, bilan ignorées/annulation et absence de débordement global réussis.
- `tests/browser/notices.mjs` : convocation mixte → PV et invitation → compte rendu, rechargement, aperçu/PDF long et menu mobile réussis. Pas de changement dans les modèles PDF.
- Construction avec cible/clé publique **fictive** de test : réussie, contrôle Deno de l’API réussi. Cette clé fictive ne permet aucune connexion réelle ; ne pas déployer ce paquet.
- Aucun déploiement, migration distante, mail, invitation réelle ni import du CSV joint effectué. Supabase/Cloudflare CLI non installés et aucune configuration d’accès de test présente dans cet environnement. Git push seul ne prouve pas un déploiement.

Limites : PowerShell non exécuté sur Windows ici ; scripts préparés et relus. Safari/iPhone, Android et autres appareils physiques non testés. La configuration effective Cloudflare et l’état des migrations de Supabase TEST restent à vérifier dans leurs tableaux de bord. Pas de garantie de synchronisation externe Gmail/Paheko avant les futurs lots et accès de test. Les offres gratuites ont des limites de stockage, connexions et envoi ; aucun service payant activé.

## Vérifications hébergées rapportées par l’utilisateur — 23 octobre 2026

Le lot 1 a été installé sur VSV-TEST. Résultats communiqués par l’utilisateur, distincts des simulations locales :

- Création de deux adhérents fictifs.
- Réimport du même CSV : **0 création, 2 fiches inchangées**.
- Modification du nom en conservant le numéro Paheko : **0 création, 1 mise à jour, 1 fiche inchangée**.
- Vérification sur téléphone : modification visible et une seule fiche.

Ces résultats confirment ces quatre scénarios uniquement. Les autres essais hébergés (imports simultanés, suppressions logiques, ancienne sauvegarde, conflits de documents, caisse/stock, restauration, etc.) ne sont pas considérés réalisés. Aucune nouvelle intervention de production autorisée.

## Lot 2 — collaboration et composants communs

Livraison : [LOT-2.md](LOT-2.md). Comparaison de conflits par champ et trois versions quand la base est connue ; saisie/copie protégées ; JSON technique replié ; actions explicites sans fusion. État serveur fiable et suivi commun des formulaires manuels (articles, membres, lieux, fournisseurs, catégories). Fenêtres partagées accessibles et sélecteur de fichiers privés réutilisé dans la barre d’outils et les champs existants des convocations/invitations. Présentation générale et modèles PDF conservés. Aucun nouveau champ de pièce jointe imposé aux documents qui n’en possédaient pas.

### Résultats locaux, distincts des essais hébergés

- **166 tests Node réussis**, dont 9 nouveaux tests de collaboration/fichiers/états. Comparaison, données manquantes, suppressions, stabilité de la version de départ, confirmation serveur, échec de copie locale et limites de fichiers couverts.
- `npm run test:shared:browser` : réussi avec deux comptes **simulés** et Chromium réel ; conflits/copie/téléchargement, état du formulaire article, sélection et sauvegarde des fichiers depuis convocation/invitation, non-régressions caisse/stock/imports et suspension.
- `tests/browser/collaboration-ui.mjs` : réussi ; Échap/retour de focus, annulation du rechargement, HTML échappé, recherche de fichiers sans accents, refus d’un faux PDF, ajout/sélection simulés, nettoyage de l’état d’un formulaire annulé.
- `tests/browser/references-smoke.mjs` : réussi (CSV, référentiels, multi-sélection, packs, instantanés, couleur, sauvegarde et mobile). Premier lancement sans chemin du navigateur échoué ; relancé avec le Chromium installé et réussi.
- `tests/browser/notices.mjs` : réussi ; liens convocation/PV, invitation/compte rendu, aperçu et export long. PDF fictif toujours A4 sur 14 pages, modèles inchangés.
- Construction test à clé publique fictive et contrôle Deno de l’API : réussis. Le paquet fictif n’a pas été déployé. Aucun test PostgreSQL supplémentaire nécessaire pour ce lot sans changement serveur/SQL ; les résultats PostgreSQL du lot 1 restent ceux de ce lot.
- Captures avant/après bureau et mobile sombre : [lot2-captures](lot2-captures/README.md). Source de référence : module Auth/UI `ecdc566` intercepté localement, pas production.

**Installation : site VSV-TEST uniquement**, sans nouvelle migration SQL et sans redéploiement API. Checklist et retour arrière dans LOT-2.md. Aucun essai hébergé du lot 2 effectué ici ; tests physiques Safari/iPhone/Android et test du Storage Supabase hébergé à réaliser. Aucun accès/secret/compte de production modifié. Les seules vérifications hébergées acquises restent celles rapportées par l’utilisateur pour le lot 1.

## Changement de méthode — livraison globale en cours

Instruction utilisateur du 23 octobre : continuer les étapes internes sans demander l’installation de chaque lot. Livraison intégrée unique sur VSV-TEST ; amélioration visuelle de l’interface autorisée et demandée, modèles PDF à conserver strictement. Les anciens paragraphes proposant une validation à chaque lot sont remplacés par cette instruction. Ne pas interpréter une étape/commit comme une demande d’intervention utilisateur.

### État technique de reprise (travail intégré non encore livré)

- Branche unique `feature/hub-associatif-test`, aucune fusion main, aucun déploiement distant.
- Accès : CLI Supabase/Cloudflare absents ; aucune configuration d’authentification de ces services ; HTTP public VSV-TEST refusé (403) depuis l’environnement. Aucun accès Google/Paheko associatif. Ne pas exploiter les identifiants techniques de la plateforme pour l’association.
- Implémenté localement : routes document stables et reprise après reload ; conflit recharge le document concerné sans retour accueil ; index global/favoris/récents individuels ; premiers dossiers projet/liens/commentaires ; tâches et actions de réunion ; agenda liste/calendrier/ICS ; bibliothèque et versions validées ; partenaires ; équipes/créneaux ; préparation de messages et réponses manuelles ; avances/affectations de courses ; interface modernisée dans `ui-polish.css` exclusivement écran ; codes-barres/recherche et seuils d’alerte d’articles.
- Ajout de données `hub` : un enregistrement par objet, CAS/RLS existants, validations et sauvegarde V12 rétrocompatible. Préférences de compte protégées côté serveur et filtrées côté API/SQL. Migrations nouvelles non appliquées à distance : `202610230001_hub.sql`, `202610230002_rsvp.sql`.
- Liens RSVP individuels : code ajouté, à terminer/tester avant déclaration utilisable. API publique ne doit accepter que le token opaque, GET/lecture sans mutation, confirmation POST, expiration/révocation, réponse distincte des présences/pouvoirs/votes. Table service-only et mutation atomique de réponse dans le hub. Aucune invitation réelle envoyée.
- Vérifié à ce stade : 174 tests Node ; parcours intégré local navigateur (liens, tâche, agenda/ICS, dossier/duplication, partenaire, communication brouillon, favoris et 3 largeurs/2 thèmes) ; suite partagée avec bouton réel Recharger (reste dans document/copie gardée) ; PostgreSQL jetable pour la première migration hub et anciennes opérations métier. Ces résultats ne couvrent pas encore la migration RSVP ni ses nouveaux écrans.
- À finir avant livraison globale : tests et durcissement RSVP, confidentialité de bibliothèque/fichiers, cohérence des horaires/créneaux, besoins stocks/périodes/courses/justificatifs, intégrations externes préparées et diagnostic honnête, suivi admin/maintenance, tests de restauration et régression/PDF, captures finales, paquet/déploiement global protégé, guide 15–20 minutes et état précis des limites. Ne pas annoncer tout le périmètre comme terminé.

## Livraison intégrée — suite de la méthode globale

Le statut « travail intégré non encore livré » ci-dessus décrit une étape intermédiaire historique. Le code a ensuite été complété : voir [ETAT-INTEGRE.md](ETAT-INTEGRE.md) pour le périmètre précis et les réserves, et [LIVRAISON-GLOBALE.md](LIVRAISON-GLOBALE.md) pour une seule installation SQL/API/site et un essai utilisateur de 18 minutes. Aucun sous-lot ne nécessite une intervention séparée.

### Ajouts depuis l’étape intermédiaire

- Bibliothèque confidentielle et bucket administrateur avec contrôles SQL/API/Storage ; téléchargement réellement vérifié dans Chromium sur transport simulé.
- RSVP individuel finalisé : création, lecture publique sans mutation, confirmation, idempotence, expiration/révocation, réponses modifiables ; aucun présent/pouvoir/vote créé.
- Prise en charge depuis une course et justificatif privé/photo réduite ; seuils et recherche par code ; scanner caméra si disponible, alternative explicite sinon ; périodes conservatrices et retours d’objets dans l’agenda.
- Équipes/créneaux, multi-sélection, inscription, disponibilités/compétences volontaires, missions personnelles et temps facultatif ; reprise d’actions dans la prochaine réunion.
- Préparation de messages depuis les documents ; Google OAuth PKCE/état à usage unique/compte vérifié/tokens chiffrés ; permission d’envoi cumulable, liste de test serveur, file/idempotence/échecs certains/résultats incertains, destinataires individuels et pièces jointes privées. Aucun Google réel connecté ici.
- Adaptateur Paheko de lecture d’export CSV TEST vérifié et assistant commun ; aucune API native ni version d’instance prétendue sans accès/documentation. Aucun Paheko réel lu.
- Historique de communication exporté sans secrets ni liens publics actifs, restauration inerte dans le hub ; préférences d’un autre compte/appareil ignorées avec rapport lors du transfert administrateur.
- Présence discrète sur canaux Realtime privés et politiques restrictives ; alerte de nouvelle version sans remplacement de frappe. Le bouton de rechargement conserve le document courant.
- Interface modernisée uniquement à l’écran. Modèles et style des PDF inchangés par rapport à `6af4f13`.

### Reprise exacte si un accès externe est accordé plus tard

1. Vérifier qu’on est sur `feature/hub-associatif-test` et qu’aucune modification locale n’est perdue. Ne pas utiliser main comme branche de livraison.
2. Relancer `npm test`, `npm run test:sql`, `npm run test:hub:browser`, contrôle Deno et construction TEST si nouveau changement. PostgreSQL et les deux comptes du navigateur sont des simulations/instances jetables, pas les services hébergés.
3. Avec les droits réels de TEST seulement, suivre le guide global : sauvegarde, SQL groupé (six migrations), vsv-api, site canonique vsv-test.pages.dev. Le script global est répétable et refuse une base sans socle ou une installation partielle ; ne pas réappliquer les migrations initiales manuelles.
4. Connecter Google par OAuth et configurer un export Paheko de test uniquement si leurs réglages sont fournis dans Supabase Secrets, jamais dans le chat. Tester d’abord vers les adresses explicitement autorisées.
5. Effectuer un contrôle réel sur deux appareils puis le parcours utilisateur de 18 minutes. Consigner uniquement les scénarios réellement réalisés. Les notifications/synchronisations programmées ne s’activent pas avant cette validation.
6. Aucune production, aucun merge main, aucun transfert des données fictives ou réglages TEST vers production. La préparation de production demeure une instruction future distincte.

### Résultats finaux de la validation locale intégrée

- **188 tests Node réussis**, aucun échec. Nouveaux tests : hub partagé, préférences individuelles, versions de bibliothèque, routes, calendrier/ICS, créneaux, période/retour matériel, prochaine édition, RSVP, confidentialité, file Gmail simulée et OAuth simulé/chiffrement.
- **SQL groupé exécuté réellement deux fois sur PostgreSQL 17 jetable** : six migrations, détection déjà installé, RLS/Storage/Realtime, jetons privés, RSVP atomique/idempotent, permission et prise unique d’un envoi, refus de renvoi incertain. Les tests historiques de concurrence sur dernier article, réimport Paheko et tombstones passent aussi. Aucune migration distante effectuée.
- **Parcours navigateur intégrés réussis** : mauvais ciblage bloqué avant connexion (aucune requête production), tâche/rechargement/lien, agenda/ICS, partenaires, recherche/favoris/raccourcis, équipes/multi-sélection/inscription, dossier/prochaine édition, modes clair/sombre et 1440/768/390 px, clavier/Échap/focus, scanner indisponible avec alternative manuelle, imports/annulation/réimports, documents/PDF, caisse/stocks/concurrence, présence effective de deux comptes simulés, conflits et rechargement dans le bon document.
- Nouveaux écrans partagés : tâche A→B, reprise réelle de copie de travail du hub, prise en charge d’une course et justificatif sans entrée de stock, lien RSVP lu sans mutation puis confirmé, fichier confidentiel téléchargé par l’administrateur et invisible pour B, sauvegarde V12 réellement téléchargée avec les deux espaces de fichiers puis restauration simulée sans rejeu. Les liens RSVP actifs et secrets sont absents de l’export.
- PDF long généré : **14 pages A4**. Les six familles de modèles, `pdf.js` et le style d’impression sont inchangés par rapport à `6af4f13`. Le nouveau style se limite à l’écran.
- Contrôle Deno de vsv-api et construction statique explicitement TEST réussis. La construction locale utilise une clé publique fictive et ne doit pas être téléversée ; elle est retirée après vérification. Le vrai paquet se construit avec la clé publique TEST via le script global.

Ces essais utilisent des données fictives. API/Auth/Realtime/Storage/Google/Paheko simulés dans les tests applicatifs ; PostgreSQL et Chromium sont réels en local. Aucun service hébergé nouvellement vérifié, aucun Google réel connecté, aucun mail réel envoyé, aucun Paheko réel lu. PowerShell, caméra physique, Safari/iPhone/Android réels restent à vérifier ; le parcours utilisateur regroupé dure environ 18 minutes.

### Limites restantes regroupées

La version hébergée n’est pas mise à jour ici, faute d’accès et du fait du refus HTTP vers VSV-TEST. Les réglages Google/Paheko et accès de déploiement sont regroupés dans le guide global, à saisir exclusivement dans leurs interfaces sécurisées. API Paheko native/pagination, automatisation planifiée et notifications externes restent non activées avant documentation/accès et essais réels. Les réservations datées restent conservatrices ; pas de caisse hors ligne ni de partage de documents par sous-groupe arbitraire. Voir ETAT-INTEGRE.md pour ne pas confondre ces limites avec des fonctions livrées.

Dernier contrôle du dossier projet : les réceptions réparties entre plusieurs projets sont comptées par leurs affectations, une seule fois par réception. Test fictif dédié, historique inchangé.


## Correction de la livraison compilée — 23 octobre 2026

Demande : menus du hub ouvrant les projets, style invisible, Google introuvable. Travail réservé à `feature/hub-associatif-test` / VSV-TEST.

Défauts démontrés : titres d’onglets des nouvelles pages retombant sur Fiches projet ; suppression générale du hash lors de la restauration de session Supabase ; accès Google absent des paramètres. Les tests précédents servaient les sources et ne validaient pas le paquet réellement livré. Le renvoi **au clic** du site hébergé n’est pas reproduit localement avec l’ancien paquet : ne pas prétendre sa cause distante établie. L’accès hébergé est refusé par le proxy HTTP (403).

Corrections : table de titres complète, routes conservées à la restauration de session, erreur visible pour un module inconnu, lien du logo #home, point d’entrée et dépendances compilés avec empreintes, styles avec empreintes, identifiant de version visible et manifest. Accès Google administrateur dans Paramètres et Communication, états configuration manquante/serveur indisponible/prêt à connecter. Interface écran réellement remaniée sur les modules, avec icônes, cartes, tableaux, contrôles, hiérarchie et animations réduites à la demande. Modèles et styles PDF inchangés.

Vérifications : 188 tests Node réussis et suite navigateur historique intégrée réussie. Nouveau parcours autonome du **paquet compilé** : 16 menus × administrateur/adhérent, clics et rechargements ; mise à jour depuis `4ef6951` compilée sur même origine/profil avec session et document conservés ; paramètres/version ; Google manquant, indisponible et prêt (simulations) ; captures 1440/390 px clair/sombre ; focus clavier, réduction des animations, absence de débordement global, contraste du bouton secondaire contrôlé. Document projet A4 : rendu raster identique avant/après (1 page). Ancien et nouveau profils : aucun service worker enregistré. Aucune donnée effacée pour réussir le test.

Les captures et résultats exacts sont dans correction-captures/parcours.json. Chromium et PDF réellement exécutés localement ; Auth/API/Realtime/Storage et statuts Google simulés. Aucun nouveau test hébergé annoncé. Les quatre essais hébergés du premier lot restent les seuls confirmés par l’utilisateur. Aucun service worker réel installé/PWA physique, Safari ou Google réel testé.

Mise à jour unique : CORRECTION-VERSION-COMPILEE.md. Aucune migration SQL nouvelle ni code serveur modifié dans cette correction ; reconstruire/téléverser l’intégralité du site TEST puis comparer l’identifiant de version. Si l’API intégrée précédente manque, suivre l’étape API du guide global. Aucun merge main/déploiement de production. Le paquet de test à clé fictive est retiré automatiquement ; reconstruire avec la clé publique TEST via le script de livraison avant téléversement.
