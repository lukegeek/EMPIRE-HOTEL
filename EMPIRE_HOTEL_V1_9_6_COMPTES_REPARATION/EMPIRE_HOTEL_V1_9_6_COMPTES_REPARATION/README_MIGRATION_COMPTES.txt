CORRECTION V1.9 — RÉCUPÉRATION DES COMPTES EXISTANTS

Le serveur recherche maintenant les anciennes sauvegardes même si un nouveau
players.json vide existe déjà. Il fusionne les comptes sans écraser les comptes
présents et conserve les mots de passe hachés existants.

Emplacements recherchés notamment :
- /var/data/players.json
- /var/data/EMPIRE_HOTEL_SAUVEGARDES/players.json
- le dossier data/ du projet
- les dossiers de sauvegarde et anciennes versions voisines

Render :
- Root Directory : EMPIRE_HOTEL_V1_9_1RENDER_EACCES_CORRIGE (si package.json est dedans)
- Build Command : npm install
- Start Command : npm start
- Persistent Disk Mount Path : /var/data
- Environment Variable : EMPIRE_HOTEL_DATA_DIR=/var/data

IMPORTANT : la migration ne peut récupérer que des fichiers réellement présents
sur le disque persistant ou dans le dépôt/ancien dossier encore accessible.
Si les anciens comptes n'ont jamais été écrits sur un disque persistant et que
Render a détruit l'ancien système de fichiers éphémère, il faudra restaurer
players.json depuis une copie locale/backup. Ne supprimez pas le disque Render.
