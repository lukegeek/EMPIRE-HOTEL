DÉPLOIEMENT RENDER — EMPIRE HÔTEL V1.9

Paramètres du Web Service :
- Root Directory : laisser vide (package.json et server.js sont à la racine du dépôt)
- Build Command : npm install
- Start Command : npm start
- Runtime : Node

PORT :
Render fournit automatiquement process.env.PORT. Le serveur écoute sur ce port et sur 0.0.0.0.
En local, le port de secours reste 4177.

SAUVEGARDES PERSISTANTES :
Pour ne pas perdre les comptes et les hôtels après un redéploiement :
1. Ajouter un Persistent Disk au service Render.
2. Mount Path : /var/data
3. Ajouter la variable d'environnement :
   EMPIRE_HOTEL_DATA_DIR=/var/data/EMPIRE_HOTEL_SAUVEGARDES

Sans disque persistant (ou base de données externe), les fichiers locaux du serveur Render peuvent être perdus lors d'un redéploiement.
Le disque persistant Render peut nécessiter une offre payante.

Le jeu reste accessible en local avec npm install puis npm start sur http://localhost:4177.
