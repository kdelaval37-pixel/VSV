# VSV — Veille Solidaire de Vierzon

Une application locale pour préparer les projets, rédiger les comptes rendus de réunion et les procès-verbaux d’assemblée générale de l’association, sans compte ni service payant.

## 1. Lancer l’application

Installez **Node.js, version 22 ou plus récente**, depuis son site officiel (nodejs.org), si ce logiciel n’est pas déjà installé. Téléchargez et décompressez le dossier de ce projet.

- **Windows** : double-cliquez sur `Lancer-VSV.bat`.
- **macOS ou Linux** : ouvrez un terminal dans le dossier et tapez `node server.js`.

Ouvrez ensuite **http://localhost:4173** dans votre navigateur. Gardez la fenêtre de lancement ouverte pendant l’utilisation. Pour arrêter, appuyez sur Ctrl+C dans cette fenêtre. Aucun téléchargement de dépendances n’est nécessaire. Le petit serveur fonctionne uniquement sur votre ordinateur et ne publie rien en ligne.

Utilisez toujours la même adresse, le même navigateur et son profil habituel. Évitez la navigation privée. Pour relancer, répétez ces étapes.

## 2. Créer et retrouver une fiche

L’application s’ouvre sur **Accueil**, avec vos statistiques et vos trois projets les plus récemment modifiés. Le menu latéral permet de revenir à **Accueil** ou de rejoindre **Fiches projet**, **Comptes rendus** et **Procès-verbal** ; sur téléphone, ces accès se trouvent au-dessus du contenu. Les autres catégories sont indiquées « À venir » et ne sont pas encore utilisables.

Cliquez sur **Créer une fiche projet**, puis saisissez son nom. Le reste est facultatif. Les modifications sont enregistrées automatiquement lorsque les champs sont valides. L’indicateur confirme l’enregistrement ; un message d’erreur signifie que les changements ne sont pas enregistrés. Cliquez sur **Enregistrer maintenant** pour réessayer.

Les dates peuvent rester vides. Les montants et quantités acceptent le point ou la virgule, avec deux décimales au maximum. Chaque dépense est arrondie au centime avant addition. Les nombres de participants et bénévoles sont des entiers positifs ou nuls.

Revenez à **Mes projets** pour rechercher une fiche ou filtrer par statut. **Ouvrir** permet de la modifier ; **Dupliquer** crée une copie indépendante ; **Supprimer** demande confirmation. **Aperçu** présente les informations réellement saisies sous forme de document, en masquant les rubriques vides. Le statut « Validé » ne déclenche aucune approbation.

## Exporter une fiche en PDF

Depuis la fiche ou son aperçu, cliquez sur **Exporter en PDF**. Dans la fenêtre d’impression, choisissez **Enregistrer au format PDF** (ou **Microsoft Print to PDF** sous Windows), puis **Enregistrer** et choisissez votre dossier. Utilisez le format A4 ; si le navigateur propose « En-têtes et pieds de page », désactivez cette option pour éviter l’adresse et la date ajoutées par le navigateur. L’export reprend la fiche actuellement affichée. Un message signale si elle contient des changements non sauvegardés. Corrigez les montants invalides avant l’export. Le PDF est un document de consultation ; conservez aussi votre sauvegarde JSON pour continuer à modifier les projets.

## 3. Sauvegarder et restaurer

Cliquez régulièrement sur **Télécharger la sauvegarde JSON**. Conservez le fichier téléchargé dans un dossier facile à retrouver, éventuellement sur une clé USB. Il contient vos projets, vos comptes rendus, leurs notes et les coordonnées saisies : choisissez un endroit adapté à ces informations personnelles.

Pour restaurer, cliquez sur **Importer une sauvegarde** depuis un des trois modules et choisissez le fichier JSON. Confirmez l’import. Les fiches existantes restent intactes : un identifiant déjà présent donne une nouvelle copie portant la mention « importé ». Un fichier invalide est refusé sans changer vos données. Les nouvelles sauvegardes portent le numéro de version 4 et contiennent les projets, les comptes rendus, les PV, les trois référentiels et les préférences. Les anciennes sauvegardes V1 (projets) et V2 (projets et réunions) et V3 (avec PV) restent importables sans supprimer les PV, les autres documents, les référentiels ou les préférences existants. Une ancienne version de l’application ne sait pas lire le nouveau format ; utilisez la version à jour et téléchargez une sauvegarde avant toute mise à jour.

En cas d’échec de stockage, une sauvegarde JSON depuis l’éditeur peut aussi conserver les changements valides de la fiche ouverte. Une saisie invalide doit être corrigée avant sauvegarde. Si les données déjà présentes sont illisibles, l’application bloque les écritures pour les préserver : ne les effacez pas avant d’avoir demandé de l’aide.

## 4. Limites de cette version

Les fiches résident dans ce navigateur, ce profil et cet appareil. Effacer ses données, changer de navigateur ou utiliser un autre ordinateur ne transfère pas les projets. La fermeture de l’application conserve les fiches correctement enregistrées, mais pas les changements signalés comme non sauvegardés. Les fichiers JSON permettent le transfert manuel.

Il n’y a ni compte, ni partage synchronisé, ni modification simultanée. Évitez d’ouvrir plusieurs fenêtres d’édition à la fois : cette version ne gère pas les conflits entre fenêtres. L’export PDF utilise la fenêtre d’impression du navigateur, sans logiciel supplémentaire. Le document suit le modèle fourni par VSV (logo, coordonnées, rubriques numérotées et blocs verts), avec une pagination adaptée aux textes longs.

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

Les 56 tests Node vérifient notamment les seuils 80/81 adhérents, les deux tiers exacts, les égalités, les pouvoirs excessifs, les dates civiles, les secondes convocations, les instantanés et les imports V1/V2/V3. Dans Chromium sous Linux, les parcours AGO/AGE, rédaction, notes conservées, duplication, finalisation/réouverture, imports, erreur de stockage et affichage mobile ont été exécutés. Un profil a été fermé puis rouvert réellement. Un PV fictif A4 de **26 pages** a été généré : fin du texte, dernières résolutions et annexe présentes, notes masquées absentes, aucune page vide. Les projets historiques et les comptes rendus restent accessibles et modifiables.

La fenêtre native d’impression Windows et les navigateurs Safari/Firefox n’ont pas été testés ici. Il n’y a pas de signature électronique, de convocations automatiques, de certification juridique ni de travail simultané. Les contrôles visibles et les règles copiées dans chaque PV restent consultables dans l’aperçu et la sauvegarde.

## Membres, articles, lieux et paramètres : mode d’emploi

### Importer les membres depuis Paheko

Ouvrez **Paramètres → Membres → Importer / mettre à jour depuis Paheko**, puis choisissez votre CSV exporté de Paheko. Le fichier reste sur votre ordinateur : aucun envoi vers Paheko ni vers un service distant.

1. Vérifiez l’encodage et le séparateur détectés (virgule, point-virgule ou tabulation). Si les accents sont illisibles ou les colonnes incorrectes, changez ces options. UTF-8, Windows-1252 et UTF-16 sont proposés. Les guillemets, guillemets doublés et cellules multilignes sont pris en charge.
2. Associez les colonnes disponibles. Seul un nom ou prénom est nécessaire ; les coordonnées ne sont pas importées par défaut. Les numéros restent du texte, avec leurs zéros initiaux. Ne mappez une cotisation que si sa signification est explicite : oui/non, payé/impayé, à jour/non à jour. Les dates reconnues sont AAAA-MM-JJ et JJ/MM/AAAA ; une expiration seule ne garantit pas le droit de vote.
3. Pour une colonne d’état contenant oui/non ou 1/0, précisez explicitement si elle signifie **actif** ou **archivé**. Sans information interprétable, l’état et la cotisation restent inconnus. Un état inconnu reste visible dans l’annuaire.
4. Cliquez sur **Examiner l’import**. Vous voyez créations, mises à jour et anomalies. L’identifiant Paheko stable permet une mise à jour ; un rapprochement proposé par nom nécessite votre décision. Pour un homonyme, choisissez **Créer un membre distinct**. Les membres absents du fichier ne sont jamais supprimés. Les lignes invalides sont signalées et ignorées uniquement après confirmation.
5. Cliquez sur **Confirmer l’enregistrement de cet import**, puis confirmez le récapitulatif. Fermer la fenêtre auparavant ne modifie rien. Le résultat et la date du dernier import réussi sont consultables dans la gestion des membres.

Le CSV ne modifie pas les effectifs ni les noms des documents existants. Dans une AG, vérifiez toujours la cotisation et le droit de vote à la date de l’assemblée. Le bouton **Utiliser explicitement le nombre de présents nommés** demande confirmation avant de remplacer le nombre déclaré ; l’effectif total des adhérents reste saisi séparément.

### Enrichir les listes pendant la saisie

Les champs de membres, lieux et articles proposent une recherche sans distinction de casse ou d’accents. **▾** ouvre toute la liste ; pour les articles et lieux, vous pouvez filtrer par catégorie. Le chemin complet identifie chaque résultat. Utilisez **↑ / ↓**, puis **Entrée** pour sélectionner ; **Échap** ferme les propositions. Vous pouvez aussi cliquer ou toucher un résultat. Les 100 premiers résultats sont affichés : précisez la recherche pour une grande liste.

**⚙ Gérer cette liste** ouvre la gestion sans quitter le document ni vider les notes. Depuis les propositions, **Ajouter un élément** permet de créer puis sélectionner immédiatement une référence. Elle est enregistrée pour les autres documents. Les invités et partenaires peuvent rester en saisie libre, sans ajout obligatoire à l’annuaire. Pour les participants et l’équipe de projet, les étiquettes **×** retirent un nom ; une même référence n’est pas proposée deux fois dans une liste. Les noms historiques ne sont pas rapprochés automatiquement.

Dans **Catalogue d’articles** et **Lieux**, créez les catégories, puis leurs sous-catégories en choisissant un parent. Les déplacements circulaires sont refusés. Modifier un article ou un lieu permet de le déplacer dans l’arborescence. **Archiver** le retire des nouvelles propositions, sans supprimer ses informations des documents. **Voir aussi les archives** permet de le réactiver. Il n’y a pas de suppression définitive des référentiels dans cette version.

Les lieux proposent commune, adresse, capacité, contact, notes et accessibilité. Leur sélection copie ces informations dans le document ; les adaptations suivantes restent propres à ce document. Un lieu du répertoire n’est ni réservé ni garanti disponible.

### Achats par packs

Dans les dépenses d’une fiche projet, recherchez un article dans le libellé. Sa sélection active le mode **Achat par packs / à l’unité** et copie son conditionnement/prix habituel, s’ils existent. Complétez **Nombre de packs**, **Unités par pack** et **Prix d’un pack**. Pour acheter à l’unité, choisissez une unité par pack.

Avec 3 packs de 6 bouteilles à 9 € le pack, l’application affiche **18 bouteilles**, **27 €** et **1,50 € par bouteille**. Packs et unités sont des entiers strictement positifs ; le prix peut être nul et accepte la virgule. Le total est calculé en centimes depuis les packs. Le prix unitaire porte la mention **environ** lorsqu’il est arrondi. La ligne est comptée une seule fois dans le budget. Le mode **Dépense libre** conserve les prestations, locations et autres dépenses habituelles.

**Mémoriser ce conditionnement et ce prix pour les prochains achats** demande confirmation avant de mettre à jour le catalogue. Changer le prix d’une fiche ne change ni le catalogue ni les budgets des autres fiches. Les nouveaux achats utilisent ensuite le nouveau prix habituel.

### Personnaliser l’en-tête et sauvegarder

Dans **Paramètres → Apparence**, choisissez une couleur dans la palette ou saisissez un code comme **#285b4d**. L’aperçu est immédiat ; le texte devient noir ou blanc selon le contraste. La couleur enregistrée est reprise au prochain lancement et dans les en-têtes des trois aperçus/PDF. **Rétablir la couleur d’origine** revient au vert VSV. En cas d’échec d’enregistrement, le message le signale : la couleur affichée peut être un aperçu non enregistré.

La sauvegarde complète JSON contient désormais tous les documents, membres, articles, lieux et préférences. Les anciennes sauvegardes V1/V2/V3 restent importables sans effacer les listes. À la restauration, les documents en double sont ajoutés comme copies ; pour une référence ayant déjà le même identifiant, la version locale est conservée (cela est annoncé avant confirmation). Les références nouvelles sont ajoutées et la couleur importée est appliquée. Pour restaurer intégralement une ancienne version d’une référence connue, examinez et corrigez-la depuis sa fenêtre de gestion : la restauration additive n’écrase pas son contenu local. Les anciennes applications ne lisent pas V4 ; utilisez la version à jour.

Les noms, lieux, désignations, conditionnements et prix sont copiés dans chaque document sélectionné. Un changement du référentiel ou un archivage ne réécrit pas ces copies. Sur un document modifiable, **Actualiser depuis la liste** propose explicitement de remplacer un nom ou les informations d’un lieu ; une confirmation est demandée. Les anciennes saisies libres restent utilisables.

### Vérifications et limites

Les tests utilisent exclusivement des personnes et lieux fictifs. Les 56 tests Node couvrent CSV (accents, guillemets, multilignes, séparateurs, encodages), zéros initiaux, rapprochements, homonymes, états inconnus, packs et arrondis, cycles de catégories, instantanés, contraste et sauvegardes V1 à V4. Les parcours Chromium sous Linux vérifient import/annulation/mise à jour, clavier, sélection multiple, roues crantées sans perte de notes, articles réutilisés après rechargement, lieux et sous-catégories, effectifs et pouvoirs d’AG, couleur, sauvegarde et restauration. Les tests complets des comptes rendus et des PV ont également passé. Une fermeture réelle puis une réouverture de Chromium ont retrouvé les listes et la couleur ; les trois types de PDF ont été générés avec le contraste choisi. Un échec de stockage a été simulé, et la restauration a été vérifiée dans un navigateur vierge puis avec une ancienne sauvegarde.

Il n’y a pas de connexion automatique à Paheko, de synchronisation entre appareils, de réservation des lieux ni de travail simultané. Les formats CSV inconnus se configurent dans l’assistant ; les dates ou libellés non reconnus restent inconnus et sont signalés. Les gros exports réels de plusieurs dizaines de milliers de membres, Safari/Firefox, les lecteurs d’écran et la fenêtre d’impression Windows n’ont pas été testés. Les coordonnées personnelles et sauvegardes ne doivent pas être ajoutées au dépôt Git ; les essais créent leurs fichiers dans des dossiers temporaires.
