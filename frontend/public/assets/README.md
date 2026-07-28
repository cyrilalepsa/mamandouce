# Modèle 3D / images fœtus

## Emplacements locaux (déjà dans le projet)

Dossier : `frontend/public/assets/fetus/`  
Convention : `week-XX.png` (et variantes jpeg historiques)

Consommés via `frontend/src/utils/fetusAssets.js` par :
- `Baby3DContainer.jsx`
- `BabyEvolutionWidget.jsx`

## Cloudinary (optionnel)

1. Uploader les fichiers locaux :
   ```bash
   cd backend
   # renseigner CLOUDINARY_* dans .env
   python scripts/upload_fetus_cloudinary.py
   ```
2. Côté frontend `.env` :
   ```
   VITE_CLOUDINARY_CLOUD_NAME=votre_cloud
   VITE_CLOUDINARY_FETUS_FOLDER=mamandouce/fetus
   VITE_CLOUDINARY_TRANSFORMS=f_auto,q_auto
   ```
3. Rebuild frontend. Sans cloud name → fallback local automatique.

## Format 3D (optionnel)

Placez votre fichier `.glb` ici sous le nom `bebe.glb` (< 5 MB).  
Sans modèle 3D, l’UI utilise les images semaine + fallback SVG/image.
