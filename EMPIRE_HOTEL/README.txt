EMPIRE HÔTEL — VERSION COMPACTE : 3 FICHIERS

GitHub : décompressez ce ZIP et envoyez ses trois fichiers à la racine du dépôt.
Ne pas envoyer le ZIP lui-même, node_modules, ni les sauvegardes des joueurs.
Render installe automatiquement les dépendances avec npm install.

ATTENTION RENDER : cette version conserve le fonctionnement local du projet fourni
(écoute sur 127.0.0.1:4177 et origines locales uniquement). La réduction de fichiers
ne constitue pas une adaptation à l’hébergement public.


--- IMPORTANT_SAUVEGARDES.txt ---
EMPIRE HOTEL V1.7 - COMPTES PERSISTANTS

Le jeu stocke maintenant ses comptes dans le dossier EMPIRE_HOTEL_SAUVEGARDES, situe A COTE du dossier du jeu.
Exemple : Documents\HOTEL\EMPIRE_HOTEL_SAUVEGARDES\players.json

Lors du premier lancement, le jeu cherche automatiquement les fichiers data\players.json dans les anciennes versions situees dans le meme dossier parent et importe les comptes trouves.
IMPORTANT : si vos anciens dossiers ont ete supprimes avec leurs sauvegardes, il est impossible de recuperer ces comptes sans une copie de sauvegarde.
Pour les prochaines versions, decompressez le ZIP dans le MEME dossier parent (Documents\HOTEL), sans supprimer EMPIRE_HOTEL_SAUVEGARDES.
Pour forcer un emplacement permanent, definissez EMPIRE_HOTEL_DATA_DIR avant npm start.
Les fichiers .bak sont des copies de secours. Sauvegardez regulierement le dossier permanent sur un autre support.
Lancer npm install puis npm start. Adresse : http://localhost:4177


--- LIRE_AVANT_DEMARRER.txt ---
EMPIRE HOTEL V1.2
1) Extraire le ZIP dans un NOUVEAU dossier (ne pas melanger avec NEXORIS).
2) Ouvrir ce dossier dans Visual Studio Code.
3) Dans le terminal : npm install puis npm start
4) Ouvrir http://localhost:4177 (PAS localhost:3000).
Si un ancien jeu s'ouvre sur localhost:3000, c'est un autre serveur deja en marche.
Vous pouvez aussi lancer DEMARRER.bat.
Cette version est locale, le classement mondial n'est pas encore en ligne.


--- README.txt ---
EMPIRE HOTEL V1.4
1. Décompresser dans un NOUVEAU dossier.
2. Ouvrir le dossier dans Visual Studio Code.
3. npm install
4. npm start
5. http://localhost:4177

Les comptes et sauvegardes sont dans data/players.json et data/players.json.bak.
Ne jamais supprimer le dossier data lors des mises à jour.
Le serveur est local (127.0.0.1) et ne permet pas le multijoueur distant.
L'argent et les recettes sont simulés. Premium reste verrouillé sans prestataire de paiement.
Le jour de jeu change à 19h heure de Paris ; les journées manquées sont traitées au prochain lancement.


--- README_BANQUE.txt ---
EMPIRE HÔTEL V1.5 — BANQUE FICTIVE DU JEU\n\nDémarrage : npm install puis npm start ; http://localhost:4177\n\nBanque : comptes entreprise et personnel, virements internes instantanés, historique débit/crédit et solde après chaque opération, export CSV. Aucun transfert bancaire réel.\n\nSauvegardes : conserver le dossier data/ en migrant depuis V1.4. Fermer le serveur avant de copier data/.\n

--- README_DEMARRAGE.txt ---
EMPIRE HOTEL V1.1 - DEMARRAGE

IMPORTANT : Ouvrir dans VS Code le dossier contenant CE fichier et package.json.
Dans le terminal de ce dossier :
  npm install
  npm start

Puis ouvrir http://localhost:3000

Le fichier package.json est directement a la racine du ZIP.
Ne pas lancer npm depuis un ancien dossier NEXORIS.


--- README_PREMIUM.txt ---
EMPIRE HOTEL V1.3 - PORT 4177
Installation : npm install puis npm start
Adresse : http://localhost:4177

Pack Premium : 6,99 EUR / 30 jours sans renouvellement.
Abonnement : 4,99 EUR/mois, engagement minimum 3 mois.
Premium est verrouille : aucun paiement reel ni abonnement n est integre.
Le serveur refuse de sauvegarder une assurance Premium non autorisee.
La reduction des temps de construction attend le systeme de delais de travaux.
Le jeu reste local et ne fournit pas de classement mondial en ligne.


--- README_PRETS.txt ---
EMPIRE HÔTEL V1.6 — PRÊTS AUTOMATIQUES

Lancer dans ce dossier : npm install puis npm start
Ouvrir http://localhost:4177

Prêts fictifs de 1 000 € à 100 M€, durées 6 à 120 mois, taux simulé fixe 6 %/an.
Acceptation automatique si mensualités de tous les prêts <= 50 % du CA mensuel de référence (dernier CA journalier x 30).
Première demande après une clôture de 19h. Capital crédité immédiatement. Remboursement quotidien mensualité/30.
Sauvegarde dans data/players.json. Pour récupérer une partie V1.5, copier son dossier data dans ce dossier avant démarrage.
IMPORTANT : jeu local, aucune opération bancaire réelle.


--- SECURITE.txt ---
EMPIRE HÔTEL V1.8 — SÉCURITÉ APPLICATION LOCALE

Protections ajoutées : limitation de débit (240 requêtes/minute/IP), verrouillage temporaire après 8 échecs de connexion par pseudo et IP (15 minutes), limitation de création de comptes, validation JSON et taille maximale 32 Ko, en-têtes anti-clickjacking et anti-MIME sniffing, politique CSP, contrôle de l’origine des requêtes, expiration des sessions après 24 h. Le serveur écoute uniquement 127.0.0.1:4177.

Les sauvegardes restent dans le dossier EMPIRE_HOTEL_SAUVEGARDES à côté du jeu. Ne le supprimez pas.

Ce module est un pare-feu applicatif basique, pas un pare-feu réseau Windows ni une garantie anti-piratage. Pour rendre le jeu public, utiliser HTTPS, une base de données transactionnelle, de vrais comptes persistants avec sessions stockées côté serveur, journaux d'audit, surveillance et tests de sécurité.

INSTALLATION : npm install puis npm start. Adresse : http://localhost:4177

