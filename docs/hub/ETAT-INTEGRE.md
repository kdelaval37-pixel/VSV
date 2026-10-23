# État de la version intégrée VSV-TEST

Cette livraison reste sur `feature/hub-associatif-test`. Elle n’est pas une installation vérifiée sur VSV-TEST tant que les accès et la procédure globale n’ont pas permis un déploiement réel. Aucune production modifiée.

## Fonctions utilisables dans le code intégré

| Domaine | État et périmètre |
| --- | --- |
| Modules existants | Projets/critères, réunions, convocations, PV, bilans, répertoires, courses/fournisseurs/bons, stocks et caisse conservés. Formats anciens importables. |
| Navigation | Liens stables vers documents et dossiers ; recherche globale sur les données autorisées reçues du serveur ; favoris, récents et raccourcis de compte ; menu masquable/mobile conservé. |
| Collaboration | Comparaison par champs, nouvelle version signalée sans remplacer la frappe, copie conservée, rechargement du bon document ; indicateur de présence sur canal privé. Pas de fusion automatique générale. |
| Dossier projet | Liens explicites vers documents, tâches/suivi, achats et sessions ; commentaires ; prochaine édition conservant les besoins mais pas ventes, paiements ou réalisations. La liaison ne duplique aucun montant. |
| Agenda | Liste/calendrier mensuel ; événements manuels, dates des documents, échéances et retours prévus ; journées entières, Europe/Paris, export ICS avec fuseau et changement de mois/année. |
| Tâches et décisions | Création/modification/état/responsable/échéance ; reprise idempotente des lignes d’action de comptes rendus ; sélection des actions à suivre dans une prochaine réunion, sans inventer de discussions. |
| Bénévolat | Équipes, membres multiples, disponibilités/compétences volontaires, créneaux/postes/consignes, chevauchements signalés, inscription/désinscription, missions via liaison personnelle explicite à l’annuaire, temps bénévole facultatif. Aucun rôle technique accordé. |
| Bibliothèque / partenaires | Classement/recherche, échéances, fichiers privés, statuts et nouvelle version d’un document validé ; partenaires liés au projet. Confidentialité « association » ou « administrateurs techniques » appliquée aux données et fichiers. Pas de partage arbitraire par sous-groupe dans cette version. |
| Courses et frais | Prise en charge nominative depuis une ligne, justificatif privé/photo réduite, lien projet/fournisseur ; suivi manuel d’avances/remboursements. Ce suivi n’est pas une écriture de comptabilité officielle ni une dépense ajoutée automatiquement au bilan. |
| Stocks | Code-barres/QR comme référence textuelle, recherche et scan caméra lorsque le navigateur le permet, alternative clavier ; seuils d’alerte ; périodes des réservations et retours prévus tracés. Les réservations restent **conservatrices** et ne se libèrent pas automatiquement à une date passée. Les disponibilités datées ne permettent pas de compter sur un retour futur non confirmé pour prêter la même unité plusieurs fois. |
| Caisse | Fonctions existantes, idempotence/concurrence/stock vérifiés ; sandwich sans décompte et sans déduction inventée d’ingrédients ; transferts, remboursements, attentes et clôture préservés. Connexion nécessaire pour valider. |
| Invitations/réponses | Liens individuels opaques à expiration, révocation, lecture sans mutation, confirmation explicite, réponse modifiable et idempotente. Réponses manuelles également liées aux invitations. Jamais assimilées à une présence, un pouvoir ou un vote. |
| Communication | Préparation depuis un document ou en saisie directe ; membres multiples et adresses externes ; aperçu ; Gmail OAuth côté serveur, compte vérifié, tokens chiffrés, autorisation cumulable d’envoi, destinataires TEST autorisés, envois individuels, fichier privé joint, signature, personnalisation explicite `{{nom}}`, historique et reprise des échecs certains. Résultat incertain jamais renvoyé aveuglément. **Configuration et test réel Google requis.** |
| Paheko | Import CSV éprouvé et adaptateur serveur de lecture d’un export CSV de TEST vérifié avec aperçu/confirmation ; jamais d’écriture en retour. **URL, version et authentification de test à obtenir.** Pas d’API native universelle ou de pagination prétendue sans documentation de l’instance. |
| Administration | Accès existants conservés, droit d’envoi distinct, diagnostic sans secrets, vérification/déconnexion OAuth, import/rapports, effacement volontaire de sa copie locale. |
| Sauvegardes | V12, rétrocompatibilité, nouveaux enregistrements et fichiers accessibles ; historique des communications exporté pour administrateur, restauration comme archives inertes ; secrets et liens publics actifs non exportés. Aucun envoi, réception, vente ou mouvement rejoué. |
| Apparence | Interface écran modernisée (contrôles, espaces, typo, navigation, focus), palette VSV configurable, clair/sombre, mobile. Modèles PDF et style d’impression existants inchangés. |

## Réserves et fonctions non activées

- Aucun accès authentifié aux services hébergés pour déployer/vérifier depuis cet environnement. Les quatre essais hébergés du lot 1 rapportés par l’utilisateur restent les seuls acquis.
- Google/Paheko : les simulations ne prouvent pas une connexion réelle. Réglages regroupés dans LIVRAISON-GLOBALE.md. Aucun message réel envoyé et aucune lecture du Paheko réel.
- Programmation automatique des synchronisations, rappels par notification/e-mail, envois programmés et synchronisation Google Calendar non activés avant validation réelle des connecteurs. Les rappels actuels sont des échéances visibles, pas des notifications envoyées.
- Hors connexion : brouillons et copies de travail existants ; aucune promesse de consultation complète hors connexion ni caisse partagée hors ligne. Révocation et changement de compte restent soumis aux contrôles serveur. Sur appareil partagé, télécharger puis effacer volontairement sa copie locale si nécessaire.
- Le scan caméra et Safari/iPhone/Android physiques restent à essayer. Les tests Chromium à taille mobile ne remplacent pas ces essais.
- Pas de certification juridique des AG ni de certification de caisse. Les réserves des statuts (secondes convocations / AG mixtes) restent présentes.
- Les objets validés de bibliothèque sont immuables ; une correction crée une nouvelle version. L’archivage/correction ne prétend pas apporter une signature électronique certifiée.
- La restauration d’un historique de mails ne relance pas une file et ne reconstitue pas des liens RSVP actifs : ceux-ci se régénèrent explicitement. Les connexions OAuth se reconfigurent de façon sécurisée sur une autre installation.

## Livrer sans multiplier les interventions

Le guide unique est [LIVRAISON-GLOBALE.md](LIVRAISON-GLOBALE.md) : préparation, une mise à jour SQL groupée, un redéploiement API et un site. Il contient un seul parcours utilisateur d’environ 18 minutes et les accès externes regroupés. Aucun lot interne ne nécessite une installation séparée.

## Validation enregistrée

187 tests Node réussis ; six migrations groupées exécutées deux fois sur PostgreSQL 17 jetable ; suite navigateur intégrée réussie, y compris restauration V12 et téléchargements réels depuis le Storage simulé. OAuth Google et source Paheko testés avec transports simulés uniquement. Contrôle Deno et construction TEST réussis. Le suivi détaillé et les captures sont dans SUIVI.md et integration-captures/. Aucun nouveau test hébergé annoncé.
