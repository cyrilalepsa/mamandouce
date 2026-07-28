# MamanDouce

Application de suivi de grossesse — autonome, sans dépendance Emergent.

## Stack

| Couche | Techno |
|--------|--------|
| Frontend | React 19 + Vite + Capacitor |
| Backend | FastAPI + MongoDB + Uvicorn |
| IA (optionnel) | OpenAI SDK officiel (`OPENAI_API_KEY`) |
| Paiements (optionnel) | Stripe |
| Email (optionnel) | Resend |

## Prérequis

- Node.js ≥ 22.12
- Python ≥ 3.11
- MongoDB local ou distant

## Démarrage local (100 % autonome)

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # ou cp .env.example .env
# Éditer .env : MONGO_URL, SECRET_KEY, éventuellement OPENAI_API_KEY

uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

API docs : http://localhost:8000/api/docs

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env   # ou cp .env.example .env
# Vérifier VITE_BACKEND_URL=http://localhost:8000

npm run dev
```

App : http://localhost:5173

### 3. Build production frontend

```bash
cd frontend
npm run build
npm start   # sert le dossier dist
```

### 4. Déploiement backend (Railway / tout host Python)

```bash
cd backend
# Variables d'environnement = contenu de .env.example (prod)
# Procfile : web: uvicorn server:app --host 0.0.0.0 --port $PORT
```

Voir aussi `backend/RAILWAY_DEPLOY.md`.

## Variables importantes

| Variable | Où | Rôle |
|----------|----|------|
| `VITE_BACKEND_URL` | frontend | Base URL API |
| `MONGO_URL` / `DB_NAME` | backend | MongoDB |
| `SECRET_KEY` | backend | JWT |
| `FRONTEND_URL` | backend | Liens emails / reset |
| `CORS_ORIGINS` | backend | Origines autorisées |
| `OPENAI_API_KEY` | backend | Chatbot, scanner food, traduction, accounting AI |

Sans `OPENAI_API_KEY`, le cœur de l’app fonctionne ; seules les routes IA renvoient 503 / fallback.

## Autonomie

- Aucun package `emergentintegrations`
- Aucun script / badge / CDN `assets.emergent.sh`
- Aucune URL runtime `*.emergentagent.com`
- `pip install -r requirements.txt` et `npm install` suffisent (PyPI + npm publics)

## Licence / marque

MamanDouce — écosystème **NeriaCorp**, zone portail **B2C**.

Voir `backend/integrations/neriacorp/README.md` pour l’intégration catalogue portail
(`GET /api/neriacorp/catalog`).
