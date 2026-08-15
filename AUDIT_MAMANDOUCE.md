# AUDIT MAMANDOUCE — Rapatriement NeriaCorp & Robustesse

**Date :** 27 juillet 2026  
**Périmètre :** codebase complète (`frontend/`, `backend/`) — audit non-destructif  
**Philosophie :** préservation de la logique métier ; correctifs P0 simples appliqués directement

---

## Synthèse

MamanDouce est **~95 % production-ready** sur le cœur produit (auth JWT serveur, grossesse, food, postpartum, admin, paiements). **Autonomie NeriaCorp : atteinte**. Assets fœtus raccordés Cloudinary (optionnel) + routage OpenAI multi-modèles.

| Axe | Verdict |
|-----|---------|
| Isolation package FE/BE | 🟢 OK (pas d’imports croisés) |
| Autonomie runtime | 🟢 OK — OpenAI SDK + N2-Vault ; pas de package LLM tiers |
| Client API centralisé | 🟢 OK (`VITE_BACKEND_URL`) |
| CDN Cloudinary fœtus | 🟢 Raccordé (`fetusAssets.js` + upload script) — fallback local |
| Routage OpenAI | 🟢 fast=`gpt-4o-mini` / complex+vision=`gpt-4o` + fallback |
| Endpoints `api.neriacorp.com` | 🟡 Non câblé — API via host env |
| Stack NeriaCorp Intelligence | 🔴 Scanner admin absent ; **catalogue B2C portail** ✅ |
| Zone portail | 🟢 **B2C** (`/api/neriacorp/catalog`) |
| Auth / secrets | 🟡 P0 partiels corrigés ; stockage credentials biométrie reste à traiter |

---

## 0. Autonomie repository (NeriaCorp)

**Statut : 🟢 Atteint pour build / run / deploy indépendants.**

| Élément | Action |
|---------|--------|
| Client LLM | `backend/services/llm.py` (OpenAI Async, `OPENAI_API_KEY` uniquement) |
| Scripts / badges tiers | Absents de `index.html` |
| Packages npm tiers non standards | Absents de `package.json` |
| URLs runtime héritées d’un hébergeur tiers | Remplacées par `FRONTEND_URL` / localhost |
| Images tips CDN tiers | `image_url: ""` |
| `.env.example` + README runbook | Ajoutés |

Sans `OPENAI_API_KEY`, le cœur métier démarre ; seules les routes IA dégradent proprement.

---

## 1. Intégration & rapatriement NeriaCorp

### Alignements confirmés
- Frontend Vite + Backend FastAPI séparés ; client unique `frontend/src/utils/api.jsx`.
- Assets runtime (logos, fœtus, icônes) servis depuis `frontend/public/`.
- Capacitor ID cohérent : `com.mamandouce.app`.
- Stubs client `api.scanner.*` prêts pour un éventuel Worker NeriaCorp.

### Écarts
| Point | État |
|-------|------|
| Cloudinary / CDN NeriaCorp | Aucune config — médias locaux |
| `api.neriacorp.com` | Aucune référence |
| `backend/integrations/neriacorp/` | **Absent** (PRD + tests orphelins) |
| `scanner_ai.py` + UI Admin NeriaCorp | **Absents** ; non montés dans `server.py` |
| Domaines fragmentés | 🟡 Residual `.fr` / `.com` dans quelques liens métier |
| Package name | Corrigé → `mamandouce` (était `ton-projet`) |
| `.env.example` | 🟢 Présent (`backend/` + `frontend/`) |
| LLM | 🟢 OpenAI SDK (`services/llm.py`) — `OPENAI_API_KEY` uniquement |

### Variables d’environnement clés
| Variable | Rôle |
|----------|------|
| `VITE_BACKEND_URL` | Base API frontend |
| `MONGO_URL`, `DB_NAME` | Mongo |
| `SECRET_KEY` | JWT (warning si absent) |
| `ADMIN_SECRET`, `ADMIN_EMAIL` | Admin |
| `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` | Paiements |
| `RESEND_API_KEY`, `FRONTEND_URL` | Emails / liens |
| `OPENAI_API_KEY` | Chatbot / traduction / accounting AI |
| `{APP}_BASE_URL` / `{APP}_API_KEY` | Contrat publish NeriaCorp (docs/tests, code absent) |

---

## 2. Modules validés

| Module | Preuve de stabilité |
|--------|---------------------|
| Auth backend JWT + `get_admin_user` | Routes admin protégées côté serveur |
| Client API axios + interceptor 401 | `frontend/src/utils/api.jsx` |
| ErrorBoundary racine | `ErrorBoundary.jsx` + enrobage `App.jsx` |
| AutoRefreshContext | Intervalle + pause visibility + cleanup |
| EmotionalIntelligence | Cleanup confetti / timers |
| OfflineSyncIndicator | Listeners online/offline nettoyés |
| FoodScanner (barcode) | Start/stop scanner au démontage |
| AdminPage | Vérif `me()` serveur + UI accès refusé |
| SharedBirthListPage | Loader + état d’erreur |
| Postpartum pages (chargement) | try/catch + loader systématiques |
| GuardianTab / GuardianStatusIndicator | Polling 60s avec `clearInterval` |
| LanguageBubble | Cleanup click-outside |
| SubscriptionGate (flux) | Loading + try/catch (hors hardcode email) |
| Paiements Stripe checkout / trial | Routes + pages dédiées |
| Home drag-drop / layout persist | Context + API layout |

---

## 3. Correctifs P0 appliqués (cette passe)

| Correctif | Fichier | Impact |
|-----------|---------|--------|
| Typo `VITE_BACKEND_URLL` → `VITE_BACKEND_URL` | `DashboardTab.jsx` | Export CSV stats admin fonctionnel |
| Fusion `api.notifications` (écrasement VAPID) | `api.jsx` | Push subscribe/unsubscribe + notifs in-app cohabitent |
| Export CSV rappels via `Authorization` (plus de token en query) | `RemindersTab.jsx` | Sécurité + export réellement authentifié |
| Cleanup flux caméra au close/unmount | `FoodScannerAI.jsx` | Évite fuite média |
| Bootstrap auth via `api.auth.me()` + cleanup SW listener | `App.jsx` | Token fantôme ne débloque plus les routes |
| Polling paiement cancellable | `SubscriptionSuccess.jsx` | Plus de setState après unmount |
| Suppression fallback Stripe de test | `postpartum.py` | 503 si clé absente |
| Warning si `SECRET_KEY` / `ADMIN_SECRET` absents ; `ADMIN_EMAIL` env | `config.py` | Visibilité config prod |
| Blocage fallback biométrie sans WebAuthn | `biometricAuth.jsx` | Plus de restitution MDP sans challenge |
| Rename package `mamandouce` | `package.json` | Alignement écosystème |

---

## 4. Correctifs prioritaires restants

### P0 — bloquants / attention immédiate

1. **Mots de passe encore en `localStorage` (base64)** — `biometricAuth.jsx`  
   WebAuthn gate renforcé, mais le stockage `btoa({email,password})` demeure.  
   **Action :** migrer vers session opaque / refresh token serveur, ou credential WebAuthn only (sans MDP local).

2. **Stack NeriaCorp Intelligence absente**  
   Tests `test_neriacorp_*.py` + stubs `api.scanner.*` sans routes/UI/adapters.  
   **Action :** restaurer le slice depuis une branche/archive, ou retirer tests/stubs pour éviter la dette fantôme.

3. ~~**Dépendance LLM tierce + URLs héritées**~~ ✅ **Résolu** — OpenAI natif + N2-Vault.  
   ~~**Action :**~~ N/A

4. **Email admin hardcodé côté client**  
   `SubscriptionGate`, `AdminPage`, `HomePage`, `PostpartumPage` — UX only (serveur OK) mais fuit l’identité et couple le privilège.  
   **Action :** s’appuyer uniquement sur `role` / claim JWT renvoyé par `/auth/me`.

5. **CORS `allow_origins=["*"]`** — `server.py`  
   `CORS_ORIGINS` documenté mais non lu.  
   **Action :** brancher la variable d’env et restreindre aux domaines NeriaCorp / MamanDouce.

### P1 — robustesse

| # | Sujet | Fichiers / notes |
|---|-------|------------------|
| 1 | Empty states d’erreur manquants (postpartum / home silencieux) | Pages postpartum, `HomePage.jsx` |
| 2 | Peu d’`AbortController` sur fetchers navigables | Hors `PushNotificationsSection` |
| 3 | Validation mot de passe faible (register / reset min 6) | `RegisterForm`, `schemas.py` |
| 4 | Interceptor 401 n’exclut pas correctement la home | `api.jsx` — session half-broken sur `/` |
| 5 | Domaines OG / SEO | ✅ Migrés vers `https://mamandouce.neriacorp.com` |
| 6 | Dual naming tests `REACT_APP_BACKEND_URL` vs Vite `VITE_*` | `backend/tests/*` |
| 7 | `STRIPE_SECRET_KEY` vs `STRIPE_API_KEY` (Guardian health) | Incohérence naming |
| 8 | `.env.example` | ✅ Ajoutés (`backend/` + `frontend/`) |
| 9 | Données fertilité sensibles en localStorage | XSS → PII santé |
| 10 | `SubscriptionGate` refetch à chaque pathname | Perf navigation |
| 11 | ErrorBoundary unique (pas per-route) | Crash isolé → écran blanc global |
| 12 | Politique CDN Cloudinary à définir | Assets locaux OK court terme |

---

## 5. Performance & mémoire (constat)

| Zone | Statut |
|------|--------|
| AutoRefresh / Emotional / Guardian / OfflineSync | 🟢 Cleanup correct |
| FoodScannerAI caméra | 🟢 Corrigé cette passe |
| SubscriptionSuccess polling | 🟢 Corrigé |
| App SW `message` listener | 🟢 Corrigé |
| TopBar / PWAInstallBanner `appinstalled` | 🟡 Listeners anonymes sans remove |
| `serviceWorkerRegistration` setInterval 5 min | 🟡 Jamais cleared |
| Home dense + drag-drop | 🟡 Surface élevée, non bloquant |
| WebSockets | 🟢 Non utilisés |

---

## 6. Checklist rapatriement NeriaCorp (prochaines étapes)

- [x] Déclarer MamanDouce en **zone B2C** du portail NeriaCorp (`/api/neriacorp/catalog` + `neriacorp-app.json`)
- [ ] Définir `VITE_BACKEND_URL` → Worker `api.neriacorp.com` (ou sous-domaine dédié)
- [x] Créer `.env.example` FE + BE aligné NeriaCorp
- [x] Racorder assets fœtus → Cloudinary (`f_auto,q_auto`) + script upload + fallback local
- [x] Routage OpenAI dynamique (fast / complex / vision + fallback modèle)
- [x] Remplacer `FRONTEND_URL` / liens email / OG tags → `mamandouce.neriacorp.com` / NeriaCorp
- [ ] Restaurer **ou** archiver proprement le module Intelligence Scanner (+ adapters publish)
- [ ] Restreindre CORS ; exiger `SECRET_KEY` / `STRIPE_API_KEY` en prod
- [ ] Éliminer stockage MDP local (biométrie)
- [ ] Brancher privilèges admin uniquement sur claims serveur

---

## 7.bis Assets fœtus & OpenAI (passe inspection 95 %)

### Inspection (existant)
| Brique | Emplacement | État avant |
|--------|-------------|------------|
| Images fœtus locales | `frontend/public/assets/fetus/week-*.png` | ✅ Présentes |
| Mapping semaines | `Baby3DContainer.jsx`, `BabyEvolutionWidget.jsx` | ✅ Dupliqué |
| Pipeline Cloudinary | — | ❌ Absent |
| Service OpenAI | `backend/services/llm.py` | ✅ Présent, mono-modèle |
| Env OpenAI | `OPENAI_CHAT_MODEL`, `OPENAI_VISION_MODEL` | ✅ |

### 5 % raccordés
1. **`frontend/src/utils/fetusAssets.js`** — source unique des emplacements + URL Cloudinary `f_auto,q_auto` (env `VITE_CLOUDINARY_*` publiques uniquement).
2. Composants pregnancy branchés dessus ; `onError` → fallback local.
3. **`backend/scripts/upload_fetus_cloudinary.py`** — upload signé des `week-*` (secrets serveur).
4. **`llm.py`** — `detect_complexity` + `resolve_model` + fallback automatique ; chatbot (auto), accounting (complex), translation (fast), vision food (vision).

### Sécurité secrets (re-scan)
- ❌ Aucune clé Cloudinary / OpenAI dans le bundle client (seulement `VITE_CLOUDINARY_CLOUD_NAME` public).
- 🟡 Biométrie : MDP encore en localStorage (P0 déjà documenté).

---

## 8. Conclusion

Le cœur MamanDouce est **stable pour une mise en prod contrôlée** et **buildable de façon autonome (NeriaCorp)**.  
Cloudinary fœtus et routage OpenAI sont **branchés sur l’existant** ; le scanner Intelligence NeriaCorp reste absente.

**Recommandation :** uploader les assets (`upload_fetus_cloudinary.py`), poser `VITE_CLOUDINARY_CLOUD_NAME` + `OPENAI_API_KEY`, puis traiter les P0 restants (biométrie, CORS prod).
