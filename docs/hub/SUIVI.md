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
| 3 | Liens directs, recherche globale, récents/favoris/raccourcis personnels, après 2 | Recherche limitée aux droits, ouverture stable sans perte de saisie, préférences par utilisateur | À faire |
| 4 | Dossier projet/événement, après 3 | Accès aux documents, achats, réservations, caisse, bilan sans copies divergentes ; duplication prochaine édition sans données réelles passées | À faire |
| 5 | Agenda partagé, tâches et décisions, après 4 | Calendrier/liste, jours entiers et heures corrects, décision transformée une seule fois en tâche, source conservée, export calendrier | À faire |
| 6 | Association : bibliothèque privée et partenaires, après 2–4 | Classement/recherche/échéances, confidentialité serveur, version validée immuable et correction traçable | À faire |
| 7 | Bénévolat et équipes, après 4–5 | Créneaux volontaires, affectations cumulables, chevauchements, mission mobile et temps facultatif | À faire |
| 8 | Stocks/courses/caisse, après 4–5 | Réservations datées, alertes, code-barres manuel/scan, achats pris en charge et justificatifs/avances, aucune régression atomique | À faire |
| 9 | Paheko → VSV, après 1 | Documentation officielle/version réelle vérifiées, simulation paginée, configuration serveur, aperçu et idempotence ; test externe distinct | À faire ; URL/version et accès de test à obtenir avant connexion |
| 10 | Communication Gmail, après 2/6 | OAuth minimal côté serveur, permissions cumulables, file idempotente/résultats incertains, liste de destinataires test autorisés, aucun mail aveugle | À faire ; projet OAuth/compte et destinataires de test à configurer |
| 11 | Réponses invitations / présence, après 10 | Liens individuels bornés, GET sans mutation, confirmation explicite, invités ≠ présents ≠ pouvoirs/votes | À faire |
| 12 | Mobile/hors connexion et administration, transversal après 2 | Brouillons appareil signalés, révocation/changement compte sûrs, diagnostic sans secrets, restauration isolée vérifiée | À faire ; caisse hors connexion exclue |
| 13 | Procédure et automatisation de test, puis préparation production | Migrations connues, site/API compatibles, contrôles et retour arrière ; production uniquement sur nouvelle instruction | Garde-fous et procédure manuelle lot 1 livrés ; automatisation complète à faire |

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

## Reprise au prochain lot

1. Lire ce suivi, vérifier git/main et l’état réel VSV-TEST, sans fusion automatique.
2. Lot 1 installé : voir les quatre essais hébergés rapportés ci-dessous. Ne pas les refaire inutilement ni considérer les autres scénarios comme validés.
3. Lot 2 développé : voir `LOT-2.md`. Mettre à jour le site VSV-TEST et vérifier les nouveaux scénarios hébergés. Après validation, prochain lot : liens directs, recherche, récents/favoris personnels (lot 3).
4. Demander uniquement les informations externes indispensables au moment du lot concerné. Ne jamais demander de secret dans la conversation.

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
