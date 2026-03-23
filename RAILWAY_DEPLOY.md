# MamanDouce - Déploiement Railway

## 🚀 Étapes de déploiement

### 1. Créer un compte Railway
1. Allez sur **https://railway.app**
2. Cliquez sur "Start a New Project"
3. Connectez-vous avec **GitHub** (recommandé)

### 2. Connecter votre repo GitHub
Si vous n'avez pas encore pushé le code sur GitHub :
1. Créez un nouveau repo sur GitHub (privé recommandé)
2. Utilisez le bouton "Save to GitHub" dans Emergent

### 3. Déployer le Backend
1. Dans Railway, cliquez **"New Project"** → **"Deploy from GitHub repo"**
2. Sélectionnez votre repo
3. Railway détectera automatiquement le backend Python
4. Configurez le **Root Directory** : `/backend`
5. Ajoutez les **variables d'environnement** (voir ci-dessous)

### 4. Ajouter MongoDB
1. Dans votre projet Railway, cliquez **"+ New"** → **"Database"** → **"MongoDB"**
2. Railway créera automatiquement une instance MongoDB
3. Copiez la variable `MONGO_URL` fournie

### 5. Déployer le Frontend
1. Ajoutez un nouveau service : **"+ New"** → **"GitHub Repo"**
2. Configurez le **Root Directory** : `/frontend`
3. Ajoutez les variables d'environnement frontend

---

## 🔐 Variables d'environnement

### Backend (`/backend`)
```
MONGO_URL=<fourni par Railway MongoDB>
DB_NAME=MamanDouce
SECRET_KEY=votre-cle-secrete-tres-longue-et-complexe
RESEND_API_KEY=<votre clé Resend si vous l'avez>
SENDER_EMAIL=noreply@mamandouce.app
VAPID_PRIVATE_KEY=<copier depuis .env actuel>
VAPID_PUBLIC_KEY=<copier depuis .env actuel>
VAPID_CLAIMS_EMAIL=cyrilalepsa@gmail.com
```

### Frontend (`/frontend`)
```
REACT_APP_BACKEND_URL=https://votre-backend.up.railway.app
```

---

## 📁 Fichiers de configuration

### Backend - `Procfile` (déjà créé)
```
web: uvicorn server:app --host 0.0.0.0 --port $PORT
```

### Backend - `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn server:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Frontend - `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "yarn install && yarn build"
  },
  "deploy": {
    "startCommand": "npx serve -s build -l $PORT"
  }
}
```

---

## 🌐 Configuration du domaine personnalisé

1. Dans Railway, allez dans les **Settings** de votre service frontend
2. Cliquez sur **"Generate Domain"** pour obtenir un domaine `.up.railway.app`
3. Pour votre domaine **cycafamily.com** :
   - Ajoutez un **Custom Domain**
   - Configurez les DNS chez votre registrar :
     - Type: `CNAME`
     - Nom: `@` ou `www`
     - Valeur: `<votre-app>.up.railway.app`

---

## ✅ Checklist avant déploiement

- [ ] Code pushé sur GitHub
- [ ] Compte Railway créé
- [ ] Variables d'environnement prêtes
- [ ] Clés VAPID copiées

---

## 💰 Coûts estimés

- **Starter Plan** : 5$/mois (inclut 5$ de crédit)
- **MongoDB** : ~2-3$/mois pour une petite base
- **Total estimé** : ~7-10$/mois

Railway offre aussi un **essai gratuit** avec des limitations.
