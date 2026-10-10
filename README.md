# VSV — Veille Solidaire de Vierzon

Une application locale pour préparer les projets et rédiger les comptes rendus de réunion de l’association, sans compte ni service payant.

## 1. Lancer l’application

Installez **Node.js, version 22 ou plus récente**, depuis son site officiel (nodejs.org), si ce logiciel n’est pas déjà installé. Téléchargez et décompressez le dossier de ce projet.

- **Windows** : double-cliquez sur `Lancer-VSV.bat`.
- **macOS ou Linux** : ouvrez un terminal dans le dossier et tapez `node server.js`.

Ouvrez ensuite **http://localhost:4173** dans votre navigateur. Gardez la fenêtre de lancement ouverte pendant l’utilisation. Pour arrêter, appuyez sur Ctrl+C dans cette fenêtre. Aucun téléchargement de dépendances n’est nécessaire. Le petit serveur fonctionne uniquement sur votre ordinateur et ne publie rien en ligne.

Utilisez toujours la même adresse, le même navigateur et son profil habituel. Évitez la navigation privée. Pour relancer, répétez ces étapes.

## 2. Créer et retrouver une fiche

L’application s’ouvre sur **Accueil**, avec vos statistiques et vos trois projets les plus récemment modifiés. Le menu latéral permet de revenir à **Accueil** ou de rejoindre **Fiches projet** et **Comptes rendus** ; sur téléphone, ces accès se trouvent au-dessus du contenu. Les autres catégories sont indiquées « À venir » et ne sont pas encore utilisables.

Cliquez sur **Créer une fiche projet**, puis saisissez son nom. Le reste est facultatif. Les modifications sont enregistrées automatiquement lorsque les champs sont valides. L’indicateur confirme l’enregistrement ; un message d’erreur signifie que les changements ne sont pas enregistrés. Cliquez sur **Enregistrer maintenant** pour réessayer.

Les dates peuvent rester vides. Les montants et quantités acceptent le point ou la virgule, avec deux décimales au maximum. Chaque dépense est arrondie au centime avant addition. Les nombres de participants et bénévoles sont des entiers positifs ou nuls.

Revenez à **Mes projets** pour rechercher une fiche ou filtrer par statut. **Ouvrir** permet de la modifier ; **Dupliquer** crée une copie indépendante ; **Supprimer** demande confirmation. **Aperçu** présente les informations réellement saisies sous forme de document, en masquant les rubriques vides. Le statut « Validé » ne déclenche aucune approbation.

## Exporter une fiche en PDF

Depuis la fiche ou son aperçu, cliquez sur **Exporter en PDF**. Dans la fenêtre d’impression, choisissez **Enregistrer au format PDF** (ou **Microsoft Print to PDF** sous Windows), puis **Enregistrer** et choisissez votre dossier. Utilisez le format A4 ; si le navigateur propose « En-têtes et pieds de page », désactivez cette option pour éviter l’adresse et la date ajoutées par le navigateur. L’export reprend la fiche actuellement affichée. Un message signale si elle contient des changements non sauvegardés. Corrigez les montants invalides avant l’export. Le PDF est un document de consultation ; conservez aussi votre sauvegarde JSON pour continuer à modifier les projets.

## 3. Sauvegarder et restaurer

Cliquez régulièrement sur **Télécharger la sauvegarde JSON**. Conservez le fichier téléchargé dans un dossier facile à retrouver, éventuellement sur une clé USB. Il contient vos projets, vos comptes rendus, leurs notes et les coordonnées saisies : choisissez un endroit adapté à ces informations personnelles.

Pour restaurer, cliquez sur **Importer une sauvegarde** depuis Mes projets ou Comptes rendus et choisissez le fichier JSON. Confirmez l’import. Les fiches existantes restent intactes : un identifiant déjà présent donne une nouvelle copie portant la mention « importé ». Un fichier invalide est refusé sans changer vos données. Les nouvelles sauvegardes portent le numéro de version 2 et contiennent les projets et les comptes rendus. Les sauvegardes de projets de version 1 restent importables : elles ajoutent des projets sans supprimer les comptes rendus. Une ancienne version de l’application ne sait pas lire le nouveau format ; utilisez la version à jour et téléchargez une sauvegarde avant toute mise à jour.

En cas d’échec de stockage, une sauvegarde JSON depuis l’éditeur peut aussi conserver les changements valides de la fiche ouverte. Une saisie invalide doit être corrigée avant sauvegarde. Si les données déjà présentes sont illisibles, l’application bloque les écritures pour les préserver : ne les effacez pas avant d’avoir demandé de l’aide.

## 4. Limites de cette version

Les fiches résident dans ce navigateur, ce profil et cet appareil. Effacer ses données, changer de navigateur ou utiliser un autre ordinateur ne transfère pas les projets. La fermeture de l’application conserve les fiches correctement enregistrées, mais pas les changements signalés comme non sauvegardés. Les fichiers JSON permettent le transfert manuel.

Il n’y a ni compte, ni partage synchronisé, ni modification simultanée. Évitez d’ouvrir plusieurs fenêtres d’édition à la fois : cette version ne gère pas les conflits entre fenêtres. L’export PDF utilise la fenêtre d’impression du navigateur, sans logiciel supplémentaire. Le document suit le modèle fourni par VSV (logo, coordonnées, rubriques numérotées et blocs verts), avec une pagination adaptée aux textes longs.

## 5. Évolutions possibles

Budgets plus détaillés, plannings de bénévoles, fiches techniques, bilans, courriers, convocations et procès-verbaux d’assemblée générale, puis stockage partagé et comptes avec rôles. Les données des projets et des réunions sont séparées de leurs documents pour pouvoir être réutilisées. Ces fonctionnalités ne sont pas implémentées dans cette version.

## Repères techniques et vérifications

- `src/model.js` : structure des projets, format versionné, validations et calculs en entiers.
- `src/meeting-model.js` : informations de réunion, participants, ordre du jour, validations et duplication.
- `src/meetings.js` : liste et rédaction des comptes rendus.
- `src/meeting-document.js` : présentation fidèle, paragraphes, listes et actions.
- `src/backup.js` : sauvegarde commune V2 et import des sauvegardes V1.
- `src/pdf.js` : export via impression, partagé entre les deux documents.
- `src/storage.js` : lecture et écriture locales, erreurs propagées à l’interface.
- `src/app.js` : interface et parcours de saisie.
- `src/document.js` : présentation du document et échappement des textes.
- `src/style.css` : présentation responsive et styles d’impression.
- `server.js` : serveur local, sans dépendance.

Exécuter `npm test` pour les 22 tests automatiques de données, de sauvegardes compatibles, de PDF et de chemins Windows/Linux. Les parcours ont également été vérifiés dans Chromium : création, modification, rechargement, duplication, suppression confirmée ou annulée, lignes budgétaires, centimes, téléchargement/import JSON, import invalide, accents, aperçu, échec de stockage simulé et largeur mobile. Windows, macOS, Safari et Firefox n’ont pas été testés dans cet environnement Linux.

Le PDF multipage a été généré et son contenu contrôlé dans Chromium sous Linux ; le bouton d’export et le chargement du logo ont été vérifiés. La fenêtre native « Microsoft Print to PDF » sous Windows n’a pas pu être testée ici.

La page d’accueil et le menu ont été vérifiés dans Chromium sur ordinateur et en largeur mobile : compteurs, projets récents, accès à la création, retour à une fiche et confirmation avant abandon de changements non sauvegardés.

## Comptes rendus de réunion : mode d’emploi

1. Depuis **Accueil** ou le menu, ouvrez **Comptes rendus**, puis **Nouveau compte rendu**. Donnez un titre : le brouillon peut déjà être sauvegardé. Complétez la date, le lieu et les horaires quand vous les connaissez. Choisissez « En cours » pour la rédaction pendant la réunion.
2. Dans **Participants**, saisissez un nom et appuyez sur **Entrée** ou cliquez sur **Ajouter**. Vous pouvez préciser la fonction ou l’organisme, corriger les noms et les retirer. Les compteurs distinguent présents et excusés. Un nom commun aux deux listes est signalé, sans empêcher les homonymes.
3. Dans **Ordre du jour**, ajoutez chaque titre avec **Entrée**. Les boutons **Monter / Descendre** changent l’ordre sans déplacer les notes vers un autre point. L’accès rapide ouvre le point voulu ; son état « En cours » est repéré en vert. Les rubriques se replient en cliquant sur leur titre et conservent leur contenu.
4. Saisissez directement les discussions et, si nécessaire, les décisions et les actions. Une ligne commençant par `- `, `* ` ou `• ` donne une puce dans le document ; les paragraphes restent séparés. Aucun propos n’est reformulé. La frappe enregistre automatiquement les champs, sans changer de zone de saisie. Vérifiez l’indicateur : « Échec » ou « Non sauvegardé » signifie que votre travail n’est pas encore enregistré. **Enregistrer maintenant** permet de réessayer. Une sauvegarde JSON peut aussi récupérer la fiche ouverte si son titre et ses données sont valides.
5. Pour **Non discuté**, saisissez éventuellement un motif de report. S’il existe des notes, décisions ou actions, choisissez explicitement **Oui, afficher** ou **Non, masquer** avant l’aperçu, le PDF ou la finalisation. Les notes masquées restent dans l’éditeur et dans le JSON, y compris leurs actions ; elles ne figurent pas dans le récapitulatif du document. Les points « À aborder » ne sont jamais changés automatiquement.
6. **Aperçu** présente le document sans perdre les dernières notes. **Exporter en PDF** ouvre la même fenêtre d’impression que pour les projets : choisissez **Enregistrer au format PDF** ou **Microsoft Print to PDF**, en A4. Les notes des champs facultatifs vides sont omises et les documents non finalisés portent une mention de travail. La numérotation suit toujours l’ordre de vos points.
7. **Finaliser** signale les points encore « À aborder » ou « En cours ». Vous pouvez les vérifier, annuler, ou finaliser explicitement malgré ces points. Après confirmation et enregistrement réussi, le compte rendu est en lecture seule. **Rouvrir pour modifier** demande confirmation et le replace « En cours ». « Finalisé » n’est pas une approbation officielle, et ce document n’est pas un procès-verbal d’assemblée générale.
8. Depuis la liste, **Dupliquer** propose la copie complète (nouveau brouillon) ou **Reprendre uniquement la structure**. Cette deuxième option conserve les titres de points, le lieu et les personnes animant/rédigeant, mais vide les notes, décisions, actions, motifs, dates, horaires et participants ; les points reviennent à « À aborder ». L’original reste inchangé.
9. **Télécharger la sauvegarde JSON** sauvegarde tous les projets et tous les comptes rendus, quel que soit le module utilisé. L’import ajoute les documents et transforme les doublons en copies sans écrasement. Téléchargez régulièrement ce fichier ; un PDF ne permet pas de restaurer les champs modifiables.

Les projets déjà présents sont lus sans manipulation et leur stockage passe au format commun lors du prochain enregistrement réussi. La sauvegarde reste locale au navigateur, au profil et à l’appareil. Évitez plusieurs fenêtres d’édition et les anciennes versions de l’application : il n’y a pas de synchronisation ni de gestion de conflits. Les convocations et les procès-verbaux d’AG ne sont pas développés.

### Vérifications du module

Les parcours ont été exécutés dans Chromium sous Linux : projet historique au format V1 conservé et modifiable, compte rendu créé/modifié, notes retrouvées après rechargement, fermeture réelle de Chromium et réouverture du même profil, ajout de noms avec Entrée, homonymes, états et réordonnement, suppression confirmée/annulée, masquage des notes sans perte, aperçu, sections repliées, deux duplications, finalisation et réouverture, recherche, échec de stockage, import V1/V2 et fichier invalide. La présentation a aussi été vérifiée en largeur mobile et dans un PDF A4 de 21 pages contenant 130 paragraphes et 65 actions : fin du texte présente, dernière action présente, notes masquées absentes et aucune page vide. Le bouton PDF a été testé ; la fenêtre native d’impression sous Windows n’est pas testable dans cet environnement Linux.

Les tests navigateur reproductibles sont dans `tests/browser/` ; voir `tests/README.md`. Les limites générales de navigateur et de multi-fenêtres restent celles décrites plus haut.
