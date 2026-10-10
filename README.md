# VSV — Veille Solidaire de Vierzon

Une application locale pour préparer les projets de l’association, sans compte ni service payant.

## 1. Lancer l’application

Installez **Node.js, version 22 ou plus récente**, depuis son site officiel (nodejs.org), si ce logiciel n’est pas déjà installé. Téléchargez et décompressez le dossier de ce projet.

- **Windows** : double-cliquez sur `Lancer-VSV.bat`.
- **macOS ou Linux** : ouvrez un terminal dans le dossier et tapez `node server.js`.

Ouvrez ensuite **http://localhost:4173** dans votre navigateur. Gardez la fenêtre de lancement ouverte pendant l’utilisation. Pour arrêter, appuyez sur Ctrl+C dans cette fenêtre. Aucun téléchargement de dépendances n’est nécessaire. Le petit serveur fonctionne uniquement sur votre ordinateur et ne publie rien en ligne.

Utilisez toujours la même adresse, le même navigateur et son profil habituel. Évitez la navigation privée. Pour relancer, répétez ces étapes.

## 2. Créer et retrouver une fiche

Cliquez sur **Créer une fiche projet**, puis saisissez son nom. Le reste est facultatif. Les modifications sont enregistrées automatiquement lorsque les champs sont valides. L’indicateur confirme l’enregistrement ; un message d’erreur signifie que les changements ne sont pas enregistrés. Cliquez sur **Enregistrer maintenant** pour réessayer.

Les dates peuvent rester vides. Les montants et quantités acceptent le point ou la virgule, avec deux décimales au maximum. Chaque dépense est arrondie au centime avant addition. Les nombres de participants et bénévoles sont des entiers positifs ou nuls.

Revenez à **Mes projets** pour rechercher une fiche ou filtrer par statut. **Ouvrir** permet de la modifier ; **Dupliquer** crée une copie indépendante ; **Supprimer** demande confirmation. **Aperçu** présente les informations réellement saisies sous forme de document, en masquant les rubriques vides. Le statut « Validé » ne déclenche aucune approbation.

## 3. Sauvegarder et restaurer

Cliquez régulièrement sur **Télécharger la sauvegarde JSON**. Conservez le fichier téléchargé dans un dossier facile à retrouver, éventuellement sur une clé USB. Il contient vos projets et leurs coordonnées : choisissez un endroit adapté à ces informations personnelles.

Pour restaurer, cliquez sur **Importer une sauvegarde** depuis Mes projets et choisissez le fichier JSON. Confirmez l’import. Les fiches existantes restent intactes : un identifiant déjà présent donne une nouvelle copie portant la mention « importé ». Un fichier invalide est refusé sans changer vos données. Le format porte le numéro de version 1.

En cas d’échec de stockage, une sauvegarde JSON depuis l’éditeur peut aussi conserver les changements valides de la fiche ouverte. Une saisie invalide doit être corrigée avant sauvegarde. Si les données déjà présentes sont illisibles, l’application bloque les écritures pour les préserver : ne les effacez pas avant d’avoir demandé de l’aide.

## 4. Limites de cette version

Les fiches résident dans ce navigateur, ce profil et cet appareil. Effacer ses données, changer de navigateur ou utiliser un autre ordinateur ne transfère pas les projets. La fermeture de l’application conserve les fiches correctement enregistrées, mais pas les changements signalés comme non sauvegardés. Les fichiers JSON permettent le transfert manuel.

Il n’y a ni compte, ni partage synchronisé, ni modification simultanée. Évitez d’ouvrir plusieurs fenêtres d’édition à la fois : cette version ne gère pas les conflits entre fenêtres. Aucun PDF automatique n’est encore proposé. Le document dispose déjà d’une présentation destinée à une future exportation.

## 5. Évolutions possibles

Export PDF, budgets plus détaillés, plannings de bénévoles, fiches techniques, bilans, courriers et comptes rendus, puis stockage partagé et comptes avec rôles. Les données du projet sont séparées du document pour pouvoir être réutilisées. Ces fonctionnalités ne sont pas implémentées dans cette version.

## Repères techniques et vérifications

- `src/model.js` : structure des projets, format versionné, validations et calculs en entiers.
- `src/storage.js` : lecture et écriture locales, erreurs propagées à l’interface.
- `src/app.js` : interface et parcours de saisie.
- `src/document.js` : présentation du document et échappement des textes.
- `src/style.css` : présentation responsive et styles d’impression.
- `server.js` : serveur local, sans dépendance.

Exécuter `npm test` pour les dix tests automatiques de données et de chemins Windows/Linux. Les parcours ont également été vérifiés dans Chromium : création, modification, rechargement, duplication, suppression confirmée ou annulée, lignes budgétaires, centimes, téléchargement/import JSON, import invalide, accents, aperçu, échec de stockage simulé et largeur mobile. Windows, macOS, Safari et Firefox n’ont pas été testés dans cet environnement Linux.
