# MamanDouce v10.5.0 — NeriaCorp Intelligence (Admin-Only)

## ✅ Sessions récentes

### v10.5.0 — Isolation Scanner IA Admin + PDF Liste de Naissance (11 Fév 2026)
**🧠 NeriaCorp Intelligence (refonte complète du Scanner IA)**
- Backend `/api/scanner/analyze` — **GATÉ admin-only** via `Depends(get_admin_user)`
- Nouveau prompt strict **"NeriaCorp Intelligence"** : détecte 5 apps (VisaTrace #1A5CAD, Heritia #8B4513, VeoVision #000000, Vellumia #D4AF37, Aevis #2E8B57)
- 4 sections JSON : metadata (source_app, confidence_score, operation_mode='Admin_Only'), business (modules métier dynamiques), display_card (title/summary/main_action/theme_color/visual_type LIST|GRID|REPORT), financial (estimated_revenue/currency)
- **No-Log policy** : audit ne persiste QUE admin_id, source_app, confidence, revenu — pas le contenu métier ni les images
- Routes : `/api/scanner/analyze`, `/api/scanner/apps`, `/api/scanner/audit`
- Frontend : nouveau composant `NeriaCorpScannerTab.jsx` dans `/admin` (5e tiroir doré "🧠 NeriaCorp Intelligence")
- Rendu dynamique selon `visual_type` (LIST | GRID | REPORT) avec `theme_color` du frontend
- **Public `/scanner-ai` SUPPRIMÉ** (route + tile Services + dragdrop entries)

**📄 Export PDF Liste de Naissance**
- `pages/birthlist/birthListPdf.js` — catalogue jsPDF
- Bouton "Télécharger en PDF (catalogue)" rose bonbon dans onglet Ma Liste (data-testid='export-pdf-birthlist-btn')
- Format : en-tête rose MamanDouce, catégories couleur cyclées (Jaune→Bleu→Rouge→Vert→Violet), articles avec ♥ et étoile "Essentiel", footer "Partagez votre liste avec votre famille"
- Validé : PDF 13.6 KB, 3 catégories, 4 articles, footer correct (Gemini analysis 95% confidence)

**🐛 Fix 401 'Erreur chargement layout'**
- `HomeLayoutContext.js` : vérifie présence du token avant `loadLayout()` + silence 401 silencieux dans le catch

**🧪 Tests : iteration_58.json — Backend 8/8 + Frontend 100%, 0 régression**
- `/app/backend/tests/test_neriacorp_scanner.py` (nouveau)

### v10.4.0 — Scanner IA + UI fixes (11 Fév 2026)
- Refonte rose bonbon, TrackingPage containers unifiés, contours postpartum, Fête du jour + SA badge
- Scanner IA public (remplacé en v10.5 par NeriaCorp admin-only)

### v10.3.0 — Export PDF Bilan cycle
### v10.2.0 — Refactor scalabilité (CycleTrackingPage, DragDropComponents)
### v10.1.0 — Birth List + DPA

## Architecture actuelle
```
/app/backend/routes/
└── scanner_ai.py             (NeriaCorp Intelligence, admin-only)

/app/backend/tests/
├── test_neriacorp_scanner.py (NEW v10.5 — 8/8 PASS)
└── test_scanner_ai.py        (legacy — backup)

/app/frontend/src/
├── pages/
│   ├── AdminPage.js          (5e drawer "neriacorp" doré)
│   ├── BirthListPage.js      (bouton PDF dans Ma Liste)
│   └── birthlist/
│       └── birthListPdf.js   (NEW)
├── components/
│   ├── admin/
│   │   └── NeriaCorpScannerTab.jsx (NEW — dynamic UI selon visual_type)
│   └── cycle/                (depuis v10.2)
└── contexts/
    └── HomeLayoutContext.js  (401 silencieux + check token avant fetch)
```

## Apps NeriaCorp détectables
| App        | Theme color | Pack price | Modules métier                                                |
|------------|-------------|------------|----------------------------------------------------------------|
| VisaTrace  | #1A5CAD     | 29.99 €    | profile_detected, social_inventory, risk_assessment, billing |
| Heritia    | #8B4513     | 60.00 €    | inventory_update, recipe_hook, club_status                    |
| VeoVision  | #000000     | 40.00 €    | authenticity_report, multi_diffusion_ads, ad_status           |
| Vellumia   | #D4AF37     | 60.00 €    | artistic_analysis, scene_breakdown, premium_options           |
| Aevis      | #2E8B57     | 40.00 €    | pos_items, pos_layout                                          |

## Roadmap restante
- 🟡 P2 : Refactor `NavigationSections.jsx` (1109 lignes — déferé v10.6)
- 🟡 P2 : Split `DragDropComponents.jsx` (727 lignes)
- 🟡 P1 : **Scanner IA Vidéo → Annonce de vente 30s** (Gemini 3 Pro multimodal) — promis
- ⚪ Action utilisateur : déploiement Railway + Play Store

*MàJ : 11 Fév 2026*
