# Assemblage OCR N2 → MamanDouce

**Date :** 14 août 2026  
**Statut :** **rebranché dans MamanDouce** — le Noyau N2 n’est pas un dépôt GitHub séparé ; c’est le NoyauNeria **historique de ce repo** (OCR, SSO, Design System 135°).

---

## 1. Référence source = ce repo

Le dépôt donné (`https://github.com/cyrilalepsa/mamandouce.git`) **est** N2. L’extraction `b028216` (*Extraction du NoyauNeria*) a retiré le scanner Intelligence ; les tests (`test_neriacorp_scanner.py`, `test_neriacorp_publish.py`, `test_scanner_ai.py`) et le client `api.scanner.*` sont restés.

Les corrections sont appliquées **ici**, pas dans un checkout externe :

| Module N2 | Fichiers MamanDouce |
|-----------|---------------------|
| OCR Intelligence (5 apps, dont Aevis `#2E8B57`) | `backend/integrations/neriacorp/scanner_adapter.py` + `backend/routes/scanner_ai.py` |
| Publish plug-and-play | `backend/integrations/neriacorp/adapters.py` |
| SSO découverte | `GET /api/neriacorp/sso/status` dans `backend/routes/neriacorp_portal.py` |
| Design System 135° | `frontend/src/styles/glossy/*` + tiroir admin Intelligence |

**Scanner aliment :** Gemini Vision (`GEMINI_API_KEY` + `GEMINI_VISION_MODEL`, défaut `gemini-2.0-flash`) extrait nom / ingrédients / texte d’emballage, puis le moteur local `FOOD_SAFETY_DATABASE` tranche la grossesse. **Aucun OpenAI ni OCR Worker n’est requis.**

---

## 2. Contrat public `/api/scanner/*`

Monté dans `server.py` via `api_router.include_router(scanner_ai_router)`.

```text
POST /api/scanner/analyze            admin — image_base64 | text_input | metadata
POST /api/scanner/analyze-video      admin — UploadFile (MIME vidéo, max 50 MB)
GET  /api/scanner/apps               admin — 5 apps + operation_mode=Admin_Only
GET  /api/scanner/audit              admin
POST /api/scanner/publish            admin — target_app + payload → mock ou live
GET  /api/scanner/publications[/{id}] admin
GET  /api/scanner/categories         user authentifié
POST /api/scanner/analyze-document   user — category ∈ menu|facture|alimentation|…
GET  /api/scanner/history            user
```

`ScanRequest` : au moins un de `image_base64` / `text_input` / `metadata` sinon **400**. Non-admin → **403**.

`ScanResult` : `{ id, metadata, business, display_card, financial, created_at }`.

Publish non configuré (pas de `{APP}_BASE_URL` + `{APP}_API_KEY`) → `published_mock`, `partial: true`, warning avec le nom des env.

---

## 3. Adaptateur scanner (Gemini Vision Aevis)

Seul secret requis : `GEMINI_API_KEY` (+ `GEMINI_VISION_MODEL`, défaut `gemini-2.0-flash`).
`OPENAI_API_KEY` et `N2_OCR_*` ne sont **pas** nécessaires.

| Entrée | Flux |
|--------|------|
| Scanner aliment `analyze_food` | Gemini `extract_product` (nom, ingrédients, texte emballage) → moteur local `FOOD_SAFETY_DATABASE` |
| Image admin `analyze_neriacorp` | Gemini Vision JSON (contrat Intelligence) |
| Texte seul | wrapping local, sans LLM |
| Document `analyze_document` | Gemini Vision + schéma de catégorie |
| Vidéo `analyze_video` | Gemini Vision (`GEMINI_VISION_MODEL`) |

Mongo `scanner_audit` / `scanner_publications` : insert **fail-soft** (pas de 500 si Mongo down).

---

## 4. SSO

`GET /api/neriacorp/sso/status` (public) :

- `sso_enabled` si `NERIACORP_SSO_LOGIN_URL` **et** `NERIACORP_SSO_ISSUER`
- sinon provider `mamandouce-jwt` (login local `/auth`)

Pas de validation JWT OIDC encore — accroche de découverte pour le portail.

---

## 5. UI admin

Tiroir `data-testid="drawer-neriacorp"` → `NeriaCorpScannerTab` (photo / import / vidéo 30s, publish, QR).

---

## 6. Variables

Voir `backend/.env.example` : **scanner** = `GEMINI_API_KEY` + `GEMINI_VISION_MODEL` ; Cloudinary prod = `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` ; `NERIACORP_SSO_*` ; CORS NeriaCorp fusionnés dans `core.config`. `N2_OCR_*` et `OPENAI_API_KEY` restent optionnels (portail / chatbot), jamais requis par le scanner.
