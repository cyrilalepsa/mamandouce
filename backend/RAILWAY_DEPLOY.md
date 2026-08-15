# MamanDouce - Déploiement Railway

## Configuration Railway

### Variables d'environnement requises :
- `MONGO_URL` : URL de connexion MongoDB
- `DB_NAME` : Nom de la base de données
- `CORS_ORIGINS` / `ALLOWED_ORIGINS` : origines CSV (ex. URL du frontend Railway). Les domaines NeriaCorp, `FRONTEND_URL` et `PUBLIC_APP_URL` sont fusionnés ; `*.up.railway.app` est autorisé par regex.
- `PORT` : Port d'écoute (automatique sur Railway)

### Déploiement
Le déploiement est automatique via GitHub. Railway détecte :
- `/app/backend/railway.json` : Configuration de déploiement
- `/app/backend/Procfile` : Commande de démarrage
- `/app/backend/requirements.txt` : Dépendances Python

### Healthcheck
**DÉSACTIVÉ** pour éviter les timeouts au démarrage.
Railway surveille automatiquement le processus.

### Port
Le serveur écoute sur `0.0.0.0:$PORT` où `$PORT` est fourni par Railway.

### PYTHONPATH
`PYTHONPATH=.` (répertoire `backend/`). Aucun chemin de package local hors arborescence applicative.

### Démarrage simplifié
Les services optionnels (Guardian, Memory Optimizer, Scheduler) sont désactivés au démarrage
pour garantir un lancement rapide et stable sur Railway.

## Tests locaux
```bash
curl http://localhost:8001/api/health
# Devrait retourner: {"status":"ok"}
```

## Logs Railway
En cas de problème, consultez les logs Railway pour :
- ✅ "MamanDouce API startup complete - Railway ready"
- ✅ "MongoDB connection initialized"
