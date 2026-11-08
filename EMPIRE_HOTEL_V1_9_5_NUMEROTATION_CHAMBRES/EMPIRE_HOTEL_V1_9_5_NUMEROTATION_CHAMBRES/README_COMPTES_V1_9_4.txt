EMPIRE HÔTEL V1.9.4 — CORRECTION DE RECONNAISSANCE DES IDENTIFIANTS

Correctifs :
- Les pseudos sont comparés sans tenir compte des majuscules/minuscules ni des espaces périphériques.
- La migration reprend le pseudo enregistré dans chaque fiche utilisateur, même si l'ancienne clé JSON ne correspond pas exactement.
- Recherche élargie des players.json et players.json.bak sur /var/data et dans les anciens dossiers du projet.
- Fusion sans remplacer un compte existant ; les mots de passe hachés, hôtels, banques, prêts et réservations sont conservés.
- Au démarrage, les logs affichent le nombre de comptes chargés, le nombre de fichiers examinés et le nombre de comptes importés.

RENDER :
Root Directory : EMPIRE_HOTEL_V1_9_4_COMPTES_CORRIGES (si ce dossier est bien à la racine du dépôt GitHub)
Build Command : npm install
Start Command : npm start
Persistent Disk Mount Path : /var/data
Environment : EMPIRE_HOTEL_DATA_DIR=/var/data

IMPORTANT : ne supprimez pas le Persistent Disk. Si les anciennes données n'ont jamais été écrites sur le disque persistant et que Render a supprimé l'ancien stockage temporaire, aucun code ne peut recréer les comptes ou retrouver les mots de passe. Dans ce cas, il faut restaurer un ancien players.json ou players.json.bak depuis une copie locale.
