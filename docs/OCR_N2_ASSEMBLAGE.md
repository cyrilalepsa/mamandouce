# Assemblage OCR N2 → MamanDouce

**Date :** 14 août 2026  
**Statut N2 :** **non accessible dans cet environnement** — livrable basé sur le contrat historique MamanDouce + les dépôts GitHub visibles.

---

## 1. Chemin exact du module OCR

### Ce qui a été scanné

| Source | Résultat |
|--------|----------|
| Workspace `/workspace` | Uniquement `mamandouce` — **aucun dossier `N2/`, `Core/`, `Shared/`** |
| GitHub token agent | `cyrilalepsa/mamandouce`, `heritia`, `mamandouce_propre` |
| Repos `N2`, `n2`, `aevis`, `avis`, `neriacorp`, `noyau` | **404 / hors scope** (privés ou autre org) |
| Heritia `ScanScreen.jsx` | Stub UI (« Scanner tickets et emballages ») — **pas de backend OCR** |

**Le noyau N2 n’est pas dans le workspace.** Un accès GitHub au dépôt Core/Shared (et idéalement Aevis) est requis pour confirmer le chemin vivant du type `N2/services/ocr_scanner`.

### Module OCR réellement identifié (historique MamanDouce)

Le scanner « Product Recognition / NeriaCorp Intelligence » utilisé pour **Aevis (Avis)**, Heritia, VisaTrace, VeoVision, Vellumia était **embarqué dans MamanDouce**, puis **supprimé** :

| Fichier | Commit | État |
|---------|--------|------|
| `backend/routes/scanner_ai.py` (577 lignes) | supprimé `ac5c004` le **16 mai 2026** | **chemin historique exact** |
| `backend/integrations/neriacorp/adapters.py` | supprimé `f8550c1` | publish plug-and-play, pas l’OCR |

Ce n’était **pas** un `import` depuis N2. C’était un router FastAPI auto-contenu qui appelait **Emergent LLM** :

- Image / texte → `LlmChat.with_model("openai", "gpt-4o")` + `ImageContent`
- Vidéo → `LlmChat.with_model("gemini", "gemini-3.1-pro-preview")` + `FileContentWithMimeType`

**Interface publique (entrée) :**

```text
POST /api/scanner/analyze          → analyze_neriacorp(ScanRequest)
POST /api/scanner/analyze-video    → analyze_video(UploadFile)
GET  /api/scanner/apps
GET  /api/scanner/audit
POST /api/scanner/publish          → adapters.publish_to_app(...)
GET  /api/scanner/publications[/{id}]
```

Fonction Python d’entrée du publish : `publish_to_app(target_app, payload, scan_id, publication_id, admin_email)`.

Aujourd’hui ces routes répondent **404** (fichier absent, router non monté dans `server.py`).

---

## 2. Analyse d’interface (module historique)

### Contrat d’entrée `ScanRequest`

```python
class ScanRequest(BaseModel):
    image_base64: Optional[str] = None   # JPEG/PNG, prefix data: accepté
    text_input: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
# Au moins un des trois requis → sinon 400
```

### Contrat de sortie `ScanResult`

```python
{
  "id": "uuid",
  "metadata": {
    "source_app": "Aevis",           # VisaTrace | Heritia | VeoVision | Vellumia | Aevis
    "confidence_score": 0.92,        # 0.0–1.0
    "operation_mode": "Admin_Only"
  },
  "business": { ... },               # ex. Aevis: pos_items[], pos_layout
  "display_card": {
    "title": "...",
    "summary": "...",
    "main_action": "Valider & Injecter",
    "theme_color": "#2E8B57",
    "visual_type": "LIST" | "GRID" | "REPORT"
  },
  "financial": { "estimated_revenue": 40.0, "currency": "EUR" },
  "created_at": "ISO-8601"
}
```

Gate : `Depends(get_admin_user)` — non-admin → 403.

### Dépendances (historique)

| Lib | Usage |
|-----|--------|
| `emergentintegrations.llm.chat` | **Retirée du projet** (autonomie hors Emergent) |
| `openai` `gpt-4o` | Vision image (à remplacer par `services.llm.chat_vision`) |
| `gemini-3.1-pro-preview` | Vidéo (google-genai déjà dans `requirements.txt`) |
| `httpx` | Publish live vers `{APP}_BASE_URL/api/neriacorp/inject` |
| Mongo `scanner_audit` / `scanner_publications` | Audit No-Log |

### Variables d’environnement (historique)

| Variable | Rôle |
|----------|------|
| `EMERGENT_LLM_KEY` | Ancienne clé unique (à ne plus utiliser) |
| `OPENAI_API_KEY` | Remplaçant actuel (déjà dans `.env.example`) |
| `AEVIS_BASE_URL` + `AEVIS_API_KEY` | Publish live vers Avis/Aevis |
| idem `VISATRACE_*`, `HERITIA_*`, `VEOVISION_*`, `VELLUMIA_*` | 4 autres apps |
| Si N2 est un **service HTTP** | `N2_OCR_BASE_URL` + `N2_OCR_API_KEY` (à poser quand le repo N2 sera lisible) |

---

## 3. Plan d’intégration — adaptateur, pas import direct

**Recommandation : adaptateur** `backend/integrations/neriacorp/scanner_adapter.py`.

Pourquoi **pas** un `import` direct N2 :

1. N2 n’est **pas** dans le même workspace Git (dépôts séparés).
2. Un import chemin (`sys.path.append("../N2")`) casse Railway / CI.
3. L’ancien code Emergent ne doit pas revenir ; l’adaptateur isole N2 **ou** le LLM local.

Quand N2 sera monté, l’adaptateur aura **une** de ces deux implémentations (sans changer les routes) :

| Mode | Quand | Appel |
|------|--------|--------|
| **HTTP noyau** (préféré prod) | N2 exposé en Worker (`api.neriacorp.com/ocr`) | `httpx` POST |
| **Package Python** | N2 publié (`pip install neriacorp-n2`) ou git submodule | `from n2.ocr import analyze` |

Les routes MamanDouce restent le contrat `/api/scanner/*` attendu par `test_neriacorp_scanner.py`.

### Les 3 modifications clés pour tuer les 404

1. **Créer** `backend/integrations/neriacorp/scanner_adapter.py`  
   Point d’entrée unique, ex. `async def analyze_image(image_base64, text_input=None) -> dict` qui délègue à N2 (HTTP) ou, en fallback transitoire, à `services.llm.chat_vision`.

2. **Restaurer** `backend/routes/scanner_ai.py` **sans Emergent** : les handlers `POST /scanner/analyze`, `/scanner/analyze-video`, `GET /scanner/apps`, etc. appellent **uniquement** l’adaptateur + `get_admin_user`. Restaurer `adapters.py` (`publish_to_app`) depuis `f8550c1^`.

3. **Monter le router** dans `backend/server.py` :

```python
from routes.scanner_ai import router as scanner_ai_router
api_router.include_router(scanner_ai_router)
```

Sans le `include_router`, les chemins restent 404 même si le fichier existe.

---

## 4. Exemple d’appel depuis un endpoint FastAPI MamanDouce

Cible une fois N2 exposé en HTTP (forme à caler sur le vrai module) :

```python
# backend/integrations/neriacorp/scanner_adapter.py
import os
import httpx

N2_OCR_BASE_URL = os.environ.get("N2_OCR_BASE_URL", "").rstrip("/")
N2_OCR_API_KEY = os.environ.get("N2_OCR_API_KEY", "")

async def analyze_image(*, image_base64: str | None, text_input: str | None, metadata: dict | None):
    if not N2_OCR_BASE_URL:
        raise RuntimeError("N2_OCR_BASE_URL manquant — noyau OCR non branché")
    async with httpx.AsyncClient(timeout=90.0) as client:
        r = await client.post(
            f"{N2_OCR_BASE_URL}/ocr/analyze",   # chemin N2 à confirmer
            headers={"Authorization": f"Bearer {N2_OCR_API_KEY}"},
            json={
                "image_base64": image_base64,
                "text_input": text_input,
                "metadata": metadata or {"source": "mamandouce"},
            },
        )
        r.raise_for_status()
        return r.json()
```

Branchement route (contrat actuel des tests) :

```python
# backend/routes/scanner_ai.py (extrait)
from integrations.neriacorp.scanner_adapter import analyze_image

@router.post("/scanner/analyze")
async def analyze_neriacorp(payload: ScanRequest, admin: User = Depends(get_admin_user)):
    if not (payload.image_base64 or payload.text_input or payload.metadata):
        raise HTTPException(400, "Aucune entrée")
    parsed = await analyze_image(
        image_base64=payload.image_base64,
        text_input=payload.text_input,
        metadata=payload.metadata,
    )
    # normaliser vers ScanResult (metadata / business / display_card / financial)
    return ScanResult(...)
```

Appel HTTP équivalent (admin JWT) :

```bash
curl -sS -X POST "$API/api/scanner/analyze" \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"image_base64":"<jpeg-b64>","text_input":null}'
```

---

## 5. Checklist pré-requis (requirements.txt / .env)

### `backend/requirements.txt`

Déjà présents : `openai`, `httpx`, `pillow`, `google-genai`.  
À **ne pas** réintroduire : `emergentintegrations`.

Quand N2 sera un package : ajouter par ex. `neriacorp-n2 @ git+https://github.com/<org>/N2.git#subdirectory=...` (URL à confirmer).

### `backend/.env` (en plus du `.env.example` actuel)

```bash
OPENAI_API_KEY=sk-...              # vision image (fallback ou N2 lui-même)
# N2 noyau OCR (dès que l’URL est connue)
N2_OCR_BASE_URL=https://api.neriacorp.com
N2_OCR_API_KEY=

# Publish live vers Avis / Aevis (adapters.py)
AEVIS_BASE_URL=https://aevis.neriacorp.com
AEVIS_API_KEY=
# optionnel : VISATRACE_ / HERITIA_ / VEOVISION_ / VELLUMIA_  BASE_URL + API_KEY
```

### Frontend

Aucun changement de contrat : `api.scanner.analyze` / `analyzeVideo` / `publish` dans `frontend/src/utils/api.jsx` pointent déjà sur `/api/scanner/*`. Restaurer l’UI admin `NeriaCorpScannerTab` (absente) si le tiroir Intelligence doit revenir.

### Bloqueur immédiat

Sans le **dépôt N2** dans l’environnement Cloud Agent, le chemin `N2/services/ocr_scanner` (ou équivalent) **ne peut pas être confirmé**. Relancer l’agent en multi-repo avec N2, ou coller l’URL GitHub du noyau.
