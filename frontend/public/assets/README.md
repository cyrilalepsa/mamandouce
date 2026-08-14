# Modèle 3D / images fœtus

## Emplacements locaux (déjà dans le projet)

Dossier : `frontend/public/assets/fetus/` (~48 fichiers)  
Convention : `week-XX.png` (jpeg historiques dédupliqués à l’upload, png prioritaire)

Consommés via `frontend/src/utils/fetusAssets.js` par :
- `Baby3DContainer.jsx`
- `BabyEvolutionWidget.jsx`

URL de livraison **par défaut** : `https://res.cloudinary.com/{cloud}/image/upload/f_auto,q_auto/mamandouce/fetus/{id}`  
Sans cloud name (env ou `GET /api/neriacorp/media`) → fallback `/assets/fetus/…` + `onError`.

## Cloudinary (prod)

1. Injecter `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` dans `backend/.env`.
2. Uploader :
   ```bash
   cd backend
   python scripts/upload_fetus_cloudinary.py --dry-run   # inventaire, sans secrets
   python scripts/upload_fetus_cloudinary.py             # push CDN
   ```
3. Le front hydrate le cloud name via `GET /api/neriacorp/media` (pas de rebuild obligatoire).  
   Option build : `VITE_CLOUDINARY_CLOUD_NAME` dans `frontend/.env`.
