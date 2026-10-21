# Délais des convocations — correction pour VSV-TEST

## Référence lue

Le fichier fourni **Statut asso.pdf**, articles 10 et 11, a été lu le 21 octobre 2026. Le PDF original n’est pas ajouté au dépôt (il contient aussi des noms et signatures). Les passages utiles sont :

- Article 10, première AGO : convocation « adressée au moins 15 jours à l’avance ».
- Article 11, première AGE : « Elle est convoquée selon les mêmes formes que l’AGO. » Le délai retenu est donc celui de l’article 10 : 15 jours.
- Article 10, seconde AGO après défaut de quorum : « dans un délai minimal de 7 jours ». Le texte ne précise pas explicitement le point de départ de ce délai.
- Article 11, seconde AGE : « dans les mêmes conditions ». Le délai et son origine restent à confirmer ; aucun délai certain de seconde AGE n’est inventé.
- Les articles ne prévoient pas expressément d’AG mixte. L’outil contrôle séparément les délais AGO et AGE, puis donne le résultat global **des délais**, sans présenter le regroupement des assemblées comme statutairement acquis.

La vérification porte sur les délais. Elle ne constitue pas une certification de toutes les autres conditions d’une assemblée.

## Calcul et affichage

Convention retenue : différence entre dates civiles (départ exclu, jour de l’AG inclus). Les statuts ne disent pas « jours francs » : on n’ajoute pas de journée supplémentaire. Les calculs utilisent des dates normalisées UTC pour l’arithmétique et des libellés jour/mois/année, sans conversion vers le fuseau du navigateur.

Première convocation :

- Délai requis : 15 jours.
- Délai calculé : date d’AG moins date d’envoi.
- Première AG possible : date d’envoi + 15 jours.
- Date limite d’envoi : date d’AG − 15 jours.

Exemple : un envoi le 1er juin permet une AG à partir du 16 juin. Pour une AG le 11 juin, la date limite d’envoi est le 27 mai. Un délai de 14 jours est insuffisant ; 15 ou 16 jours respectent ce délai.

L’envoi effectif est prioritaire sur l’envoi prévu. Tant qu’il n’est pas renseigné, le contrôle est annoncé comme **prévisionnel**. Une date manquante est nommée ; l’autre calcul reste affiché s’il est déjà possible. Les alertes rouges comportent une icône, du texte et les deux dates de correction. Les réserves sur une AG mixte ou une seconde convocation ne masquent pas une anomalie de dates.

Pour une seconde convocation, une hypothèse peut être renseignée avec justification. Les résultats restent **indicatifs / à vérifier**, même si l’hypothèse est confirmée dans le formulaire. Si le départ supposé est la première assemblée, l’application ne transforme pas cette date en une date limite d’envoi. Les dates inversées et les insuffisances selon l’hypothèse retenue restent signalées.

## Enregistrement, PDF et documents existants

Un délai insuffisant ne bloque pas le brouillon. Avant impression ou PDF d’une convocation présentant une anomalie de dates/délai, une confirmation explicite indique le problème. Annuler ne modifie ni dates ni statut. Confirmer imprime les avertissements ; cela n’envoie rien et ne marque pas le document comme envoyé.

Le moteur de délai est commun aux convocations et aux PV (liés ou créés directement). Le transfert ne copie que l’envoi **effectif** dans le champ effectif du PV. Un envoi seulement prévu reste dans la copie source ; il n’est pas transformé en un envoi réel. Les descriptions et l’ordre du jour ne sont pas modifiés par ce correctif.

Les anciennes copies de règles, dates, identifiants, versions et sources restent en place. Les contrôles actuels des premières convocations utilisent désormais les articles vérifiés, même si un ancien brouillon avait une confirmation manquante ou un délai historique modifié. Aucune migration automatique ni écriture de masse des documents n’a lieu. Les sauvegardes restent au format V11 ; les anciens fichiers restent importables.

## Mettre à jour uniquement VSV-TEST

1. **Première action : télécharger une sauvegarde complète**, puis identifier sans ambiguïté le projet Supabase et le site Cloudflare **de test**.
2. Récupérer la dernière version de `feature/convocations-invitations-navigation`. Ne pas fusionner dans `main` et ne pas changer la branche de production.
3. **SQL Supabase : aucune nouvelle migration pour ce correctif.** Si les nouveaux outils n’ont pas encore été installés sur VSV-TEST, appliquer d’abord la migration déjà livrée `202610210001_notices.sql`, une seule fois sur la base de test. Aucun changement de RLS ou de droits n’est nécessaire.
4. **Fonction : redéployer `vsv-api` sur le projet Supabase de test**, car ses imports partagent les modèles :

   ```
   supabase functions deploy vsv-api --project-ref IDENTIFIANT_DU_PROJET_TEST --no-verify-jwt
   ```

   Conserver les secrets et origines de test déjà configurés. Aucun secret n’est ajouté au frontend.
5. **Site : reconstruire manuellement le projet Pages VSV-TEST** depuis cette branche, avec la configuration publique de test existante : framework None, Node ≥ 22, commande `npm run build:pages`, sortie `dist`. Garder `VSV_BUILD_TARGET=test`, `VSV_SUPABASE_URL`, `VSV_SUPABASE_PUBLISHABLE_KEY` et `VSV_SITE_URL` propres au test. Voir `VSV-TEST-CONVOCATIONS.md` pour les valeurs à renseigner.
6. Vérifier sur VSV-TEST : 14 / 15 / 16 jours, date manquante, dates inversées, AGO / AGE / mixte, réserves de seconde convocation, puis annulation et confirmation du PDF. Vérifier avec deux comptes que la sauvegarde et les conflits fonctionnent toujours.

Aucun déploiement, courriel, import personnel ou migration sur les données réelles n’est exécuté pendant ce développement. Les tests hébergés et appareils physiques doivent être faits après ces étapes. Le précédent guide garde ses résultats initiaux comme historique ; les règles confirmées ici remplacent la réserve générale « statuts absents » pour les seuls délais vérifiés.

## Retour arrière

Conserver la sauvegarde puis restaurer le précédent site **de test** et la précédente fonction si nécessaire. Aucun changement SQL nouveau n’étant requis, ne supprimer aucune table, colonne ou document. Les deux versions acceptent les mêmes données et sauvegardes.

## Vérifications de cette correction

- 142 tests Node : limites 14/15/16, mois/années, année bissextile, dates inversées et manquantes, envoi effectif prioritaire, secondes convocations, AG mixtes, PV directs et liés, sources conservées, sauvegardes et modules existants. Calculs identiques dans les fuseaux UTC, Europe/Paris, Los Angeles et Auckland.
- Chromium local : alerte près des dates, calculs dans les deux sens, brouillon enregistré malgré l’insuffisance, PDF annulé puis confirmé depuis le formulaire et l’aperçu, transfert vers un PV, réserves de seconde convocation et largeur mobile.
- Non-régression des PV ; deux comptes simulés pour partage, Realtime, copies de travail, conflit et coupure réseau. Aucun compte ni message Supabase réel utilisé.
- Construction statique et vérification Deno de `vsv-api`.
- Non réalisés : déploiement VSV-TEST, contrôle de la base hébergée, essais sur appareils physiques / Safari. Pas de nouveau test SQL à appliquer pour ce correctif sans changement de schéma ou de RLS.
