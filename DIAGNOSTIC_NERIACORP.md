# Diagnostic MamanDouce — rattachement NeriaCorp

**Date :** 14 août 2026  
**Branche :** `cursor/diagnostic-neriacorp-009d`  
**Périmètre :** codebase complète + rebranchement Noyau N2 **dans** MamanDouce (OCR, SSO, 135°)

> **Mise à jour (même jour) :** le Noyau N2 n’est pas un dépôt externe — c’est le NoyauNeria historique de `mamandouce`. Les routes `/api/scanner/*`, les adapters publish, le SSO `GET /api/neriacorp/sso/status` et le tiroir admin Intelligence sont **restaurés** (sans Emergent). Voir `docs/OCR_N2_ASSEMBLAGE.md`.

---

## 1. Résumé de l’état du projet

| Axe | Estimation | Commentaire |
|-----|------------|-------------|
| Cœur produit B2C (auth, grossesse, food, postpartum, admin, paiements) | **~90 %** | Large surface fonctionnelle, 63 pages, 233 routes API |
| Thème UI (glassmorphism + dégradé 135°) | **~70 %** | Système CSS 135° en place ; nombreux inline 145°/160° |
| Catalogue portail NeriaCorp (zone B2C) | **~80 %** | Catalogue + capabilities `ocr-scanner`/`sso` ; SSO découverte (JWT local tant que issuer absent) |
| Médias Cloudinary | **~40 %** | Pipeline code prêt, **non activé** (env absentes) |
| NeriaCorp Intelligence (scanner / publish / 5 apps) | **~85 %** | Routes + adapters + UI admin restaurés ; Worker `N2_OCR_BASE_URL` optionnel |
| Tests / CI / secrets | **~25 %** | 354 tests HTTP collectés ; pytest hors `requirements.txt` ; pas de `.env.example` versionné |
| **Global — rattachement définitif NeriaCorp** | **~72 %** | Produit mature, accroches écosystème incomplètes |

**Verdict :** MamanDouce est **production-ready sur le métier grossesse**, autonome hors Emergent, déjà déclarée en **zone B2C**. Elle n’est **pas encore branchée** au noyau NeriaCorp (identité, Worker `api.neriacorp.com`, CDN Cloudinary live, Intelligence Scanner).

---

## 2. Bilan technique & architecture actuelle

### 2.1 Stack

| Couche | Techno | Version / notes |
|--------|--------|-----------------|
| Frontend | React 19 + Vite 8 + Tailwind 3 + Capacitor 5 | package `mamandouce` 0.1.0 — **pas de suite de tests FE** |
| Backend | FastAPI 0.110 + Uvicorn + Motor/MongoDB | API `2.1.0`, 233 endpoints OpenAPI |
| IA | OpenAI SDK (`gpt-4o-mini` / `gpt-4o`) | Fallback `EMERGENT_LLM_KEY` legacy |
| Paiements | Stripe | Clé `STRIPE_API_KEY` (Guardian lit aussi `STRIPE_SECRET_KEY`) |
| Email | Resend | |
| Push | VAPID / pywebpush | |
| PWA / mobile | `manifest.json`, SW, Capacitor Android `com.mamandouce.app` | |
| Déploiement | Railway (`backend/Procfile`, `railway.json`) | Healthcheck Railway documenté comme désactivé |

### 2.2 Dossiers / modules principaux

```
mamandouce/
├── frontend/
│   ├── src/pages/          63 écrans (2 orphelins : OnboardingPage, EmbryoTracker)
│   ├── src/components/     admin, auth, babynames, cycle, food, home, postpartum,
│   │                       pregnancy, profile, settings, solidarity, ui (shadcn)
│   ├── src/styles/glossy/  thème nacre + glassmorphism 135°
│   ├── src/utils/          api.jsx, fetusAssets.js, currency.jsx (N20), biometricAuth.jsx
│   ├── public/             neriacorp-app.json, assets fœtus (48 fichiers), icône N20
│   └── android/            projet Capacitor
├── backend/
│   ├── server.py           montage des routers (+ catalogue NeriaCorp)
│   ├── routes/             24 modules métier (auth, pregnancy, food, medical, …)
│   ├── services/           llm, food_scanner_ai, guardian_agent, cycle_intelligence
│   ├── integrations/neriacorp/   catalog.py uniquement (pas d’adapters.py)
│   ├── core/               config, database, security, scheduler
│   ├── scripts/            upload_fetus_cloudinary.py
│   └── tests/              30 fichiers, 354 tests HTTP (live localhost:8000)
├── AUDIT_MAMANDOUCE.md     audit 27 juillet 2026 (toujours largement valide)
└── memory/PRD.md           historique v10.x — décrit un scanner Intelligence ABSENT du code
```

**Routers backend montés :** auth, pregnancy, food, medical, birth_list, admin, contact, push, payments, tips, postpartum, referral, preferences, chatbot, favorites, name_stats, translation, user_layout, guardian, solidarity, contributions, accounting, emotional, tirelire, babynames, **neriacorp_portal**.

**Non monté (pourtant documenté / stubbé) :** `routes/scanner_ai.py` — **fichier inexistant**.

### 2.3 Dépendances majeures

**Frontend :** axios, react-router-dom 7, i18next (fr/en/es/de/it/pt), framer-motion, html5-qrcode, jspdf, html2canvas, qrcode, leaflet, recharts, Radix/shadcn, Capacitor Android.

**Backend :** fastapi, motor/pymongo, python-jose, passlib/bcrypt, openai, stripe, resend, pillow, reportlab, google-genai (présent dans `requirements.txt` mais **non utilisé** par le LLM actuel qui est OpenAI), pywebpush, APScheduler.

**Écarts packages :**
- `pytest` / `requests` **absents** de `requirements.txt` alors que toute la suite en dépend.
- SDK Python `cloudinary` absent (l’upload passe par HTTP signé via `requests` — OK).
- Pas de `vitest` / `jest` / Playwright dans `package.json`.

### 2.4 Cloudinary — état réel

| Brique | État |
|--------|------|
| Lecteur FE `frontend/src/utils/fetusAssets.js` | Code prêt : URL `res.cloudinary.com/{cloud}/image/upload/f_auto,q_auto/...` |
| Fallback local | **Actif par défaut** (48 images dans `public/assets/fetus/`, mix jpeg/png) |
| Script upload `backend/scripts/upload_fetus_cloudinary.py` | Présent, secrets serveur uniquement |
| `VITE_CLOUDINARY_CLOUD_NAME` | **Non défini** dans cet environnement → CDN **non utilisé** |
| `CLOUDINARY_API_KEY` / `SECRET` | **Absents** |
| Usage hors fœtus (avatars, cartes, icônes, uploads user) | **Non câblé** — stockage local / inline |

Cloudinary est un **raccord optionnel fœtus**, pas encore le CDN média NeriaCorp de l’application.

### 2.5 Accroches NeriaCorp — ce qui existe vs ce qui manque

**Présent**
- Manifeste statique `frontend/public/neriacorp-app.json` (slug `mamandouce`, zone `B2C`, theme `#ec4899`).
- API `GET /api/neriacorp/catalog` et `GET /api/neriacorp/app` — **200 OK** vérifié en live.
- Monnaie virtuelle **N20** (`currency.jsx` + `N20Icon` + assets `n20_symbol.png`).
- Capacitor ID `com.mamandouce.app` aligné catalogue.
- Stubs client `api.scanner.*` (analyze, analyze-video, publish, audit, apps).

**Manquant (points d’accroche noyau / portail)**

| Accroche | État |
|----------|------|
| Worker / host `api.neriacorp.com` | Aucune référence runtime ; API via `VITE_BACKEND_URL` seul |
| SSO / identité NeriaCorp (OAuth, JWT partagé, session portail) | **Absent** — auth 100 % locale JWT MamanDouce |
| `integrations/neriacorp/adapters.py` (publish live 5 apps) | **Absent** (`__init__.py` le mentionne encore) |
| Routes `/api/scanner/*` Intelligence | **404** en live |
| UI Admin `NeriaCorpScannerTab` / `drawer-neriacorp` | **Absente** (imports `Brain`/`Image` orphelins dans `AdminPage.jsx`) |
| QR publications inter-apps | Code/PRD historiques, **pas dans le tree** |
| `PUBLIC_API_URL` | Non posé → `urls.api_docs` / `health` / `catalog` du payload = `null` |
| Icône catalogue | Construit depuis `FRONTEND_URL` (défaut localhost en local) |
| Billing catalogue | Toujours `currency: "EUR"` alors que le wallet UI est passé en N20 |

---

## 3. État des fonctionnalités & découpage

### 3.1 Opérationnelles (code + routes + écrans branchés)

| Domaine | Preuve |
|---------|--------|
| Auth JWT, register/login, reset, 2FA, profil | `routes/auth.py`, `AuthPage`, forms |
| Calculateur / roue grossesse, tracking, tips hebdo | pages + `routes/pregnancy.py`, `tips.py` |
| Évolution fœtus (images locales) | `BabyEvolutionPage`, `fetusAssets.js` |
| Scanner aliments (code-barres + vision food) | `/scanner`, `/api/food/scan/*` (403 sans token = route **vivante**) |
| Bibliothèque aliments, favoris, historique | pages + food routes |
| RDV médicaux, rappels, notifications, push | medical + push_notifications |
| Liste de naissance + partage public | BirthList + SharedBirthList |
| Postpartum (arbre complet : rdv, alim, soins, sécu, recettes…) | 12+ pages routées |
| Prénoms, stats, comparateur | BabyNames + name_stats |
| Chatbot IA | ChatbotPage + `routes/chatbot.py` (nécessite `OPENAI_API_KEY`) |
| Cycles / fertilité | CycleTracking, FertilityCalculator |
| Admin (communauté, messages, Stripe, aliments, Guardian, solidarité, Android) | `AdminPage` tiroirs |
| Abonnements Stripe (checkout, success, manage, postpartum) | payments + pages subscription |
| Solidarité, parrainage, trophées, tirelire N20 | pages + routes |
| PWA + Android Capacitor | manifest, SW, `android/` |
| i18n 6 langues | `src/i18n/locales/*` |
| Catalogue portail B2C | `/api/neriacorp/*` **200** |

### 3.2 En cours / partiel

| Sujet | Pourquoi « en cours » |
|-------|----------------------|
| Cloudinary fœtus | Code + script ; env et upload non faits |
| Thème glass 135° | Tokens globaux OK ; cartes métier encore 145°/160° inline |
| N20 | Wallet/UI migrés ; catalogue + Stripe restent en EUR |
| CORS configurable | `CORS_ORIGINS` lu ; défaut localhost, pas les domaines NeriaCorp |
| Biométrie | WebAuthn partiel **+ mot de passe en `localStorage` (base64)** |
| Onboarding / EmbryoTracker | Fichiers présents, **non routés** dans `App.jsx` |
| Guardian health Stripe | Lit `STRIPE_SECRET_KEY` au lieu de `STRIPE_API_KEY` |
| Admin email hardcodé côté client | `cyrilalepsa@gmail.com` dans `AdminPage` (serveur OK via rôle) |

### 3.3 Non démarrées / fantômes (dette PRD)

| Sujet | Signal |
|-------|--------|
| NeriaCorp Intelligence Scanner (image/vidéo) | Tests 14+6, stubs FE, **0 route, 0 UI** |
| Publish plug-and-play (VisaTrace, Heritia, VeoVision, Vellumia, Aevis) | Tests 8, README adapters, **pas d’adapters.py** |
| SSO / session portail NeriaCorp | Aucun code |
| Worker `api.neriacorp.com` | Aucun code |
| Export CSV audits / publications NeriaCorp | Roadmap P3 PRD |
| Tests unitaires frontend | Aucun `*.test.*` / `*.spec.*` |
| CI GitHub Actions | Non observée à la racine |

### 3.4 Composants UI / écrans vs thème (Glassmorphism, 135°)

**Conforme (système)**
- Fond aurore : `linear-gradient(135deg, #7CD6FF → nacre → #FFD1DC)` dans `index.css` + `styles/glossy/_background.css`.
- Cartes glass : `styles/glossy/_glass-cards.css` — `--glass-bg` en **135°**, `backdrop-filter: blur(12px) saturate(180%)`.
- Typo : Nunito (titres) + Quicksand (corps), aligné `design_guidelines.json`.
- Classes `.card-glass-interactive`, nacre bombé, boutons cloud.

**Écarts**
- **~50+ fichiers** avec `linear-gradient(145deg, …)` (admin drawers, drag-drop `constants.jsx` ×54, babynames, postpartum, home popups).
- **~20 fichiers** en `160deg` (FAQ, birth list, parental leave, trophées…).
- Admin : drawers en 145° + fond blanc opaque (`bg-white`), exclus du glass via `_exclusions.css`.
- `design_guidelines.json` parle encore de cartes `bg-white` (pas glass) et Light Mode only — le CSS glass 135° est plus récent que ce fichier.
- Dark mode CSS encore présent dans `App.css` alors que la guideline est « Light Mode Only ».

**Synthèse thème :** le **socle 135° + glass** est posé et s’applique aux cartes testid `section-card` / `item-card`. Une passe de **normalisation des inline styles 145°/160°** reste nécessaire pour un look NeriaCorp homogène.

Contrôles statiques FE (scripts du repo) :
- `check-imports.mjs` : **60/60 OK**, 0 conflit, 0 remnant Emergent.
- Pages orphelines : `OnboardingPage.jsx`, `EmbryoTracker.jsx`.

---

## 4. Diagnostic sécurité & tests

### 4.1 Exécution de la suite (14 août 2026)

| Contrôle | Résultat |
|----------|----------|
| Collecte pytest | **354 tests** collectés (30 fichiers) |
| `pytest` dans `requirements.txt` | **Non** — installé à la main pour ce diagnostic |
| Backend démarré (Uvicorn :8000) | Oui — warning `ADMIN_SECRET` / `STRIPE_API_KEY` manquants |
| `GET /api/health` | **VERT** — `{"status":"ok"}` + 1/1 pytest `TestHealthCheck` **PASS** |
| `GET /api/neriacorp/catalog` + `/app` | **VERT** — HTTP 200 |
| `GET /api/scanner/apps` + `POST /api/scanner/analyze` | **ROUGE** — HTTP **404** (module non monté) |
| `POST /api/food/scan/search` | Route vivante — **403** sans JWT (attendu) |
| Login / reste de la suite (354) | **ROUGE / non exécutable** — MongoDB `127.0.0.1:27017` **connection refused** ; chaque login part en timeout 30 s (`ServerSelectionTimeoutError`) |
| Suite frontend | **Absente** |

**Lecture :** historiquement, `test_reports/iteration_60.json` affichait 22/22 NeriaCorp **PASS** sur une stack Emergent avec scanner monté. **Ce code n’est plus dans le dépôt.** Relancer la suite complète aujourd’hui, même avec Mongo + seed admin, ferait **rougir** `test_neriacorp_scanner.py` (14), `test_neriacorp_publish.py` (8) et `test_scanner_ai.py` (7) = **29 tests garantis ROUGES**.

Les autres ~325 tests sont des **tests d’intégration HTTP** (pas unitaires) : ils exigent Mongo peuplé (`admin@mamandouce.com` / `AdminPremium2024!` — voir `memory/test_credentials.md`) et ne peuvent pas tourner en CI telle quelle.

### 4.2 Variables d’environnement

**Aucun `.env` ni `.env.example` sur disque.** Le README demande `cp .env.example .env` — fichiers **introuvables**. Cause structurelle : `.gitignore` ignore `*.env` **et** `*.env.*` (donc `.env.example`), et le fichier est **pollué** (~2000 lignes, répétitions `-e` / `.env` issues d’un `sed` cassé).

#### Backend — requises / documentées dans le code

| Variable | Rôle | Présente ici | Critique prod |
|----------|------|--------------|---------------|
| `MONGO_URL` | MongoDB | Non (défaut localhost) | **Oui** |
| `DB_NAME` | Base | Non (`test_database`) | **Oui** |
| `SECRET_KEY` | JWT | Non (fallback dev loggué) | **Oui** |
| `ADMIN_SECRET` | Gate admin | Non (fallback `NeriaCorp-admin-dev-only`) | **Oui** |
| `ADMIN_EMAIL` | Admin | Défaut `cyrilalepsa@gmail.com` | Recommandé |
| `FRONTEND_URL` | Liens mail / catalogue | Défaut `http://localhost:5173` | **Oui** |
| `CORS_ORIGINS` | CORS | Défaut localhost Vite | **Oui** (restreindre) |
| `PUBLIC_APP_URL` | URL publique catalogue | Non → fallback FRONTEND_URL | Pour le portail |
| `PUBLIC_API_URL` | Liens health/docs catalogue | Non → `null` dans le JSON | Pour le portail |
| `NERIACORP_PORTAL_STATUS` | `active`/`beta`/`maintenance` | Non (défaut `active`) | Optionnel |
| `NERIACORP_PORTAL_SORT` | Ordre zone B2C | Non (défaut `10`) | Optionnel |
| `STRIPE_API_KEY` | Paiements | **Manquante** (warning startup) | **Oui** si billing |
| `STRIPE_WEBHOOK_SECRET` | Webhooks | Non | **Oui** si billing |
| `STRIPE_PRICE_ANNUAL` / `STRIPE_PRICE_POSTPARTUM` | Price IDs | Placeholders | **Oui** si billing |
| `STRIPE_SECRET_KEY` | Lu **seulement** par Guardian | Non / **nom incohérent** | À unifier |
| `RESEND_API_KEY` / `SENDER_EMAIL` | Emails | Non | Reset password |
| `OPENAI_API_KEY` | Chatbot, food vision, translation | Non | Features IA |
| `OPENAI_CHAT_MODEL` / `VISION` / `COMPLEX` | Routage LLM | Défauts gpt-4o* | Optionnel |
| `VAPID_PUBLIC_KEY` / `PRIVATE_KEY` / `CLAIMS_EMAIL` | Push | Non | Push |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` / `FETUS_FOLDER` | Upload fœtus | **Manquantes** | CDN |
| `{APP}_BASE_URL` / `{APP}_API_KEY` | Publish 5 apps (docs) | N/A — **code absent** | Plus tard |
| `EMERGENT_LLM_KEY` | Alias legacy | Non | À retirer |

#### Frontend

| Variable | Rôle | Présente ici |
|----------|------|--------------|
| `VITE_BACKEND_URL` | Base API | **Absente** (axios cassé sans elle) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Active le CDN fœtus | **Absente** → fallback local |
| `VITE_CLOUDINARY_FETUS_FOLDER` | Défaut `mamandouce/fetus` | Absente (OK défaut) |
| `VITE_CLOUDINARY_TRANSFORMS` | Défaut `f_auto,q_auto` | Absente (OK défaut) |

### 4.3 Sécurité (hors tests)

| Risque | Sévérité | Détail |
|--------|----------|--------|
| Mot de passe en `localStorage` (`btoa({email,password})`) | **P0** | `biometricAuth.jsx` — XSS = vol de credentials |
| `SECRET_KEY` / `ADMIN_SECRET` fallbacks dev | **P0** prod | App démarre quand même |
| CORS `*` possible si mal configuré | **P1** | Géré, mais prod doit lister `mamandouce.app` + portail |
| Email admin hardcodé dans le bundle | **P1** | `AdminPage.jsx` |
| Données fertilité / santé en localStorage | **P1** | PII |
| Validation mot de passe min 6 | **P2** | `schemas.py` / RegisterForm |
| `pytest` credentials commités | **P2** | `memory/test_credentials.md` |
| `.gitignore` hypertrophié | **P2** | Risque d’ignorer `.env.example` ; bruit git |

---

## 5. Écarts / bloqueurs pour le rattachement NeriaCorp

Classés par impact sur l’accroche écosystème (pas sur le métier grossesse).

### Bloquants (P0)

1. **Pas d’identité / SSO NeriaCorp** — l’app est un silo JWT. Un utilisateur portail ne peut pas ouvrir MamanDouce en session unifiée.
2. **API non raccordée au Worker `api.neriacorp.com`** — `VITE_BACKEND_URL` non posé ; catalogue sans `PUBLIC_API_URL` (liens health/docs `null`).
3. **Cloudinary non activé** — médias fœtus 100 % locaux ; pas de politique CDN NeriaCorp pour le reste.
4. **Secrets prod absents** (`SECRET_KEY`, `ADMIN_SECRET`, Stripe, OpenAI, VAPID, Resend, Cloudinary) + **`.env.example` non versionné**.
5. **Dette Intelligence Scanner** — 29 tests + stubs FE pointent vers un module retiré : le portail / les apps sœurs ne peuvent pas injecter/publier.

### Majeurs (P1)

6. CORS prod non borné aux domaines NeriaCorp / `mamandouce.app`.
7. Catalogue : `currency: EUR` vs wallet N20 ; icône/URLs localhost hors env.
8. Biométrie = stockage mot de passe local (incompatible politique sécu groupe).
9. Thème 135°/glass non appliqué uniformément (admin, beaucoup de pages 145°/160°).
10. Suite de tests inutilisable en CI (Mongo + seed + pytest manquant + tests orphelins).

### Mineurs (P2)

11. Pages mortes (`OnboardingPage`, `EmbryoTracker`).
12. `google-genai` dans requirements sans usage LLM (poids Railway).
13. `.gitignore` pollué (~2000 lignes).
14. Healthcheck Railway désactivé (doc).
15. Dual naming `STRIPE_API_KEY` vs `STRIPE_SECRET_KEY`.

---

## 6. Plan d’action (To-Do prioritaire)

### Sprint A — Accroches portail (débloque le rattachement)

- [ ] **A1.** Poser `PUBLIC_APP_URL=https://mamandouce.app` et `PUBLIC_API_URL=https://api.…` (ou Worker NeriaCorp) pour que le catalogue expose health/docs/icon HTTPS.
- [ ] **A2.** Pointer `VITE_BACKEND_URL` vers le host API NeriaCorp / sous-domaine dédié ; documenter le DNS.
- [ ] **A3.** Restreindre `CORS_ORIGINS` à `https://mamandouce.app` + origine portail NeriaCorp.
- [ ] **A4.** Décider **SSO** : OIDC NeriaCorp vs JWT actuel + mapping `sub` ; pas de mot de passe localStorage.
- [ ] **A5.** Aligner manifeste `neriacorp-app.json` et `catalog.py` (N20 vs EUR, version, status).

### Sprint B — Médias Cloudinary

- [ ] **B1.** Créer le cloud / dossier `mamandouce/fetus` côté NeriaCorp.
- [ ] **B2.** Injecter `CLOUDINARY_*` (serveur) + `VITE_CLOUDINARY_CLOUD_NAME` (build).
- [ ] **B3.** Exécuter `python backend/scripts/upload_fetus_cloudinary.py` puis rebuild FE.
- [ ] **B4.** Étendre Cloudinary aux avatars / cartes / uploads (aujourd’hui hors scope).

### Sprint C — Dette Intelligence (trancher)

- [ ] **C1.** **Soit restaurer** `scanner_ai.py` + `adapters.py` + UI admin `drawer-neriacorp` depuis archive/branche.
- [ ] **C2.** **Soit archiver** : supprimer stubs `api.scanner.*`, tests `test_neriacorp_*.py` / `test_scanner_ai.py`, mentions PRD — pour ne plus mentir au CI.
- [ ] **C3.** Si restauration : `{APP}_BASE_URL` / `{APP}_API_KEY` pour les 5 apps sœurs.

### Sprint D — Secrets, env, CI

- [ ] **D1.** Versionner `backend/.env.example` et `frontend/.env.example` (exception gitignore `!.env.example`).
- [ ] **D2.** Exiger `SECRET_KEY` / `ADMIN_SECRET` / `STRIPE_API_KEY` en prod (fail-fast, plus de fallback).
- [ ] **D3.** Unifier `STRIPE_API_KEY` (Guardian).
- [ ] **D4.** Ajouter `pytest` + `requests` + `pillow` dans un `requirements-dev.txt`.
- [ ] **D5.** CI : Mongo service + seed admin + **exclure ou réparer** les 29 tests scanner.
- [ ] **D6.** Nettoyer `.gitignore` (retirer les milliers de lignes `-e`).

### Sprint E — Produit / UI / sécu

- [ ] **E1.** Remplacer `btoa(password)` par WebAuthn-only ou refresh token opaque.
- [ ] **E2.** Admin : privilège **uniquement** via `role` JWT (`/auth/me`), retirer l’email hardcodé.
- [ ] **E3.** Normaliser les dégradés inline **145°/160° → 135°** + classes `.card-glass-interactive`.
- [ ] **E4.** Brancher ou supprimer `OnboardingPage` / `EmbryoTracker`.
- [ ] **E5.** Purger `google-genai` si Gemini n’est pas réintroduit.

### Ordre recommandé

```
D1 (env templates) → A1-A3 (URLs/CORS) → B1-B3 (Cloudinary live)
    → A4 (SSO — décision archi) → C1 ou C2 (trancher Scanner)
    → D2-D5 (secrets + CI) → E1-E3 (sécu + thème)
```

---

## 7. Preuves d’exécution (session diagnostic)

```
pytest --collect-only  →  354 tests collected
GET  /api/health                    200  {"status":"ok"}     VERT
GET  /api/neriacorp/catalog         200                      VERT
GET  /api/neriacorp/app             200                      VERT
GET  /api/scanner/apps              404                      ROUGE
POST /api/scanner/analyze           404                      ROUGE
POST /api/food/scan/search          403 (no JWT)             route OK
TestHealthCheck                     1 passed
Login suite                         Mongo 127.0.0.1:27017 connection refused
node scripts/check-imports.mjs      60/60 OK
```

OpenAPI live : **233** chemins ; seuls raccords NeriaCorp = `/api/neriacorp/catalog` et `/api/neriacorp/app`. Scanner food = `/api/food/scan/*` (métier grossesse, pas Intelligence).

---

## 8. Conclusion

MamanDouce est une **application B2C aboutie** (grossesse, food, postpartum, admin, Stripe, PWA). Le **catalogue portail B2C est câblé et répond**.  

Le rattachement **définitif** au noyau NeriaCorp est bloqué par : absence de SSO, API non exposée sur le Worker écosystème, Cloudinary inactif, module Intelligence fantôme, et secrets/env non industrialisés.

**Recommandation :** traiter le Sprint A+B (portail + CDN) avant toute restauration du scanner ; **trancher C1/C2** pour arrêter de faire échouer 29 tests sur un code qui n’existe plus.
