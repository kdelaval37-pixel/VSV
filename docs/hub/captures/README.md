# Captures du lot 1 — données fictives uniquement

- `avant.png` : ancien module UI du correctif adhérents (`2cf8763`), navigateur local.
- `apres.png` : nouveau bilan incluant le total des lignes ignorées, même exemple fictif.
- `mobile-sombre.png` : même parcours sur largeur 390 px et préférence sombre simulée.
- `convocation-fictive-a4.pdf` : PDF long généré par le parcours navigateur existant, modèle conservé. Ce n’est pas un PV réel ni un exemple de conformité juridique.

Reproduire les PNG : démarrer le serveur local, puis `node tests/browser/hub-lot1.mjs` avec `VSV_TEST_URL` et `VSV_CAPTURE_DIR` si nécessaire. PDF : `tests/browser/notices.mjs`.
