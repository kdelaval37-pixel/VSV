# Correction intégrée — VSV-TEST uniquement

Branche `feature/hub-associatif-test`. Aucune fusion dans main, aucune modification de production.

## Diagnostic établi

- Le titre de l’onglet utilisait « Fiches projet » par défaut pour les cinq nouvelles pages. Il est désormais défini pour chaque module.
- Le démarrage Supabase supprimait **tous** les fragments d’URL lorsque la session était restaurée. Les liens `#tasks`, `#agenda` et `#hub/…` étaient ainsi perdus au rechargement. Seuls les fragments d’authentification sont maintenant nettoyés.
- Les paramètres ne proposaient pas de connexion Google. L’accès existait dans une fenêtre secondaire d’administration, trop peu visible. Il est maintenant explicite dans Paramètres et Communication pour les administrateurs, y compris lorsque les réglages manquent.
- Le précédent build copiait des modules sous des noms stables ; les tests navigateur antérieurs servaient les **sources**, pas le paquet `dist`. Ils ne prouvaient donc pas le contenu effectivement téléversé. Le nouveau test sert réellement l’ancienne compilation puis la nouvelle, sur la même origine et le même profil.
- La compilation produit maintenant un point d’entrée, ses dépendances et ses styles avec empreintes, ainsi que `version.json` et `build-manifest.json`. Un nouveau menu utilise son propre code compilé. Le numéro de version apparaît dans Paramètres pour les deux types de comptes. Une route inconnue n’ouvre plus silencieusement les projets.

**Cause du renvoi au clic sur le site hébergé : non établie à distance.** L’accès HTTP à vsv-test.pages.dev est refusé depuis l’environnement de développement (403 du proxy). L’ancien paquet compilé local permettait d’ouvrir ces modules au clic ; son titre et sa restauration de route étaient toutefois défectueux. Un téléversement incomplet ou une ancienne application servie avec un nouvel index restent des hypothèses, pas un incident démontré.

**Cache :** aucun service worker, aucune inscription et aucun cache applicatif dans les sources examinées ; zéro worker enregistré dans les profils Chromium du test avant/après. `_headers` conserve `Cache-Control: no-store`. Aucun effacement de stockage, désinscription globale ou purge de comptes n’a été ajouté. Une ancienne fenêtre doit être rechargée après sauvegarde ; aucun rechargement forcé pendant une saisie ou une vente.

## Présentation

Fond teinté, cartes et panneaux arrondis, hiérarchie des titres, boutons principaux/secondaires, navigation avec icônes et libellés, tableaux, formulaires, fenêtres, focus et contrastes sombres. Les accents suivent la couleur choisie ; erreurs et avertissements gardent leurs couleurs propres. Animations écran courtes (120–180 ms), désactivées avec réduction des animations ; pas de transition de page en caisse.

La couche graphique est limitée à `@media screen`. Les modèles de documents, `style.css`, `pdf.js` et le logo restent inchangés. La comparaison imprimée avant/après et les captures sont consignées dans le rapport de parcours.

## Une seule procédure de mise à jour

**Première action :** télécharger la sauvegarde de VSV-TEST et terminer ou préserver les saisies et paniers en cours.

```powershell
git fetch origin
git switch feature/hub-associatif-test
git pull --ff-only
npm ci
powershell -ExecutionPolicy Bypass -File scripts/livraison-globale.ps1 Preparer
```

La clé demandée est uniquement la clé **publique publishable de Supabase TEST**. Ne pas utiliser une clé de production ni envoyer de secret ici. Le paquet fictif des tests n’est pas livrable.

1. **Supabase SQL : aucune nouvelle migration pour cette correction.** Si les six migrations du hub ont déjà été installées, ne pas réinstaller le socle et ne refaire aucun nettoyage d’adhérents. Le SQL global généré reste disponible pour un environnement encore incomplet ; suivre alors LIVRAISON-GLOBALE.md.
2. **vsv-api : aucun changement serveur dans cette correction.** Pas de redéploiement nécessaire si l’API intégrée précédente est installée. Si la fenêtre Google annonce une API indisponible, redéployer uniquement `vsv-api` sur `grgvwyedfrxnwhgdqpoj` avec la version intégrée, conformément au guide global. Les secrets se configurent dans Supabase, jamais dans le site.
3. **Site : reconstruire puis téléverser le paquet entier `release/vsv-test-site.zip` dans le seul projet Cloudflare Pages `vsv-test`.** À la racine du déploiement doivent se trouver `index.html`, `_headers`, `assets/`, `src/`, `version.json` et `build-manifest.json`. Ne pas téléverser le dépôt brut, l’ancien ZIP, ni uniquement `index.html`.
4. Si Pages TEST est relié à Git : dans **le projet vsv-test uniquement**, vérifier la branche de production Pages `feature/hub-associatif-test`, framework None, commande `npm run build:pages`, sortie `dist`, Node ≥22. Variables : `VSV_BUILD_TARGET=test`, `VSV_SUPABASE_URL=https://grgvwyedfrxnwhgdqpoj.supabase.co`, `VSV_SITE_URL=https://vsv-test.pages.dev/`, `VSV_SUPABASE_PUBLISHABLE_KEY` = clé publique TEST. Ne pas modifier la branche main de Git ni le projet Cloudflare de production. Une URL de prévisualisation ne prouve pas la mise à jour de l’adresse canonique.
5. Après sauvegarde du travail, recharger VSV-TEST. Comparer **Paramètres → Version de l’application** avec `dist/version.json` (ou `https://vsv-test.pages.dev/version.json`). Si les identifiants diffèrent, arrêter : le paquet attendu n’est pas servi à cette adresse. Ne pas effacer les données du navigateur pour masquer ce défaut.

Google : Paramètres → Configurer / connecter Google. Tant que les secrets OAuth, la clé de chiffrement et les destinataires TEST autorisés manquent, le statut est **Configuration nécessaire**. Les réglages détaillés sont dans LIVRAISON-GLOBALE.md. Aucun envoi n’est déclenché par la configuration ou la consultation.

## Preuves et limites

- `npm test` : 188 tests réussis.
- `npm run test:hub:browser` : parcours métier et partagés existants réussis, transports Auth/API/Realtime/Storage simulés.
- `npm run test:compiled:browser` (construit lui-même avec une clé fictive puis retire `dist`) : clic et rechargement de chacune des 16 entrées, pour administrateur **et** adhérent fictifs ; version visible ; accès Google admin et absence de contrôle admin chez l’adhérent ; mise à jour depuis `4ef6951` compilée, conservation de la session, du document et d’une donnée locale ; clair/sombre, 1440/390 px, clavier et réduction des animations.
- Captures de vrais écrans compilés : dossier [correction-captures](correction-captures/), rapport [parcours.json](correction-captures/parcours.json). Données exclusivement fictives. Les captures de formulaires/agenda peuvent être vides lorsque rien n’a été renseigné : aucun événement ou participant inventé.
- Comparaison du document projet imprimé A4 avant/après par rendu raster ; résultat dans le rapport. Les modèles des autres familles sont inchangés et leurs tests historiques passent. Ce n’est pas une comparaison pixel par pixel de chaque document possible.
- Aucun nouveau test sur les services hébergés ; aucun Google réel connecté, aucun mail envoyé. Safari, appareils physiques et une installation PWA réelle non testés. Le passage entre paquets est vérifié dans un même profil Chromium, sans service worker.

Validation utilisateur unique, après mise à jour : vérifier le numéro dans Paramètres, ouvrir Agenda puis Tâches, créer/retrouver une tâche sur un second appareil, ouvrir Documents et partenaires, Bénévolat et Communication, consulter l’état Google admin, puis un projet et son PDF habituel. Environ 10 minutes ; les autres boutons sont couverts par les parcours automatisés.

Retour arrière : conserver la sauvegarde et l’ancien paquet, puis redéployer seulement l’ancien site TEST si nécessaire. Ne supprimer ni nouvelles tables, ni documents, ni historiques. Le retour arrière ne rejoue aucune opération métier.
