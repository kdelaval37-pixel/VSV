# Enregistrement, apparence personnelle et courriels

## Changements

- Projets, comptes rendus, PV, convocations/invitations, bilans et hub : la saisie programme une sauvegarde après 4 secondes de pause. Le bouton Enregistrer reste immédiat. Le départ vers une autre page attend la sauvegarde utile, et non une requête par caractère. Les opérations de caisse et de stock ne sont pas différées.
- Une nouvelle saisie pendant la réponse du serveur reste marquée non enregistrée ; un ancien accusé de réception ne l’efface pas. Les conflits et opérations incertaines restent contrôlés. Les copies locales sont regroupées après 300 ms de pause ; si leur stockage échoue, l’avertissement existant reste visible.
- Une actualisation Realtime pendant une sauvegarde normale ne doit plus afficher « opération à vérifier ». Les états identiques ne sont pas réécrits sans changement.
- Couleur d’interface, thème et menu isolés par compte dans le navigateur de l’appareil. La couleur commune des PDF reste inchangée. L’apparence n’est pas encore synchronisée entre les appareils d’un même utilisateur.
- Communication : Objet, Projet associé, Expéditeur (adresse réelle de la boîte Google, non usurpable), Membres destinataires, Destinataire supplémentaire, corps pleine largeur et pièces jointes. Gras, italique, souligné, tailles, couleurs, listes, alignement et tableaux. Sélectionner le texte avant de changer sa taille ou sa couleur.
- Le bouton ENVOYER enregistre le brouillon puis envoie directement, sans ouvrir la configuration Google. Les contrôles d’autorisation, la protection contre le double clic, l’identifiant de reprise et l’historique restent actifs. Un résultat incertain ne crée pas une nouvelle demande.
- HTML filtré côté client ET serveur ; mails multipart texte/HTML et pièces jointes. Les anciens messages texte et leurs identifiants restent compatibles.
- Limites conservées : 10 destinataires uniques par demande, 5 pièces jointes, 10 Mo au total (les limites d’import par fichier restent également appliquées). Aucun envoi réel effectué pendant les tests.
- Menu : Accueil, AG, Réunion, Projet, Gestion, Vie associative, Agenda, Tâches et décisions, Communication, Paramètres. Icônes des groupes renforcées et textes d’explication dans Documents et partenaires / Bénévolat et équipes.

## Déploiement officiel : API avant site

Aucune migration SQL ni modification des secrets. Télécharger une sauvegarde avant mise à jour.

Cette branche part du main officiel. Ne pas publier le nouveau site avant l’API : l’ancien serveur ne connaît pas les nouveaux champs de message.

Dans PowerShell, depuis le dossier du dépôt VSV :

```powershell
git fetch origin refs/heads/fix/editor-mail-ergonomics
if ($LASTEXITCODE -eq 0) {
    git switch --detach FETCH_HEAD
    if ($LASTEXITCODE -eq 0) {
        npx.cmd supabase functions deploy vsv-api --project-ref zbbxhhtqcyryabfftbvq --no-verify-jwt
    }
}
```

Attendre `Deployed Functions on project zbbxhhtqcyryabfftbvq: vsv-api`. Ensuite fusionner la PR dans main : Cloudflare construira le site officiel automatiquement (commande npm run build:pages, sortie dist, VSV_BUILD_TARGET=production).

Le serveur mis à jour reste compatible avec l’ancien site entre ces deux étapes. Pour un retour arrière, restaurer l’ancien déploiement Cloudflare en conservant l’API compatible ; les nouveaux champs de brouillons ne doivent pas être retirés de la base.

## Preuves et limites

- `npm test` : suite Node, dont regroupement des frappes, sauvegarde immédiate, préférences séparées, HTML filtré, MIME enrichi et reprise du même envoi.
- `node scripts/test-editor-ergonomics.mjs` sur dist construit : Chromium, admin et adhérent fictifs, 16 destinations du menu pour chaque rôle ; saisie et sauvegarde projet, hub, compte rendu, PV et invitation ; frappe pendant une réponse lente ; envoi direct simulé ; couleur indépendante et réglable par l’adhérent.
- Captures ordinateur/mobile clair/sombre et rapport dans `docs/hub/ergonomie-captures/`.
- Services Auth, Supabase et Gmail simulés. Aucun essai sur les comptes réels, aucune validation de réception Gmail, aucune modification de secrets. Pas de nouvel essai PostgreSQL hébergé, Safari ou appareil physique. Les modules de mise en page PDF ne sont pas modifiés.
