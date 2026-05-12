# MamanDouce v10.9.0 — QR code partageable NeriaCorp

## ✅ Sessions récentes

### v10.9.0 — QR code publication (11 Fév 2026)
**📲 QR code partageable depuis chaque publication**
- Lib client-side : **qrcode** npm (220×220, error-correction M)
- Nouveau composant `PublicationQRCode.jsx` :
  - Toggle "Afficher le QR partageable" (bouton bg-white/20 dans la display_card)
  - Canvas avec couleur `theme_color` de l'app cible (ex: brun Heritia, vert Aevis…)
  - Affichage de l'ID en font-mono sous le QR
  - **Télécharger PNG** (filename `neriacorp-{pub_id}.png`)
  - **Partager** via Web Share API avec fichier PNG joint (fallback presse-papiers)
- Payload encodé : `{REACT_APP_BACKEND_URL}/api/scanner/publications/{publication_id}`

**🆕 Endpoint backend pour la résolution**
- `GET /api/scanner/publications/{publication_id}` (admin-only)
- Retourne le doc complet enrichi avec `theme_color`
- Cible des QR scannés depuis n'importe quelle app NeriaCorp (les apps doivent forwarder le scan à cet endpoint avec le token admin)
- 404 si ID inconnu, 403 si non-admin

**🧪 Tests manuels OK**
- Resolve admin → 200 avec theme_color enrichi ✅
- Resolve ID inconnu → 404 ✅
- Resolve sans token → 403 ✅
- Frontend : E2E flow scan texte Heritia → click "Valider & Injecter" → publish mock → toggle QR → canvas 220×220 brun #8B4513 affiché ✅

### v10.8.0 — APIs métier plug-and-play NeriaCorp
### v10.7.0 — Orchestration 1-clic + Early-Reject 413
### v10.5-10.6 — NeriaCorp Intelligence + Scanner Vidéo + Refactor

## Architecture actuelle
```
/app/backend/routes/scanner_ai.py
├── POST /api/scanner/analyze
├── POST /api/scanner/analyze-video
├── POST /api/scanner/publish
├── GET  /api/scanner/audit
├── GET  /api/scanner/apps
├── GET  /api/scanner/publications
└── GET  /api/scanner/publications/{id}      (NEW — resolve pour QR)

/app/frontend/src/components/admin/
├── NeriaCorpScannerTab.jsx                  (intègre PublicationQRCode)
└── PublicationQRCode.jsx                    (NEW — QR client-side)
```

## Roadmap restante
- 🟢 P3 : Bouton "Renvoyer" pour resynchroniser les publications mock (suggestion v10.8)
- 🟢 P3 : Export CSV/Excel des audits + publications NeriaCorp
- ⚪ Action utilisateur : ajouter les vraies clés API des 5 apps + Railway + Play Store

*MàJ : 11 Fév 2026*

## ✅ Sessions récentes

### v10.8.0 — APIs métier plug-and-play (11 Fév 2026)
**🔌 Architecture env-driven (1b+2a+3a+4a)**
- Nouveau module `backend/integrations/neriacorp/adapters.py`
- 5 adaptateurs configurables par env vars : `{APP}_BASE_URL` + `{APP}_API_KEY`
- Bascule auto **mock ↔ live** sans toucher au code :
  - Env configurée + appel OK → `published_live`, `partial=false`, `remote_id`
  - Env configurée + erreur réseau → 2 retries backoff exponentiel (0.5s, 1s) puis `published_mock` + `partial=true`
  - Env non configurée → `published_mock` direct + warning
- Contrat API standard : `POST {base_url}/api/neriacorp/inject` avec Bearer auth + headers `X-NeriaCorp-Publication-Id` + `X-NeriaCorp-Admin`
- Timeouts httpx : connect 8s / read 15s
- Documentation : `/app/backend/integrations/neriacorp/README.md`

**🆕 Endpoints/champs**
- `GET /api/scanner/apps` ajoute flag `configured` (boolean) par app
- `POST /api/scanner/publish` enrichi : `status` (live|mock), `partial`, `remote_id`, `configured`, `warning`, `message` localisé
- `GET /api/scanner/publications` inclut désormais `partial`, `remote_id`, `configured`, `error`

**🎨 Frontend**
- `handlePublish` gère 3 toasts distincts (live succès / mock partiel / mock simple)
- Bannière `publishResult` : `bg-emerald-500/30` (LIVE) vs `bg-white/15` (MOCK) avec libellé clair

**🧪 Tests : iteration_60.json — 22/22 PASS**
- `test_neriacorp_publish.py` (NEW — 8 tests) :
  - configured flag baseline, mock fallback, invalid app 400, non-admin 403
  - **LIVE via mock HTTP server in-process** sur 127.0.0.1:7890 (vérification Bearer + headers + body)
  - Retry fallback sur URL injoignable (≥1.5s elapsed avant fallback)
  - Nouveaux champs publications
- `test_neriacorp_scanner.py` (14 tests régression — toujours PASS)

### v10.7.0 — Orchestration 1-clic + Early-Reject 413
### v10.6.0 — Scanner Vidéo + Refactor barrels
### v10.5.0 — NeriaCorp Intelligence Admin-Only
### v10.1-10.4 — Voir CHANGELOG

## Architecture actuelle
```
/app/backend/
├── routes/scanner_ai.py        (image+vidéo+publish+publications+apps+audit)
└── integrations/
    └── neriacorp/
        ├── __init__.py
        ├── adapters.py         (publish_to_app, get_app_meta, _real_http_call)
        └── README.md           (contrat API + env vars)

/app/backend/tests/
├── test_neriacorp_scanner.py   (14 tests)
└── test_neriacorp_publish.py   (8 tests — NEW)
```

## Pour activer une app en LIVE
Ajouter dans `/app/backend/.env` :
```
{APP}_BASE_URL=https://api.app.com
{APP}_API_KEY=bearer-token
```
Restart backend → publish bascule auto en `published_live`. Aucune config code requise.

## Roadmap restante
- 🟢 P3 : QR code partageable depuis publication_id (suggestion v10.7)
- 🟢 P3 : Export CSV/Excel des audits + publications NeriaCorp
- ⚪ Action utilisateur : déploiement Railway + Play Store

*MàJ : 11 Fév 2026*

## ✅ Sessions récentes

### v10.7.0 — Orchestration 1-clic + Early-Reject (11 Fév 2026)
**🎯 Publication 1-clic vers app cible**
- Nouveau endpoint `POST /api/scanner/publish` (admin-only)
- 5 apps cibles : VisaTrace, Heritia, VeoVision, Vellumia, Aevis (mock pour l'instant)
- Retourne `publication_id` formaté `NC-{app3}-{uuid8}` (ex: `NC-VEL-A82CA01B`)
- Persiste l'audit dans `scanner_publications` avec revenu facturé + statut
- Endpoint `GET /api/scanner/publications` pour le dashboard cumulatif
- Frontend : bouton `main_action` du display_card branche directement vers `handlePublish` → toast succès + référence affichée

**⚡ Optimisation early-reject 413**
- `analyze-video` lit maintenant le header `Content-Length` AVANT toute lecture du flux
- Rejet immédiat si > 50 MB (+1KB tolérance multipart) → 413 en 1.7s sur 53 MB (vs traitement complet avant)
- Fallback in-loop conservé pour les clients qui ne déclarent pas Content-Length

**🧪 Tests**
- `/api/scanner/publish` : 200 (admin Aevis), 400 (app inconnue), 403 (non-admin) ✅
- `/api/scanner/publications` : count + total_revenue + by_target ✅
- `/api/scanner/analyze-video` 53 MB → 413 en 1.7s ✅
- Frontend : E2E click "Valider & Ajouter" → NC-VEL-A82CA01B affiché ✅

### v10.6.0 — Scanner Vidéo + Refactor barrels
### v10.5.0 — NeriaCorp Intelligence Admin-Only
### v10.1-10.4 — Voir historique

## Architecture actuelle
```
/app/backend/routes/scanner_ai.py
├── POST /api/scanner/analyze          (image admin)
├── POST /api/scanner/analyze-video    (Gemini 3.1 Pro, early-reject 413)
├── POST /api/scanner/publish          (orchestration 1-clic mock)
├── GET  /api/scanner/audit            (No-Log, par app)
├── GET  /api/scanner/publications     (par target_app, revenu cumulé)
└── GET  /api/scanner/apps             (5 apps avec theme_color)
```

## Roadmap restante
- 🟢 P3 : Export CSV/Excel des audits NeriaCorp (suggestion v10.5)
- 🟢 P3 : Branchement réel des APIs métier (VisaTrace, Heritia, VeoVision, Vellumia, Aevis) — mock actuel
- ⚪ Action utilisateur : déploiement Railway + Play Store

*MàJ : 11 Fév 2026*

## ✅ Sessions récentes

### v10.6.0 — Scanner IA Vidéo + Refactor scalabilité (11 Fév 2026)
**🎥 Scanner IA Vidéo → Annonce de vente 30s**
- Backend `POST /api/scanner/analyze-video` — multipart upload chunked (1 MB), cap 50 MB
- Modèle **Gemini 3.1 Pro Preview** via `FileContentWithMimeType` (Emergent LLM Key)
- Prompt **NeriaCorp + suffix vidéo** : `display_card.visual_type='REPORT'`, `main_action='Publier l'annonce'`, `business.video_analysis = {duration_seconds, key_moments, detected_objects, suggested_keywords}`
- **No-Log** : fichier temporaire dans `/tmp/neriacorp_video_*` supprimé en `finally`
- Audit garde uniquement source_type='video' + video_size_kb (pas de contenu)
- Frontend : 3e bouton 'Vidéo 30s' dans NeriaCorpScannerTab + barre de progression upload
- Format acceptés : MP4, MOV, WebM, MPEG

**🔧 Refactor NavigationSections.jsx**
- 1110 → **13 lignes** (-99%) via barrel `./navigation/`
- 7 sous-modules extraits :
  - `_shared.jsx` (PASTEL_STYLES, PastelMosaicCard, PastelPillCard, PinnedSectionsProvider, CollapsibleSection)
  - `PreconceptionSection.jsx`, `PregnancySection.jsx`, `BabyPreparationSection.jsx`
  - `PostpartumSection.jsx`, `FaqBabySection.jsx`, `ServicesSection.jsx`, `SolidaritySection.jsx`

**🔧 Refactor DragDropComponents.jsx**
- 727 → **17 lignes** (-98%) via barrel `./dragdrop/`
- 4 sous-modules : DraggableItem.jsx, ItemGroup.jsx, GroupContentPopup.jsx, DropZone.jsx
- + constants.js déjà extrait en v10.2

**🧪 Tests : iteration_59.json — Backend 14/14 + Frontend 100%**
- `/app/backend/tests/test_neriacorp_scanner.py` (TestScannerAnalyzeVideo : 6 nouveaux tests)
- Sample MP4 généré via imageio-ffmpeg (3 KB, 2s blue color)

### v10.5.0 — NeriaCorp Intelligence Admin-Only (11 Fév 2026)
- Scanner IA gaté get_admin_user + prompt strict 5 apps
- PDF Liste de Naissance + fix 401 layout

### v10.4.0 → v10.1.0 — Voir historique versions

## Architecture actuelle
```
/app/backend/routes/
└── scanner_ai.py             (image + vidéo, admin-only)

/app/backend/tests/
└── test_neriacorp_scanner.py (14 tests, 100% PASS)

/app/frontend/src/components/home/
├── NavigationSections.jsx    (13 l. — barrel)
├── DragDropComponents.jsx    (17 l. — barrel)
├── navigation/               (7 fichiers, max 239 l.)
│   ├── _shared.jsx
│   ├── PreconceptionSection.jsx
│   ├── PregnancySection.jsx
│   ├── BabyPreparationSection.jsx
│   ├── PostpartumSection.jsx
│   ├── FaqBabySection.jsx
│   ├── ServicesSection.jsx
│   └── SolidaritySection.jsx
└── dragdrop/                 (5 fichiers, max 538 l.)
    ├── DraggableItem.jsx
    ├── ItemGroup.jsx
    ├── GroupContentPopup.jsx
    ├── DropZone.jsx
    └── constants.js
```

## Roadmap restante
- 🟢 P3 : Optimisation early-reject 413 via header Content-Length sur analyze-video (review comment, non bloquant)
- 🟢 P3 : Export CSV/Excel des audits NeriaCorp (suggestion v10.5)
- ⚪ Action utilisateur : déploiement Railway + Play Store

*MàJ : 11 Fév 2026*
