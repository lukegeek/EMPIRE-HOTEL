EMPIRE HÔTEL V1.9.5 — NUMÉROTATION DES CHAMBRES

- Toutes les chambres possèdent un numéro individuel unique à l'intérieur de chaque hôtel.
- Les chambres existantes des anciennes sauvegardes sont migrées automatiquement à partir du numéro 101.
- Les chambres initiales sont numérotées 101 à 108.
- Toute nouvelle chambre construite reçoit le prochain numéro disponible dans la séquence (109, 110, 111...).
- Le numéro est conservé dans la sauvegarde permanente.
- Une demande PNJ acceptée reçoit un numéro appartenant réellement à l'inventaire de l'hôtel.
- Une chambre déjà réservée sur une période qui chevauche celle d'une nouvelle réservation est exclue.
- Une chambre peut être réattribuée à un autre client uniquement si les dates ne se chevauchent pas.

Déploiement Render : conserver le Persistent Disk et EMPIRE_HOTEL_DATA_DIR.
Root Directory : EMPIRE_HOTEL_V1_9_5_NUMEROTATION_CHAMBRES
Build : npm install
Start : npm start
