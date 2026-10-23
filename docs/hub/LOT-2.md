# Lot 2 — collaboration et cohérence des composants

Branche : `feature/hub-associatif-test`. Aucun changement de production, aucune fusion dans main. Le lot 1 installé n’est pas redéveloppé. Les seuls essais hébergés acquis sont les quatre scénarios d’adhérents rapportés par l’utilisateur dans [SUIVI.md](SUIVI.md).

## Changements

### Comparaison compréhensible des conflits

La fenêtre commune aux documents/référentiels affiche l’élément concerné puis les champs différents : version de départ, votre saisie, version partagée. Les champs modifiés dans les deux copies sont distingués des champs modifiés d’un seul côté. Les discussions et listes restent affichées comme du texte, avec leurs retours à la ligne. Les dates techniques et UUID ne parasitent pas la comparaison principale. Les valeurs manquantes restent distinctes de zéro.

La base de comparaison provient de l’ouverture du formulaire et avance seulement après confirmation de ses propres enregistrements. Realtime n’actualise pas cette base pendant la saisie d’un document. Si la base n’est pas disponible, la fenêtre le dit et n’attribue pas les changements. Une suppression distante est signalée et ne peut pas être réactivée depuis cette fenêtre.

Actions : revenir à la saisie, télécharger sa copie, ou recharger explicitement la version partagée après confirmation. Les copies de travail existantes restent utilisables. Aucun bouton de fusion automatique ni contournement des versions n’est ajouté. En cas d’échec de sauvegarde de la copie locale, le message demande de télécharger le travail ; il ne prétend pas que la copie locale a réussi.

Le JSON de **l’élément concerné** reste accessible dans une section technique repliée ; la copie complète de l’application n’est plus affichée par défaut. Les valeurs sont échappées contre l’interprétation HTML.

### États d’enregistrement communs

La barre indique « Modifications en cours — non enregistrées sur le serveur » lorsque des formulaires sont modifiés, « Enregistrement… » pendant la requête et « Enregistré sur le serveur » après confirmation. Échec, hors connexion, opération à vérifier et conflit restent distincts. Le suivi des formulaires manuels est commun aux articles (Stocks, Caisse, Catalogue et autres accès au même éditeur), membres, lieux, fournisseurs et catégories. Fermer/annuler un formulaire retire son état en cours ; une erreur conserve la saisie.

Les fenêtres partagées ont un titre accessible, une fermeture Échap et un retour du focus à leur bouton d’ouverture lorsqu’il existe encore. La comparaison s’affiche en colonnes sur ordinateur et empilée sur mobile, avec les mêmes couleurs/thèmes.

Les textes du gestionnaire de listes et de la couleur distinguent maintenant données partagées et préférences de cet appareil.

### Un composant de fichiers privés

« Fichiers partagés » et les boutons « Choisir un fichier privé » des convocations/invitations utilisent le même composant : recherche sans casse/accents, ajout, sélection et téléchargement. Les champs de documents à joindre et les pièces d’ordre du jour proposent ce sélecteur. Choisir un fichier conserve la référence textuelle compatible avec les anciennes sauvegardes et les PDF ; cela ne l’envoie à personne. Les autres outils sans champ de pièce jointe ne reçoivent pas de nouveau modèle de données dans ce lot. Le traitement spécifique des photos d’articles (réduction d’image) est conservé.

Validation client par signature et taille, puis validation serveur déjà existante : PDF 5 Mo, images PNG/JPEG/WebP 225 Ko. Les fichiers restent privés avec les droits existants. Une image/PDF invalide est refusé sans effacer le formulaire. Le succès n’est affiché qu’après réponse serveur. Le mécanisme d’identification des fichiers par empreinte existant protège un nouvel essai avec le même contenu.

## Avant / après

| Avant | Après | Motif |
| --- | --- | --- |
| Deux blocs JSON complets dans les conflits | Comparaison des champs, diagnostic technique replié | Compréhension et sobriété |
| État global parfois encore enregistré pendant un formulaire manuel modifié | État de modification commun aux formulaires | Confirmation serveur fiable |
| Références de fichiers copiées à la main | Sélection depuis le même panneau privé | Moins de ressaisie |
| Fenêtres partagées sans retour de focus explicite | Échap et retour de focus communs | Confort clavier |

Captures fictives : [lot2-captures](lot2-captures/README.md). Aucune modification des modèles PDF, de la charte ou du schéma des documents.

## Installation VSV-TEST — site uniquement

**Première action : récupérer la branche à jour**, après avoir terminé ou préservé les saisies en cours. Depuis le dossier VSV dans PowerShell :

```powershell
git fetch origin
git switch feature/hub-associatif-test
git pull --ff-only
npm ci
powershell -ExecutionPolicy Bypass -File scripts/vsv-test.ps1 Verifier
$env:VSV_SUPABASE_PUBLISHABLE_KEY = Read-Host 'Clé publique publishable de Supabase TEST'
powershell -ExecutionPolicy Bypass -File scripts/vsv-test.ps1 Construire
```

- **SQL : aucune nouvelle migration pour le lot 2.** Ne pas relancer les migrations du lot 1 déjà installé.
- **vsv-api : aucun redéploiement nécessaire pour le lot 2.** Le serveur du lot 1 reste compatible.
- **Site : reconstruire puis téléverser le contenu de `dist` uniquement dans le projet Pages `vsv-test`**, comme lors de l’installation du lot 1. Configuration exacte / variante CLI : [VSV-TEST.md](VSV-TEST.md). Le script fixe `grgvwyedfrxnwhgdqpoj` et `https://vsv-test.pages.dev/`. Ne pas changer main ni le projet vsv-byl.
- Fermer puis rouvrir le site de test quand les formulaires et ventes sont terminés. Aucun rechargement forcé n’est introduit.

La clé à renseigner est celle de TEST, publique publishable. Aucun secret à transmettre dans la conversation. Aucun déploiement automatique effectué par cette livraison.

## Checklist hébergée — à réaliser

- A ouvre un projet, B modifie le résumé et enregistre. A modifie le même champ : conflit lisible, copie A intacte, version B inchangée.
- Refaire avec des champs distincts (lieu et objectifs) : comparaison correcte ; aucune fusion automatique.
- Télécharger la copie, annuler le rechargement, revenir à la saisie. Puis recharger volontairement et consulter « Copies de travail ».
- Modifier un article depuis Stocks puis depuis Caisse : même formulaire, panier conservé, état non enregistré pendant la saisie puis confirmation après serveur. Annuler sans modification du stock.
- Essayer la sélection d’un fichier privé depuis une convocation et une invitation ; rechercher avec/sans accents ; refuser un faux PDF ; vérifier le téléchargement après reconnexion et depuis un autre compte autorisé.
- Tester clavier (Tab/Échap/retour du focus), téléphone, mode sombre et aperçu/PDF.
- Vérifier les anciennes données et une sauvegarde complète sur une installation de test isolée.

Ces scénarios ne sont **pas** considérés réalisés sur l’environnement hébergé par les essais automatisés locaux.

## Tests et limites

Les tests Node vérifient la comparaison trois versions, les changements distincts/concurrents, les absences/suppressions, les listes, l’échappement à la présentation, les signatures/tailles de fichiers, la stabilité de la base pendant Realtime, les états de sauvegarde et les copies lors d’un conflit.

Chromium exécute les écrans réels avec deux comptes et Auth/API/Realtime simulés : copies conservées, téléchargement, fichiers sélectionnés et sauvegardés depuis les deux types de document, caisse/stock et imports existants. Un test UI ciblé vérifie l’annulation du rechargement, Échap/focus, le refus de HTML actif, la recherche et l’ajout de fichier simulé. Cela n’est pas une vérification de Supabase hébergé ni de Safari/iPhone réel.

Aucune fusion automatique des modifications. Les tableaux d’ordre du jour sont comparés comme listes complètes ; pas de fusion ligne à ligne. Certains champs techniques peu courants gardent un libellé dérivé de leur nom interne ; les détails techniques et le téléchargement conservent les données intégrales. Les droits SQL/Storage restent ceux existants, sans nouvel accès accordé.

## Retour arrière

Rétablir le précédent déploiement **du site VSV-TEST**. API/base inchangées, aucune restauration de données nécessaire. Les fichiers ajoutés restent privés et disponibles. Les anciennes versions lisent les références textuelles ; ne pas supprimer les fichiers pour annuler la mise à jour. Conserver les copies de travail avant tout retour arrière. Aucune opération de production.

Résultats de cette livraison : **166 tests Node réussis**, suite Chromium partagée réussie, test UI ciblé et non-régressions référentiels/convocations réussis. PDF fictif long : 14 pages A4. Construction test et Deno check réussis. Aucun test hébergé du lot 2 ni test sur appareil physique effectué. Les captures sont incluses sur la branche.
