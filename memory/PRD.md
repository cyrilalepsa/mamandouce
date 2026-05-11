# MamanDouce v10.6.0 — Scanner Vidéo + Refactor barrels

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
