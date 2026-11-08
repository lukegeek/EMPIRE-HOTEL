EMPIRE HOTEL V1.9.6 — REPARATION CHARGEMENT DES COMPTES

RENDER
Root Directory : EMPIRE_HOTEL_V1_9_6_COMPTES_REPARATION
Build Command : npm install
Start Command : npm start
Persistent Disk Mount Path : /var/data
Environment variable : EMPIRE_HOTEL_DATA_DIR=/var/data

IMPORTANT
- Garder le même Persistent Disk Render. Ne pas le supprimer ni le remplacer.
- Cette version recherche les anciennes sauvegardes players.json et players.json.bak sous /var/data et dans les anciens dossiers du projet, puis fusionne les comptes sans écraser les comptes déjà présents.
- Les logs affichent le nombre de comptes chargés, le nombre de fichiers inspectés et le chemin exact du fichier actif.
- Endpoint diagnostic non sensible : /api/health (nombre de comptes, disponibilité du disque et chemin actif).
- Si /api/health indique accounts: 0 et que les logs ne trouvent aucun fichier players.json, les anciennes données ne sont pas présentes sur le disque monté. Il faut restaurer le fichier players.json ou players.json.bak d'origine ; le programme ne peut pas recréer un mot de passe perdu.

Cette version conserve les fonctionnalités de la V1.9.5, notamment les réservations PNJ et la numérotation des chambres.
