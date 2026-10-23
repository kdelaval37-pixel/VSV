# Comparaison fictive du lot 2

- `avant/conflit-bureau.png`, `avant/conflit-mobile-sombre.png` : ancien module Auth/UI de `ecdc566`, intercepté uniquement dans Chromium local.
- `apres/conflit-bureau.png`, `apres/conflit-mobile-sombre.png` : comparaison par champ du lot 2, mêmes données fictives et dimensions.

Reproduction : `VSV_CAPTURE_DIR` avec `npm run test:shared:browser`. Pour l’ancien rendu seulement, ajouter `VSV_CAPTURE_BASELINE=1`. Auth, API et Realtime simulés ; aucune capture de production. Les modèles PDF ne sont pas modifiés.
