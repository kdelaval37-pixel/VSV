# Vérification de VSV

`npm test` exécute les tests de données avec Node.js, sans installation de dépendance.

Les trois scripts dans `browser/` sont des vérifications facultatives des parcours réels dans un navigateur isolé. Ils utilisent Playwright, un outil de test qui n’est pas nécessaire pour lancer VSV. Ils génèrent leurs sauvegardes et PDF dans un dossier temporaire et n’ouvrent pas le profil habituel de l’utilisateur.

Après installation de Playwright et de son navigateur dans un emplacement de test, lancer le serveur VSV, puis :

```sh
VSV_PLAYWRIGHT_MODULE=/chemin/vers/playwright/index.mjs \
VSV_BROWSER_EXECUTABLE=/chemin/vers/chromium \
VSV_TEST_URL=http://127.0.0.1:4173 \
node tests/browser/meetings-smoke.mjs
```

Exécuter de la même façon `tests/browser/meetings-pdf.mjs` pour le document long et les autres parcours de finalisation. Si Playwright est accessible normalement comme paquet et que son navigateur est installé, les deux premières variables sont facultatives. Les commandes ci-dessus sont pour un terminal Linux/macOS ; sous Windows ces variables se définissent avec la syntaxe de votre terminal.

Le premier script vérifie notamment la migration d’un projet V1, la frappe stable, la sauvegarde au fil de la saisie, les participants, le réordonnement, le choix pour les notes non discutées, la réouverture, la duplication et l’import compatible. Le deuxième vérifie l’impression préparée, un PDF long, la recherche, les sections repliées, les points laissés en attente après une finalisation explicite et les notes retrouvées dans un nouveau contexte navigateur.

La fenêtre native « Enregistrer au format PDF » est remplacée par un témoin lors des tests automatisés : la génération d’un PDF A4 est vérifiée séparément par Chromium. La sélection effective d’un fichier via Microsoft Print to PDF reste une vérification manuelle sur Windows.

`tests/browser/meetings-restart.mjs` utilise un profil temporaire sur disque, ferme réellement Chromium, puis le relance pour vérifier les dernières notes et le projet historique. Il se lance avec les mêmes variables que les autres scripts.
