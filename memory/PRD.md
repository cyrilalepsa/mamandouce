# MamanDouce v10.7.0 — Orchestration NeriaCorp + Early-Reject 413

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
