# VSV-TEST — mise à jour intégrée

Branche unique : `feature/hub-associatif-test`. Production exclue : ne pas fusionner main, ne pas toucher vsv-byl ni le projet `zbbxhhtqcyryabfftbvq`.

## Accès externes regroupés, à régler une seule fois

Aucun secret à envoyer dans la conversation ou à enregistrer dans Git.

| Service | Où agir | Réglage / accès nécessaire |
| --- | --- | --- |
| Supabase TEST | Projet **grgvwyedfrxnwhgdqpoj** | Sauvegarde préalable, SQL Editor, droit de déployer vsv-api. CLI : `supabase login` dans votre terminal. |
| Cloudflare TEST | Projet Pages **vsv-test** | Droit de téléverser le site. CLI facultative : `npx wrangler login`. Vérifier si le projet est en téléversement manuel ou relié à Git ; ne pas modifier le projet de production. |
| Google | Google Cloud Console du compte associatif | Activer Gmail API ; écran de consentement et client OAuth Web. Permissions : `openid`, `email`, `https://www.googleapis.com/auth/gmail.send`, jamais lecture complète de boîte. Déclarer l’adresse de test du compte parmi les testeurs si l’application OAuth est en test. |
| Google OAuth | Client Web > URI de redirection autorisés | **https://grgvwyedfrxnwhgdqpoj.supabase.co/functions/v1/vsv-api?route=google-oauth** exactement. Après configuration, un administrateur utilise « Connecter la boîte Google par OAuth » dans Communication. |
| Secrets Google | Supabase TEST > Edge Functions > Secrets | `VSV_GOOGLE_CLIENT_ID`, `VSV_GOOGLE_CLIENT_SECRET`, `VSV_GMAIL_SENDER`, `VSV_GMAIL_TEST_ALLOWLIST` (adresses de test explicitement autorisées, séparées par virgule), `VSV_CONNECTOR_ENCRYPTION_KEY` (32 octets aléatoires encodés en base64, conserver de façon sécurisée). Les refresh tokens issus d’OAuth sont chiffrés côté serveur ; aucun token Google dans le navigateur. |
| Paheko | Instance **de test**, réglages/version et documentation de cette version | Fournir l’URL et la version ; identifier et vérifier un export CSV en lecture seule. Aucun endpoint API n’est deviné. Aucune lecture du Paheko réel autorisée ici. |
| Secrets Paheko | Supabase TEST > Edge Functions > Secrets | Après vérification du point d’export : `VSV_PAHEKO_TEST_HOST` (nom DNS exact), `VSV_PAHEKO_TEST_CSV_URL` (HTTPS), `VSV_PAHEKO_VERSION`, et si nécessaire `VSV_PAHEKO_TEST_AUTHORIZATION` (valeur d’en-tête conforme à votre instance, uniquement côté serveur). |

Pour générer la clé de chiffrement **dans votre terminal privé** sous PowerShell :

```powershell
$keyBytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($keyBytes)
[Convert]::ToBase64String($keyBytes)
```

Copier le résultat uniquement dans les secrets Supabase TEST et votre gestionnaire sécurisé, jamais dans ce chat ni dans un fichier suivi. Changer/perdre cette clé impose une reconnexion OAuth ; elle ne doit pas être régénérée à chaque déploiement.

Google : le mode OAuth « test » et les quotas Gmail peuvent limiter la durée des autorisations et les volumes. Les exigences de vérification Google dépendent du mode de publication et des scopes ; aucune garantie de gratuité illimitée. Aucune souscription payante n’est activée. Brevo/Supabase Auth restent inchangés.

Le connecteur Paheko livré lit un **export CSV vérifié**, utilise le même assistant et la confirmation existants. Ce n’est pas une prétendue API universelle Paheko. La pagination d’une API native, son identifiant interne immuable et une synchronisation planifiée restent conditionnés à la documentation/version et aux essais de l’instance. Les numéros de membre sont du texte, pas déclarés immuables. Le CSV manuel reste utilisable sans connecteur.

## Une seule mise à jour globale, Windows PowerShell

**Première action :** sauvegarder VSV-TEST et vérifier le nom du projet Supabase `grgvwyedfrxnwhgdqpoj` dans le tableau de bord. Terminer les ventes et préserver les formulaires ouverts avant la mise à jour.

Dans le dossier VSV (Node ≥22) :

```powershell
git fetch origin
git switch feature/hub-associatif-test
git pull --ff-only
npm ci
powershell -ExecutionPolicy Bypass -File scripts/livraison-globale.ps1 Preparer
```

Le script demande seulement la clé **publique publishable du projet TEST** si elle n’est pas déjà dans votre environnement. Il exécute les tests Node, prépare le SQL global et construit le site ciblé TEST. Aucun déploiement à cette étape.

Puis, une seule fois et dans cet ordre :

1. **Base :** ouvrir SQL Editor du projet **grgvwyedfrxnwhgdqpoj**, copier le contenu de `release/vsv-test-mise-a-jour.sql`, exécuter. Le script ne relance pas le socle déjà installé. Il détecte les évolutions déjà installées et s’arrête en cas d’installation partielle au lieu de réinitialiser les données. Les six migrations `202610230001` à `202610230006` sont additives ; aucun nettoyage ni rejeu métier.
2. **API :** après connexion Supabase CLI, exécuter :

   ```powershell
   supabase functions deploy vsv-api --project-ref grgvwyedfrxnwhgdqpoj --no-verify-jwt
   ```

   Conserver `VSV_SITE_URL=https://vsv-test.pages.dev/` et l’origine de test dans `VSV_ALLOWED_ORIGINS`. L’API vérifie les comptes actifs et les droits ; les routes publiques sont limitées aux liens RSVP opaques et au callback OAuth protégé par état/PKCE. Le site test exige les nouvelles migrations avant ce redéploiement.
3. **Site :** téléverser le contenu de `release/vsv-test-site.zip` dans **vsv-test**, comme pour l’installation précédente. Si Pages TEST est relié à Git : framework None, Node ≥22, commande `npm run build:pages`, sortie `dist`, branche `feature/hub-associatif-test` et variables publiques TEST déjà documentées. Ne pas changer main. Avec CLI, après SQL confirmé, `scripts/livraison-globale.ps1 Deployer` effectue API puis Pages ; il peut produire une URL de prévisualisation. Vérifier que **https://vsv-test.pages.dev/** dessert réellement la nouvelle version ; un preview ne prouve pas la mise à jour de l’URL canonique.
4. Fermer/rouvrir VSV-TEST quand le travail en cours est conservé. Il n’y a pas de rechargement forcé pendant une vente.

Les connexions Google/Paheko sont facultatives pour essayer le reste du logiciel. Tant qu’elles ne sont pas configurées, l’interface annonce qu’elles ne sont pas connectées et n’offre pas d’envoi factice. Les destinataires Google restent bornés côté serveur à la liste de test. Aucun message réel n’a été envoyé pendant le développement.

## Un seul parcours d’essai — environ 18 minutes

Utiliser uniquement des données fictives ; vous donnez ensuite votre avis global, pas un rapport bouton par bouton.

1. **3 min — accueil et projet :** rechercher/ouvrir un projet, le mettre en favori, ouvrir son dossier et préparer une prochaine édition. Juger la navigation et le nouveau rendu ; essayer aussi le menu sur téléphone.
2. **3 min — travail partagé :** ouvrir ce projet sur un deuxième appareil. Changer un champ sur B, puis le même champ sur A. Comparer, télécharger la copie puis « Recharger la version partagée » : rester dans ce document.
3. **3 min — organisation :** créer une tâche ou reprendre les actions d’un compte rendu. Ouvrir l’agenda et exporter le mois. Créer un créneau et sélectionner des bénévoles ; déclarer une mission/temps si utile.
4. **3 min — réunion/document :** ouvrir une invitation et créer un lien de réponse pour une personne fictive. L’ouvrir dans un onglet sans compte, confirmer la participation. Vérifier que cela n’ajoute pas de présent. Consulter un document de bibliothèque et son fichier ; l’administrateur peut tester une version confidentielle.
5. **4 min — courses et caisse :** prendre en charge une course, ajouter un justificatif fictif, réceptionner un petit achat puis faire une vente fictive. Tester un sandwich sans stock d’ingrédients, une attente, le récapitulatif et un PDF habituel. Les règles métier existantes ne doivent pas changer.
6. **2 min — préférences et sécurité du travail :** essayer clair/sombre et vos raccourcis, télécharger une sauvegarde. Si Google est configuré et autorisé, prévisualiser un message **vers une adresse de test de la liste autorisée seulement** ; sinon vérifier simplement que l’état « non connecté » est clair.

Safari/iPhone/Android réels, autorisations caméra et services hébergés nécessitent des essais réels : les captures Chromium ne les remplacent pas.

## Retour arrière conservant les données

Conserver sauvegarde et manifest de la version précédente. Restaurer ensemble le précédent site TEST et son code vsv-api si nécessaire. Garder les migrations additives : ne pas supprimer les nouvelles tables, documents, tombstones ou historiques. Les anciennes versions peuvent ignorer les nouveaux objets ; ceux-ci restent dans la base. Les liens RSVP et connecteurs peuvent être indisponibles avec une ancienne API, mais aucun envoi ou mouvement n’est rejoué.

La sauvegarde V12 conserve le hub, les fichiers accessibles (confidentiels pour administrateurs seulement), les données et historiques. Les archives d’envois/réponses se restaurent comme **archives inertes**, pas comme une file à renvoyer ni comme des liens publics actifs. Les secrets OAuth/configuration ne sont jamais exportés : les connexions doivent être reconfigurées après restauration sur une autre installation.

Une publication en production reste une demande distincte : revue du code, inventaire des migrations déjà installées, sauvegarde, essai réel sur TEST et décision explicite. Ne transférer ni données fictives, ni ZIP TEST, ni secrets ou réglages de TEST vers la production.
