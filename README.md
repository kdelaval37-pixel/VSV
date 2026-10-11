# VSV — Veille Solidaire de Vierzon

Une application locale pour les projets, réunions, assemblées générales, référentiels, stocks et caisses d’événements de l’association, sans compte ni service payant.

## 1. Lancer l’application

Installez **Node.js, version 22 ou plus récente**, depuis son site officiel (nodejs.org), si ce logiciel n’est pas déjà installé. Téléchargez et décompressez le dossier de ce projet.

- **Windows** : double-cliquez sur `Lancer-VSV.bat`.
- **macOS ou Linux** : ouvrez un terminal dans le dossier et tapez `node server.js`.

Ouvrez ensuite **http://localhost:4173** dans votre navigateur. Gardez la fenêtre de lancement ouverte pendant l’utilisation. Pour arrêter, appuyez sur Ctrl+C dans cette fenêtre. Aucun téléchargement de dépendances n’est nécessaire. Le petit serveur fonctionne uniquement sur votre ordinateur et ne publie rien en ligne.

Utilisez toujours la même adresse, le même navigateur et son profil habituel. Évitez la navigation privée. Pour relancer, répétez ces étapes.

## 2. Créer et retrouver une fiche

L’application s’ouvre sur **Accueil**, avec vos statistiques et vos trois projets les plus récemment modifiés. Le menu latéral permet de revenir à **Accueil** ou de rejoindre **Fiches projet**, **Comptes rendus** **Procès-verbal**, **Stocks**, **Liste de courses**, **Caisse** et **Paramètres** ; sur téléphone, ces accès se trouvent au-dessus du contenu. Les autres catégories sont indiquées « À venir » et ne sont pas encore utilisables.

Cliquez sur **Créer une fiche projet**, puis saisissez son nom. Le reste est facultatif. Les modifications sont enregistrées automatiquement lorsque les champs sont valides. L’indicateur confirme l’enregistrement ; un message d’erreur signifie que les changements ne sont pas enregistrés. Cliquez sur **Enregistrer maintenant** pour réessayer.

Les dates peuvent rester vides. Les montants et quantités acceptent le point ou la virgule, avec deux décimales au maximum (trois pour les kg des articles suivis au poids). Chaque dépense est arrondie au centime avant addition. Les nombres de participants et bénévoles sont des entiers positifs ou nuls.

Revenez à **Mes projets** pour rechercher une fiche ou filtrer par statut. **Ouvrir** permet de la modifier ; **Dupliquer** crée une copie indépendante ; **Supprimer** demande confirmation. **Aperçu** présente les informations réellement saisies sous forme de document, en masquant les rubriques vides. Le statut « Validé » ne déclenche aucune approbation.

## Exporter une fiche en PDF

Depuis la fiche ou son aperçu, cliquez sur **Exporter en PDF**. Dans la fenêtre d’impression, choisissez **Enregistrer au format PDF** (ou **Microsoft Print to PDF** sous Windows), puis **Enregistrer** et choisissez votre dossier. Utilisez le format A4 ; si le navigateur propose « En-têtes et pieds de page », désactivez cette option pour éviter l’adresse et la date ajoutées par le navigateur. L’export reprend la fiche actuellement affichée. Un message signale si elle contient des changements non sauvegardés. Corrigez les montants invalides avant l’export. Le PDF est un document de consultation ; conservez aussi votre sauvegarde JSON pour continuer à modifier les projets.

## 3. Sauvegarder et restaurer

Cliquez régulièrement sur **Télécharger la sauvegarde JSON**. Conservez le fichier téléchargé dans un dossier facile à retrouver, éventuellement sur une clé USB. Il contient vos projets, vos comptes rendus, leurs notes et les coordonnées saisies : choisissez un endroit adapté à ces informations personnelles.

Pour restaurer, cliquez sur **Importer une sauvegarde** depuis un des trois modules et choisissez le fichier JSON. Confirmez l’import. Les fiches existantes restent intactes : un identifiant déjà présent donne une nouvelle copie portant la mention « importé ». Un fichier invalide est refusé sans changer vos données. Les nouvelles sauvegardes portent le numéro de version 5 et contiennent aussi les photos, mouvements de stock, réservations, prêts, réceptions, sessions, paniers, ventes, remboursements et clôtures. Les anciennes sauvegardes V4 restent également importables. Les anciennes sauvegardes V1 (projets) et V2 (projets et réunions) et V3 (avec PV) restent importables sans supprimer les PV, les autres documents, les référentiels ou les préférences existants. Une ancienne version de l’application ne sait pas lire le nouveau format ; utilisez la version à jour et téléchargez une sauvegarde avant toute mise à jour.

En cas d’échec de stockage, une sauvegarde JSON depuis l’éditeur peut aussi conserver les changements valides de la fiche ouverte. Une saisie invalide doit être corrigée avant sauvegarde. Si les données déjà présentes sont illisibles, l’application bloque les écritures pour les préserver : ne les effacez pas avant d’avoir demandé de l’aide.

## 4. Limites de cette version

Les fiches résident dans ce navigateur, ce profil et cet appareil. Effacer ses données, changer de navigateur ou utiliser un autre ordinateur ne transfère pas les projets. La fermeture de l’application conserve les fiches correctement enregistrées, mais pas les changements signalés comme non sauvegardés. Les fichiers JSON permettent le transfert manuel.

Il n’y a ni compte, ni partage synchronisé, ni modification simultanée. Évitez d’ouvrir plusieurs fenêtres d’édition à la fois : cette version ne gère pas les conflits entre fenêtres. L’export PDF utilise la fenêtre d’impression du navigateur, sans logiciel supplémentaire. Le document suit le modèle fourni par VSV (logo, coordonnées, rubriques numérotées et blocs à la couleur choisie), avec une pagination adaptée aux textes longs.

## 5. Évolutions possibles

Budgets plus détaillés, plannings de bénévoles, fiches techniques, bilans, courriers, convocations, puis stockage partagé et comptes avec rôles. Les données des projets et des réunions sont séparées de leurs documents pour pouvoir être réutilisées. Ces fonctionnalités ne sont pas implémentées dans cette version.

## Repères techniques et vérifications

- `src/model.js` : structure des projets, format versionné, validations et calculs en entiers.
- `src/meeting-model.js` : informations de réunion, participants, ordre du jour, validations et duplication.
- `src/meetings.js` : liste et rédaction des comptes rendus.
- `src/meeting-document.js` : présentation fidèle, paragraphes, listes et actions.
- `src/pv-model.js` : données d’AG, instantanés, ordre annoncé et duplication de structure.
- `src/pv-rules.js` : contrôles de dates civiles, quorum, pouvoirs et votes.
- `src/pv.js` : préparation et rédaction des PV.
- `src/pv-document.js` : aperçu et document A4 des PV.
- `src/backup.js` : sauvegarde commune V4 et import des sauvegardes V1/V2/V3.
- `src/pdf.js` : export via impression, partagé entre les trois types de documents.
- `src/references-model.js` : membres, articles, lieux, hiérarchies et copies dans les documents.
- `src/csv.js` : parseur CSV, encodages, rapprochement et préparation des imports.
- `src/references-ui.js` : paramètres et gestion des listes en fenêtre.
- `src/reference-selectors.js` : recherche, clavier et intégration aux formulaires.
- `src/pack.js` : quantités et calculs monétaires des packs en entiers.
- `src/storage.js` : lecture et écriture locales, erreurs propagées à l’interface.
- `src/app.js` : interface et parcours de saisie.
- `src/document.js` : présentation du document et échappement des textes.
- `src/style.css` : présentation responsive et styles d’impression.
- `server.js` : serveur local, sans dépendance.

Exécuter `npm test` pour les 56 tests automatiques de données, de sauvegardes compatibles, de PDF et de chemins Windows/Linux. Les parcours ont également été vérifiés dans Chromium : création, modification, rechargement, duplication, suppression confirmée ou annulée, lignes budgétaires, centimes, téléchargement/import JSON, import invalide, accents, aperçu, échec de stockage simulé et largeur mobile. Windows, macOS, Safari et Firefox n’ont pas été testés dans cet environnement Linux.

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
9. **Télécharger la sauvegarde JSON** sauvegarde tous les projets, tous les comptes rendus et tous les PV, quel que soit le module utilisé. L’import ajoute les documents et transforme les doublons en copies sans écrasement. Téléchargez régulièrement ce fichier ; un PDF ne permet pas de restaurer les champs modifiables.

Les projets déjà présents sont lus sans manipulation et leur stockage passe au format commun lors du prochain enregistrement réussi. La sauvegarde reste locale au navigateur, au profil et à l’appareil. Évitez plusieurs fenêtres d’édition et les anciennes versions de l’application : il n’y a pas de synchronisation ni de gestion de conflits. Les convocations ne sont pas développées. Les PV disposent de leur section distincte.

### Vérifications du module

Les parcours ont été exécutés dans Chromium sous Linux : projet historique au format V1 conservé et modifiable, compte rendu créé/modifié, notes retrouvées après rechargement, fermeture réelle de Chromium et réouverture du même profil, ajout de noms avec Entrée, homonymes, états et réordonnement, suppression confirmée/annulée, masquage des notes sans perte, aperçu, sections repliées, deux duplications, finalisation et réouverture, recherche, échec de stockage, import V1/V2 et fichier invalide. La présentation a aussi été vérifiée en largeur mobile et dans un PDF A4 de 21 pages contenant 130 paragraphes et 65 actions : fin du texte présente, dernière action présente, notes masquées absentes et aucune page vide. Le bouton PDF a été testé ; la fenêtre native d’impression sous Windows n’est pas testable dans cet environnement Linux.

Les tests navigateur reproductibles sont dans `tests/browser/` ; voir `tests/README.md`. Les limites générales de navigateur et de multi-fenêtres restent celles décrites plus haut.

## Procès-verbal d’assemblée générale : mode d’emploi

1. Ouvrez **Procès-verbal**, puis **Créer un procès-verbal**. Le formulaire apparaît immédiatement, avec la date du jour modifiable. Choisissez AGO ou AGE, première ou seconde convocation. Complétez progressivement les dates, le lieu, l’effectif des adhérents à jour et le bureau de séance. Un brouillon incomplet peut être enregistré.
2. Saisissez le nombre de présents votants immédiatement ; les noms peuvent venir ensuite. Entrez les noms avec **Entrée**. Ajoutez les pouvoirs et confirmez la cotisation du mandant. Si le nom du mandataire n’est pas encore dans la liste, sa présence doit être confirmée explicitement. Les pouvoirs en anomalie ne sont pas retenus automatiquement ; corrigez les doublons, mandataires absents et dépassements.
3. Consultez les contrôles près du formulaire. Dans **Règles utilisées**, confirmez les interprétations nécessaires et leur justification : représentés dans le quorum, limite de pouvoirs AGE et délais de seconde convocation. Sans confirmation nécessaire, le résultat reste **À vérifier**. Les délais sont une différence de dates civiles (date initiale exclue, date de l’AG incluse), sans ajout de jours francs. Sur seconde convocation, le quorum est **non exigé**, mais les délais et majorités restent à contrôler.
4. Ajoutez et réordonnez l’ordre du jour annoncé, puis **Commencer la rédaction du PV**. La copie de référence est conservée. Les nouveaux sujets sont par défaut ajoutés en séance ; leur origine reste modifiable. Une correction explicite de la copie annoncée demande un motif et conserve la version précédente dans l’historique.
5. Saisissez les discussions, décisions et actions dans chaque point. Les zones se replient sans perte de texte. Pour **Non discuté** ou **Reporté**, choisissez si les notes conservées doivent apparaître dans le document. Les propositions de points AGO/AGE sont facultatives, modifiables et ne constituent aucune adoption.
6. Ajoutez les résolutions et saisissez le texte exact, les voix disponibles et chaque catégorie de vote. Un champ vide n’est pas zéro. Le bouton de mise à zéro concerne uniquement les catégories encore vides. Si des voix ne participent pas, indiquez-le explicitement avec l’aide proposée. Les règles et l’effectif au moment du vote sont conservés avec celui-ci ; les changements ultérieurs de présence ne modifient pas les votes antérieurs. Notez arrivées, départs et déports dans le champ prévu. Les élections disposent de candidats, résultats et règle de scrutin propres, avec une conclusion saisie par le rédacteur : aucun élu n’est inventé.
7. Complétez la clôture et les signataires. Les personnes de séance sont proposées une fois, puis restent modifiables. **Aperçu** montre les données réelles. **Imprimer / Enregistrer en PDF** ouvre la fenêtre du navigateur : choisissez un fichier PDF, le format A4 et désactivez les en-têtes/pieds de page du navigateur si nécessaire. Une annexe facultative présente les noms et pouvoirs.
8. **Finaliser** signale les contrôles incomplets ou négatifs et les points encore en attente. Une finalisation explicite verrouille la saisie ; **Rouvrir pour modifier** la réactive après confirmation. Finalisé ne signifie ni approuvé, ni juridiquement certifié, ni signé. Les emplacements de signature restent vierges.
9. **Dupliquer** prépare une nouvelle AG avec les titres de points et les règles copiées, mais sans dates, effectif, personnes, pouvoirs, notes, votes ou signatures. Renseignez l’effectif à nouveau et vérifiez les règles adaptées à cette nouvelle AG. Téléchargez régulièrement la sauvegarde JSON commune ; un PDF ne restaure pas le formulaire.

### Vérifications et limites des PV

Les règles implémentées viennent des articles 10/11 tels que fournis dans la demande. Les détails signalés comme ambigus nécessitent votre confirmation justifiée ; l’application ne certifie pas globalement la régularité de l’assemblée. Les majorités binaires excluent abstentions, blancs et nuls des suffrages exprimés ; aucune voix prépondérante n’est appliquée. Un scrutin particulier nécessite sa règle et sa conclusion explicites.

Les 82 tests Node vérifient notamment les seuils 80/81 adhérents, les deux tiers exacts, les égalités, les pouvoirs excessifs, les dates civiles, les secondes convocations, les instantanés et les imports V1/V2/V3. Dans Chromium sous Linux, les parcours AGO/AGE, rédaction, notes conservées, duplication, finalisation/réouverture, imports, erreur de stockage et affichage mobile ont été exécutés. Un profil a été fermé puis rouvert réellement. Un PV fictif A4 de **26 pages** a été généré : fin du texte, dernières résolutions et annexe présentes, notes masquées absentes, aucune page vide. Les projets historiques et les comptes rendus restent accessibles et modifiables.

La fenêtre native d’impression Windows et les navigateurs Safari/Firefox n’ont pas été testés ici. Il n’y a pas de signature électronique, de convocations automatiques, de certification juridique ni de travail simultané. Les contrôles visibles et les règles copiées dans chaque PV restent consultables dans l’aperçu et la sauvegarde.

## Membres, articles, lieux et paramètres : mode d’emploi

### Importer les membres depuis Paheko

Ouvrez **Paramètres → Membres → Importer / mettre à jour depuis Paheko**, puis choisissez votre CSV exporté de Paheko. Le fichier reste sur votre ordinateur : aucun envoi vers Paheko ni vers un service distant.

1. Vérifiez l’encodage et le séparateur détectés (virgule, point-virgule ou tabulation). Si les accents sont illisibles ou les colonnes incorrectes, changez ces options. UTF-8, Windows-1252 et UTF-16 sont proposés. Les guillemets, guillemets doublés et cellules multilignes sont pris en charge.
2. Associez les colonnes disponibles. Seul un nom ou prénom est nécessaire ; les coordonnées restent facultatives. Dans le format Paheko reconnu, le courriel est proposé automatiquement ; vous pouvez le désassocier. Les numéros restent du texte, avec leurs zéros initiaux. Ne mappez une cotisation que si sa signification est explicite : oui/non, payé/impayé, à jour/non à jour. Les dates reconnues sont AAAA-MM-JJ et JJ/MM/AAAA ; une expiration seule ne garantit pas le droit de vote.
3. Pour une colonne d’état contenant oui/non ou 1/0, précisez explicitement si elle signifie **actif** ou **archivé**. Sans information interprétable, l’état et la cotisation restent inconnus. Un état inconnu reste visible dans l’annuaire.
4. Cliquez sur **Examiner l’import**. Vous voyez créations, mises à jour et anomalies. L’identifiant Paheko stable permet une mise à jour ; un rapprochement proposé par nom nécessite votre décision. Pour un homonyme, choisissez **Créer un membre distinct**. Les membres absents du fichier ne sont jamais supprimés. Les lignes invalides sont signalées et ignorées uniquement après confirmation.
5. Cliquez sur **Confirmer l’enregistrement de cet import**, puis confirmez le récapitulatif. Fermer la fenêtre auparavant ne modifie rien. Le résultat et la date du dernier import réussi sont consultables dans la gestion des membres.

Le CSV ne modifie pas les effectifs ni les noms des documents existants. Dans une AG, vérifiez toujours la cotisation et le droit de vote à la date de l’assemblée. Le bouton **Utiliser explicitement le nombre de présents nommés** demande confirmation avant de remplacer le nombre déclaré ; l’effectif total des adhérents reste saisi séparément.

### Enrichir les listes pendant la saisie

Les champs de membres, lieux et articles proposent une recherche sans distinction de casse ou d’accents. **▾** ouvre toute la liste ; pour les articles et lieux, vous pouvez filtrer par catégorie. Le chemin complet identifie chaque résultat. Utilisez **↑ / ↓**, puis **Entrée** pour sélectionner ; **Échap** ferme les propositions. Vous pouvez aussi cliquer ou toucher un résultat. Les 100 premiers résultats sont affichés : précisez la recherche pour une grande liste.

**⚙ Gérer cette liste** ouvre la gestion sans quitter le document ni vider les notes. Depuis les propositions, **Ajouter un élément** permet de créer puis sélectionner immédiatement une référence. Elle est enregistrée pour les autres documents. Les invités et partenaires peuvent rester en saisie libre, sans ajout obligatoire à l’annuaire. Pour les participants et l’équipe de projet, les étiquettes **×** retirent un nom ; une même référence ne peut pas figurer deux fois dans une liste. Les noms historiques ne sont pas rapprochés automatiquement.

Dans **Catalogue d’articles** et **Lieux**, créez les catégories, puis leurs sous-catégories en choisissant un parent. Les déplacements circulaires sont refusés. Modifier un article ou un lieu permet de le déplacer dans l’arborescence. **Archiver** le retire des nouvelles propositions, sans supprimer ses informations des documents. **Voir aussi les archives** permet de le réactiver. Il n’y a pas de suppression définitive des référentiels dans cette version.

Les lieux proposent commune, adresse, capacité, contact, notes et accessibilité. Leur sélection copie ces informations dans le document ; les adaptations suivantes restent propres à ce document. Un lieu du répertoire n’est ni réservé ni garanti disponible.

### Achats par packs

Dans les dépenses d’une fiche projet, recherchez un article dans le libellé. Sa sélection active le mode **Achat par packs / à l’unité** et copie son conditionnement/prix habituel, s’ils existent. Complétez **Nombre de packs**, **Unités par pack** et **Prix d’un pack**. Pour acheter à l’unité, choisissez une unité par pack.

Avec 3 packs de 6 bouteilles à 9 € le pack, l’application affiche **18 bouteilles**, **27 €** et **1,50 € par bouteille**. Packs et unités sont des entiers strictement positifs ; le prix peut être nul et accepte la virgule. Le total est calculé en centimes depuis les packs. Le prix unitaire porte la mention **environ** lorsqu’il est arrondi. La ligne est comptée une seule fois dans le budget. Le mode **Dépense libre** conserve les prestations, locations et autres dépenses habituelles.

**Mémoriser ce conditionnement et ce prix pour les prochains achats** demande confirmation avant de mettre à jour le catalogue. Changer le prix d’une fiche ne change ni le catalogue ni les budgets des autres fiches. Les nouveaux achats utilisent ensuite le nouveau prix habituel.

### Personnaliser l’en-tête et sauvegarder

Dans **Paramètres → Apparence**, choisissez une couleur dans la palette ou saisissez un code comme **#285b4d**. L’aperçu est immédiat ; le texte devient noir ou blanc selon le contraste. La couleur enregistrée est reprise au prochain lancement et dans les boutons, liens, sélections, bordures, focus et accents de tous les aperçus/PDF. **Rétablir la couleur d’origine** revient au vert VSV. En cas d’échec d’enregistrement, le message le signale : la couleur affichée peut être un aperçu non enregistré.

La sauvegarde complète JSON contient désormais tous les documents, membres, articles, lieux et préférences. Les anciennes sauvegardes V1/V2/V3 restent importables sans effacer les listes. À la restauration, les documents en double sont ajoutés comme copies ; pour une référence ayant déjà le même identifiant, la version locale est conservée (cela est annoncé avant confirmation). Les références nouvelles sont ajoutées et la couleur importée est appliquée. Pour restaurer intégralement une ancienne version d’une référence connue, examinez et corrigez-la depuis sa fenêtre de gestion : la restauration additive n’écrase pas son contenu local. Les anciennes applications ne lisent pas V7 ; utilisez la version à jour.

Les noms, lieux, désignations, conditionnements et prix sont copiés dans chaque document sélectionné. Un changement du référentiel ou un archivage ne réécrit pas ces copies. Sur un document modifiable, **Actualiser depuis la liste** propose explicitement de remplacer un nom ou les informations d’un lieu ; une confirmation est demandée. Les anciennes saisies libres restent utilisables.

### Vérifications et limites

Les tests utilisent exclusivement des personnes et lieux fictifs. Les 82 tests Node couvrent CSV (accents, guillemets, multilignes, séparateurs, encodages), zéros initiaux, rapprochements, homonymes, états inconnus, packs et arrondis, cycles de catégories, instantanés, contraste et sauvegardes V1 à V4. Les parcours Chromium sous Linux vérifient import/annulation/mise à jour, clavier, sélection multiple, roues crantées sans perte de notes, articles réutilisés après rechargement, lieux et sous-catégories, effectifs et pouvoirs d’AG, couleur, sauvegarde et restauration. Les tests complets des comptes rendus et des PV ont également passé. Une fermeture réelle puis une réouverture de Chromium ont retrouvé les listes et la couleur ; les trois types de PDF ont été générés avec le contraste choisi. Un échec de stockage a été simulé, et la restauration a été vérifiée dans un navigateur vierge puis avec une ancienne sauvegarde.

Il n’y a pas de connexion automatique à Paheko, de synchronisation entre appareils, de réservation des lieux ni de travail simultané. Les formats CSV inconnus se configurent dans l’assistant ; les dates ou libellés non reconnus restent inconnus et sont signalés. Les gros exports réels de plusieurs dizaines de milliers de membres, Safari/Firefox, les lecteurs d’écran et la fenêtre d’impression Windows n’ont pas été testés. Les coordonnées personnelles et sauvegardes ne doivent pas être ajoutées au dépôt Git ; les essais créent leurs fichiers dans des dossiers temporaires.

## Mise à jour : stocks, caisse et sélection multiple

### Installer sans perdre le travail

1. Dans l’ancienne application, téléchargez d’abord une **sauvegarde JSON**.
2. Arrêtez la fenêtre de lancement. Décompressez la nouvelle version dans un nouveau dossier, puis lancez `Lancer-VSV.bat` ou `node server.js` comme auparavant.
3. Ouvrez **la même adresse `http://localhost:4173` dans le même navigateur et profil** : les données déjà enregistrées restent accessibles. Si vous changez d’appareil ou de navigateur, restaurez votre fichier depuis **Paramètres → Sauvegarde**.

Chrome, Edge ou Firefox récents sur `localhost` sont nécessaires pour les verrous protégeant les transactions. Sans cette protection, les opérations de stocks et de caisse sont bloquées avec un message explicite. Aucun service distant n’est utilisé.

### Cocher plusieurs éléments

Dans les menus d’équipe, de présents/excusés, d’achats et de stock prévu, cochez plusieurs résultats. Vous pouvez changer de recherche ou de catégorie sans perdre les cases déjà cochées. **Tout sélectionner dans les résultats** concerne tous les résultats filtrés, même au-delà des 100 affichés. **Désélectionner les résultats** retire uniquement ces résultats. **Valider la sélection** applique les choix ensemble ; **Annuler** ou **Échap** abandonne les nouveaux choix. Pour l’équipe et les participants, les choix existants sont cochés et peuvent être retirés. Chaque nouvel article sélectionné crée sa propre ligne. Les champs d’une seule personne ou d’un seul lieu conservent la sélection simple.

Créer une référence avec **Ajouter un élément** l’enregistre immédiatement dans la liste commune. Annuler ensuite une sélection dans un document ne supprime pas cette référence. La roue crantée ouvre toujours la gestion sans perdre le document.

### Importer le CSV Paheko fourni

Allez dans **Paramètres → Membres → Importer le CSV Paheko**. Le fichier fourni est reconnu comme UTF-8 à virgules, avec ou sans BOM. L’assistant préassocie **Numéro de membre**, **Nom & prénom**, **Adresse E-Mail** et **Catégorie**. Examinez l’aperçu, puis confirmez. Le mode manuel reste disponible pour les autres fichiers et pour importer facultativement téléphone, adresse ou code postal, conservés comme du texte.

Le nom complet est conservé tel quel, sans découpage. Les catégories nouvelles sont créées automatiquement. Le réimport retrouve les membres par leur numéro Paheko ; les rapprochements par nom sont seulement proposés et doivent être confirmés. Une catégorie vide conserve celle déjà connue. Les personnes et catégories absentes restent dans l’annuaire. Une catégorie associative ne donne ni fonction précise ni droit de vote ; ce CSV ne prouve aucune cotisation. Date d’inscription et rattachements ne sont pas utilisés pour les paiements, pouvoirs ou voix.

Le fichier réel fourni a été vérifié en mémoire : 92 lignes de membres, trois catégories, aucune anomalie de structure. Il n’est pas inclus dans le dépôt ni dans les tests.

### Gérer les stocks

**Stocks** utilise les articles et lieux des listes communes. Créez-les avec les roues crantées ou depuis Paramètres. **Ajouter un article** ouvre le formulaire progressif. Sa fiche en sous-onglet permet de modifier la nature, le mode de suivi, le mode d’achat, le prix de vente, l’exclusion de la caisse et la photo. Les photos JPEG/PNG/WebP sont réduites localement, peuvent être remplacées ou supprimées et sont incluses dans les sauvegardes.

**Ajouter du stock** crée une entrée avec date, lieu, origine et coût historique. Les achats par packs calculent la quantité et le coût depuis le prix du pack ; les poids sont conservés en grammes, avec trois décimales en kg. Décochez **Coût non renseigné** pour saisir un prix connu, y compris zéro. Le calcul s’affiche avant confirmation.

**Retirer du stock**, **Transférer** et **Corriger l’inventaire** créent des mouvements consultables dans l’historique. Une correction exige un motif. Un transfert conserve le total global et ne déplace pas des quantités réservées à un autre projet. Pour le matériel, utilisez **Mettre du matériel à disposition**, puis **Enregistrer un retour** dans la liste du matériel à rendre. Le suivi à l’unité/au poids ne peut plus être changé après des mouvements ; créez une autre référence si nécessaire.

Les chiffres **Physique**, **Réservé** et **Disponible** sont distincts. Les stocks sont répartis par lieu commun ; aucun lieu n’est créé dans un catalogue parallèle.

### Relier un projet

Dans **Moyens**, sélectionnez des articles dans **Utiliser le stock disponible** et/ou **Acheter de nouveaux articles**. Le même article peut avoir une ligne de stock existant et une ligne d’achat. Le stock existant ajoute **0 € de dépense supplémentaire** ; son coût historique et son prix de vente sont conservés ailleurs.

Un besoin prévu ne change rien aux quantités. **Réserver / ajuster explicitement** diminue le disponible, sans diminuer le physique. **Libérer la réservation** ou **Fin d’événement** libère le restant. Libérez avant de changer de lieu. **Confirmer une consommation réelle** est réservé aux utilisations hors ventes de caisse : ne ressaisissez jamais des ventes déjà déduites. Pour du matériel réutilisable, le bouton propose une mise à disposition suivie d’un retour.

Une dépense prévue ne crée aucune entrée. **Réceptionner en stock** ouvre la réception d’un besoin dans la liste de courses. Les achats peuvent être partiels, plus petits ou plus grands que le besoin, avec un prix réel différent à chaque réception. Pour corriger une erreur, utilisez les mouvements d’inventaire avec motif ; il n’y a pas de suppression de l’historique. Dupliquer un projet ne copie pas ses réservations réelles ni ses réceptions.

### Tenir la caisse

1. Dans **Caisse**, sélectionnez l’opérateur, l’heure d’ouverture, le lieu de stock, éventuellement le projet, et le fond initial en espèces. Une seule session peut être active. Les réservations de son propre projet restent mobilisables ; celles des autres projets sont protégées.
2. Cherchez ou filtrez les catégories. Touchez un article pour ajouter une unité ; **+ / −** modifient le panier. La recherche et les catégories ne le vident pas. Le panier est sauvegardé automatiquement. Sur petit écran, **Voir le ticket** mène à la commande sous la grille. Les articles au poids sont exclus de la caisse.
3. Choisissez espèces, chèque ou carte. Pour les espèces, renseignez la somme remise : le rendu est calculé et un montant insuffisant est refusé. Le clic sur **Encaisser** enregistre le paiement reçu. Carte et chèque sont seulement enregistrés ; l’application ne communique avec aucun terminal bancaire.
4. **Encaisser** revérifie le stock, enregistre un numéro unique et déduit les unités dans la même écriture. Le panier seul ne déduit rien. Un double clic ne crée pas deux ventes. Les prix enregistrés sont figés. Le ticket peut être imprimé ou enregistré en PDF avec la fenêtre d’impression.
5. Une vente encaissée se corrige par **Correction / remboursement**, avec vente d’origine, quantités, motif, moyen réellement remboursé et choix explicite de remise en stock pour chaque article. Les quantités déjà remboursées ne peuvent pas l’être à nouveau. Aucun effacement de vente n’est proposé.
6. **Enregistrer une relève** conserve l’opérateur initial et ajoute le nouvel opérateur. **Apport / retrait d’espèces** conserve les mouvements de monnaie séparément des ventes.
7. **Clôturer la caisse** demande les espèces comptées. Un comptage par pièces/billets est facultatif. Un écart exige un commentaire. Le récapitulatif conserve ventes, remboursements, quantités, paiements, horaires et opérateurs ; consultez-le ensuite dans **Sessions clôturées**, puis imprimez/exportez-le en PDF ou téléchargez son récapitulatif JSON. Ce JSON de consultation ne remplace pas la sauvegarde complète restaurable.

Espèces attendues = fond initial + ventes espèces − remboursements espèces + apports − retraits. Une vente de 7 € payée avec 10 € augmente le tiroir de 7 €. Chèques et cartes restent séparés. Chaque nouvelle session demande son propre fond.

La caisse est protégée par un verrou par navigateur : un autre onglet ne peut pas encaisser pendant qu’un onglet affiche Caisse. Quittez cette page dans le premier onglet, puis cliquez sur **Réessayer** dans le second. Une fermeture accidentelle libère le verrou mais conserve la session et le panier. Cela ne synchronise pas plusieurs appareils. Ce module n’est pas un logiciel de caisse certifié.

### Sauvegarder et personnaliser

**Paramètres → Apparence** applique une couleur principale à toute l’identité visuelle et aux documents imprimés. Les variantes de fond, survol et focus sont calculées ; le texte sur fond coloré devient noir ou blanc selon le contraste. Erreurs, avertissements et confirmations gardent leurs couleurs de sens. La couleur reste enregistrée et peut être réinitialisée.

La sauvegarde complète **V6** est un instantané : elle comprend documents, référentiels/catégories, images, thème, mouvements/réservations/prêts/réceptions et tout l’historique de caisse. **Restaurer un fichier V5 ou V6 contenant des opérations remplace l’instantané local des stocks et de la caisse après une confirmation supplémentaire**. Les ventes ne sont pas rejouées. Téléchargez donc votre sauvegarde actuelle avant restauration. Les documents restent importés de manière additive ; les références déjà connues gardent leur version locale, comme annoncé. Une ancienne sauvegarde V1 à V4 conserve les stocks et caisses existants. La restauration financière est refusée si un autre onglet tient la caisse.

Le stockage du navigateur a une capacité limitée, notamment avec les photos et un long historique. Si une écriture échoue, le message l’indique et les anciennes données restent intactes ; une vente refusée ne crée aucun paiement ni mouvement partiel. Téléchargez régulièrement une sauvegarde complète. Les transactions refusées ne sont pas des paiements à traiter automatiquement : si vous avez déjà reçu de l’argent, conservez le panier, résolvez l’erreur et réessayez le même encaissement. Aucune sauvegarde automatique n’est envoyée sur Internet.

### Vérifications de cette mise à jour

Les 82 tests Node couvrent les anciens documents et les nouveaux calculs, coûts inconnus/zéro, réservations, transferts/corrections, prêts/retours, réceptions uniques, paiements, double validation, remboursements et clôtures, Paheko, thème et formats de sauvegarde. Les parcours Chromium sous Linux vérifient la sélection multiple conservée à travers les recherches et annulable, articles groupés, photos, packs/poids, stock projet, réception unique, caisse, deux onglets, reprise après rechargement et fermeture réelle, refus de quota sans perte, relève, remboursement, clôture avec écart et restauration des images/thème. Les tickets et un récapitulatif long ont été réellement générés en PDF ; les fiches projet, comptes rendus et PV ont été revérifiés.

Les impressions Windows, imprimantes à tickets physiques, écrans tactiles réels, Firefox/Safari et lecteurs d’écran n’ont pas été testés ici. La mise en page mobile a été vérifiée à 390 pixels dans Chromium. Les ventes au poids, valorisation comptable automatique du stock et synchronisation multiappareil sont hors de cette version. Les éditions de documents dans plusieurs onglets ne gèrent pas les conflits ; les verrous protègent les opérations financières/stock et la caisse, sans ajouter une édition collaborative.


## Mise à jour : stocks centralisés, courses et produits sans décompte

Avant de remplacer les fichiers de l’application, téléchargez une sauvegarde complète dans **Paramètres → Sauvegarde**. Conservez ensuite le même navigateur, profil et adresse `http://localhost:4173` : les données restent dans ce stockage, les fichiers de code ne contiennent pas vos fiches. Fermez la caisse et arrêtez l’ancien lancement avant de relancer. Les formats de sauvegarde V1 à V5 restent acceptés ; aucune vente ni réception n’est rejouée.

1. **Créer un article.** Dans **Stocks → Ajouter un article**, renseignez le nom, la catégorie, la nature et le mode de suivi. **Stock suivi** propose l’achat à l’unité, en pack ou au poids. **Vente sans décompte de stock** demande le prix de vente et, facultativement, un coût estimé et une image. Ce dernier mode ne compte aucun ingrédient. La fiche s’ouvre dans un sous-onglet ; **Tous les articles** conserve recherche et filtres. Fermer un sous-onglet ne supprime rien. Les informations de l’article s’enregistrent avec **Enregistrer les informations**. La création depuis un sélecteur de matériel réutilisable présélectionne cette nature et sélectionne immédiatement le nouvel article.
2. **Prévoir les courses.** Utilisez **Je dois en acheter** à la création, **Prévoir un achat** dans une fiche article, ou **Ajouter un achat** dans **Liste de courses**. Les lignes d’achat liées au catalogue dans les projets y apparaissent aussi automatiquement. Un besoin ne crée aucun stock. Modifier un achat dans le projet actualise le besoin restant, sans duplication. La vue regroupée rapproche le même article tout en gardant chaque provenance ; les cases permettent de sélectionner plusieurs lignes, puis de vérifier leurs réceptions successivement.
3. **Réceptionner au prix réel.** Cliquez sur **C’est acheté**. Vérifiez quantité, conditionnement réel, date et lieu. Choisissez explicitement le prix connu : total payé, prix du pack, prix unitaire ou prix au kg. Les résultats se calculent à partir de cette seule source. Un achat partiel laisse le reste à acheter, sauf clôture volontaire. Un surplus peut alimenter d’autres besoins du même article ou rester en stock général, sans réservation automatique. La réception, l’entrée en stock, les coûts affectés aux projets et le dernier prix sont enregistrés ensemble. Le prix payé et la note de promotion restent dans l’historique. Pour des articles déjà possédés, **Ajouter du stock** conserve un coût inconnu distinct d’un coût nul. Une correction passe par un mouvement d’inventaire motivé, sans effacer une réception.
4. **Vendre des sandwiches.** Créez vos sandwiches en **Vente sans décompte de stock**, avec leur prix, et laissez **Exclure cet article de la vente** décoché. Dans chaque nouvelle session de caisse, utilisez **Vérifier : disponible**. Ensuite **Épuisé** interrompt les ventes et **Remettre en vente** les reprend. La caisse affiche **Stock non suivi** ; les ventes et remboursements ne déplacent ni sandwiches ni ingrédients. Les merguez, chipolatas et pains achetés restent des articles distincts. Leur consommation s’enregistre explicitement si vous souhaitez actualiser leur quantité ; aucun pesage n’est imposé à la clôture. Une observation sur les restes est possible. Les achats et recettes sont distingués sans prétendre calculer un coût exact par sandwich.
5. **Choisir l’apparence.** Dans **Paramètres → Apparence**, choisissez **Clair**, **Sombre** ou **Système**. Le dernier suit la préférence exposée par le navigateur ; un choix manuel convient si Edge ne déclare pas la préférence attendue. La palette ou le code hexadécimal change l’identité visuelle dans les deux thèmes, avec des variantes lisibles. Le choix est conservé, appliqué dès le chargement et réinitialisable. Les impressions et PDF restent clairs, au format papier.

Les articles existants conservent leur état de vente et leurs stocks. Pour changer de mode, utilisez **Changer le mode de suivi** dans la fiche : le passage sans décompte exige de traiter explicitement les stocks, réservations, prêts et achats restants. Le passage au suivi demande un inventaire initial, même nul. Les historiques ne sont pas recalculés. Pour une ancienne nature non renseignée, choisissez-la explicitement ; son nom et sa catégorie ne déterminent pas sa nature. Un prix manquant bloque la vente ; `0` explicite indique un article gratuit. Les articles suivis au poids restent exclus de la caisse à l’unité.

**Vérifications :** 82 tests Node passent, dont calculs réciproques, centimes répartis exactement, surplus, achats partiels, idempotence, migrations, coûts inconnus/zéro, changements de mode et sandwiches sans décompte. Les parcours Chromium vérifient le nouveau formulaire, les sous-onglets, la table réutilisable créée depuis le sélecteur, les roues crantées sans perte de saisie, les courses de projets stables, les achats au prix réel, la caisse, le remboursement, la reprise, les thèmes clair/sombre/système et la restauration V6. Les parcours existants des projets, comptes rendus et PV ont été revérifiés ; les trois types de PDF, les tickets et un récapitulatif long ont été générés. Les données de test sont fictives.

**Limites :** vérifications réalisées sous Chromium/Linux, sans test direct d’Edge/Windows, de Safari/Firefox, d’une imprimante physique ou d’un lecteur d’écran. Les quantités sont celles des mouvements enregistrés : les ingrédients consommés sans déclaration restent à vérifier. Les indicateurs de marge portent sur le seul coût affiché, hors autres frais ; pour les produits sans décompte, ils sont explicitement estimatifs. Il n’existe pas de recette automatique, de vente au poids, de valorisation comptable du stock ni de correction rétroactive du prix d’une réception. Le stockage reste local, limité par le navigateur et sans synchronisation entre appareils. Sauvegardez régulièrement ; les conflits d’édition des documents entre onglets restent hors périmètre.

## Mise à jour : caisse rapide et stocks simplifiés

Le lancement ne change pas : sous Windows, ouvrez **Lancer-VSV.bat**, puis l’adresse indiquée. Sinon, dans le dossier de l’application, `npm start` ouvre le service local ; consultez `http://localhost:4173`. Aucun déploiement ni abonnement.

### Encaisser et retrouver les tickets

La grille d’articles se trouve à gauche, la commande à droite. Sur ordinateur, les articles et les lignes de commande défilent séparément ; le total et les actions restent visibles. Sur petit écran ou avec un fort zoom, l’affichage passe en une colonne. La touche **/** mène à la recherche lorsqu’on n’est pas déjà en train de saisir.

Choisissez **Espèces**, **Carte bancaire** ou **Chèque**. Pour les espèces uniquement, renseignez le montant remis ou utilisez **Montant exact**. **Encaisser** enregistre directement le paiement et le stock ensemble, puis prépare une nouvelle commande. Il n’y a ni seconde case de confirmation ni impression automatique. En cas d’échec, le panier reste intact. L’application ne pilote pas de terminal bancaire.

Dans **Récapitulatif**, recherchez un numéro de ticket, filtrez par session et paiement, puis dépliez un ticket pour l’ouvrir ou l’imprimer. Vous pouvez imprimer / enregistrer en PDF la synthèse seule ou la synthèse avec **tous les tickets des sessions sélectionnées**, indépendamment de la recherche affichée. Les prix historiques et les remboursements liés restent conservés.

### Transférer entre moyens de paiement

1. Ouvrez **Autres actions → Apport / retrait / transfert**.
2. Choisissez **Transfert entre moyens de paiement**, le moyen **remis par l’association**, le moyen **reçu**, puis le montant positif.
3. Vérifiez la phrase récapitulative avant d’enregistrer un échange réellement effectué. Exemple : donner 10 € d’espèces et recevoir 10 € par carte diminue le tiroir de 10 € et ajoute 10 € aux transferts carte. Les ventes et le stock ne changent pas.

Le transfert est une seule opération à deux côtés. N’ajoutez pas un retrait d’espèces supplémentaire pour le même échange. Son historique permet une **annulation par échange inverse réellement effectué**, sans effacer l’opération d’origine. La synthèse distingue ventes, remboursements, transferts, apports et retraits. Les remboursements espèces sont soustraits une seule fois du calcul du tiroir.

### Mettre une commande en attente

Cliquez sur **Mettre en attente**, ajoutez éventuellement un nom ou une note, puis enregistrez. Une nouvelle commande devient immédiatement disponible. **En attente (nombre)** permet de reprendre ou supprimer une attente avec confirmation. Elles survivent au rechargement et à la fermeture du navigateur, sans recette, retrait de stock ni réservation.

Si une commande est déjà commencée, la reprise propose de la mettre en attente ; refuser conserve le panier courant. Les prix convenus sont conservés. Un stock devenu insuffisant est signalé dans les lignes sans perdre la commande. Vous pouvez diminuer les quantités. **Options de commande → Actualiser explicitement les prix** remplace les prix seulement à votre demande. À la clôture, choisissez de conserver les attentes pour une prochaine session ou de les supprimer explicitement.

### Stocks et formulaire d’article commun

Sur **Stocks**, sélectionnez d’abord un article dans **Modifier le stock** : **Ajouter du stock** et **Retirer du stock** sont réellement désactivés tant qu’il n’y a pas d’article suivi sélectionné. **Voir tous les articles** propose la recherche et les boutons des catégories existantes. Les quantités sont totalisées ; les répartitions anciennes par lieu, transferts, prêts et historiques restent accessibles dans chaque fiche.

Le même formulaire est utilisé depuis Stocks, Caisse, Catalogue, les projets, les courses et les roues crantées. Le stock déjà possédé est **vide par défaut** : vide ne crée aucun mouvement ; une quantité crée une seule entrée initiale. Modifier les informations d’un article ne réintroduit jamais ce stock. **Prévoir un achat** ajoute un besoin à la liste de courses avec le conditionnement saisi, sans augmenter le stock avant réception.

**Ingrédient pour produit préparé** exclut l’article de la caisse et masque le prix de vente. Le coût d’achat reste disponible. Il ne crée ni recette de préparation ni consommation automatique. Un sandwich vendu sans suivi ne retire donc ni pain ni merguez.

Le mode **Au litre** accepte des litres ou millilitres et un prix au litre ou total. Exemple : 5 litres pour 12,50 € donnent 2,50 €/litre. Le stockage interne utilise des millilitres entiers. Comme les articles au poids, les articles suivis au litre ne sont pas vendus directement en caisse ; une bouteille vendue à l’unité reste un article suivi à la pièce.

### Conservation et limites

Les sauvegardes complètes **V7** incluent les nouveaux champs, litres, transferts et commandes en attente. Les versions V1 à V6 restent importables ; restaurer ne rejoue ni vente ni mouvement. Les anciennes applications ne peuvent pas lire V7. Téléchargez régulièrement une sauvegarde dans **Paramètres → Sauvegarde**.

Les 92 tests automatiques passent, couvrant calculs, migrations et protection des données. Les parcours visuels sont vérifiés sous Chromium/Linux, sur des formats d’ordinateur courants et à 390 px de largeur. L’export utilise **Imprimer / Enregistrer en PDF** du navigateur. Edge/Windows, Safari, Firefox, une imprimante physique et un lecteur d’écran n’ont pas été testés directement. Le stockage reste local et limité par le navigateur ; il n’y a ni synchronisation entre appareils ni traitement bancaire ni certification de caisse.

## Fournisseurs, bons de commande et navigation

- **Paramètres → Fournisseurs** : ajoutez les fournisseurs et leurs coordonnées facultatives. La recherche, **Ajouter un élément** et la roue crantée sont également disponibles pendant la saisie d’un achat ou d’un article.
- Dans la **fiche article**, choisissez éventuellement un **fournisseur habituel**. Il est repris uniquement pour les nouveaux besoins. Dans **Liste de courses**, **Choisir / modifier** permet de changer le fournisseur d’une ligne ; **Sans fournisseur** retire l’affectation. Les anciens bons conservent leur contenu.
- **Regrouper par fournisseur** rassemble visuellement les résultats avec leurs sous-totaux, sans changer les achats. Le choix est mémorisé sur cet appareil.
- **Bon de commande / PDF** demande explicitement le périmètre : toute la liste restante (indépendamment des recherches et filtres) ou un fournisseur. Les achats partiels utilisent le reste à acheter. Ajoutez des observations et choisissez éventuellement le regroupement du document global, puis **Enregistrer le bon et ouvrir l’aperçu**.
- Cliquez sur **Imprimer / Enregistrer en PDF** et choisissez l’enregistrement PDF dans la fenêtre du navigateur. Les prix absents restent **À confirmer** ; le total est alors **partiel**. Les prix historiques sont indicatifs. Un bon global est identifié comme récapitulatif multi-fournisseurs. La génération n’envoie rien, ne réceptionne rien et ne change pas les dépenses réelles.
- **Bons enregistrés → Consulter / réimprimer** reprend la référence, la date et les informations sauvegardées. Pour intégrer de nouvelles données, créez un nouveau bon, avec sa propre référence.
- Dans **Stocks**, cliquez sur **Modifier le stock** pour ouvrir ou replier le panneau. Son état est mémorisé et le repli conserve la saisie. La liste complète et les catégories restent accessibles.
- **Afficher / Masquer le menu** récupère la largeur disponible sur ordinateur. Sur mobile, le menu se superpose et se ferme après navigation, par un clic à l’extérieur ou avec Échap. Le logo ramène à l’accueil en conservant les protections de sauvegarde et les paniers.

La sauvegarde complète **V8** inclut les fournisseurs, leurs copies dans les achats, les bons enregistrés et les nouvelles préférences. Les sauvegardes V1 à V7 restent importables, sans rejouer les mouvements. Téléchargez une sauvegarde avant de remplacer les fichiers de l’application ; relancez-la puis rechargez le navigateur en conservant la même adresse locale. Les anciennes versions de l’application ne lisent pas V8.

Les bons utilisent les styles d’impression A4 du navigateur, avec en-têtes de tableau répétés et pagination. La pagination CSS est vérifiée dans Chromium récent ; sa prise en charge peut varier avec un navigateur ancien. Aucune commande n’est envoyée automatiquement. Le stockage demeure local dans le navigateur et aucune synchronisation n’est ajoutée.

Vérification de cette mise à jour : **100 tests de données réussis**, parcours Chromium des fournisseurs/bons/restauration et des modules existants (projets, réunions, PV, stocks, courses et caisse). Affichages contrôlés à 1920, 1366, 1280, 390 et 360 pixels ; formulaires contrôlés en mode sombre sur mobile. Le bon long a été produit sur **8 pages A4**, avec en-têtes répétés et numérotation des pages. Edge/Windows et une imprimante physique n’ont pas été vérifiés directement.
