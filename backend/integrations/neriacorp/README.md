# MamanDouce × Portail NeriaCorp — Zone B2C

MamanDouce est une application **B2C** (consommatrices / futures mamans) de l’écosystème NeriaCorp.

Elle doit figurer dans la **zone B2C** du portail NeriaCorp — distincte des apps B2B / verticales (VisaTrace, Heritia, Aevis, VeoVision, Vellumia).

## Découverte (plug-and-play)

| Source | URL |
|--------|-----|
| Catalogue API (zone B2C) | `GET {API}/api/neriacorp/catalog` |
| Fiche app | `GET {API}/api/neriacorp/app` |
| SSO (découverte) | `GET {API}/api/neriacorp/sso/status` |
| Scanner OCR (admin) | `POST {API}/api/scanner/analyze` |
| Manifeste statique (CDN / FE) | `https://mamandouce.app/neriacorp-app.json` |

### Exemple de réponse catalogue

```json
{
  "ecosystem": "NeriaCorp",
  "zone": "B2C",
  "count": 1,
  "apps": [
    {
      "slug": "mamandouce",
      "name": "MamanDouce",
      "zone": "B2C",
      "audience": "consumer",
      "theme_color": "#ec4899",
      "portal": { "visible": true, "zone": "B2C", "featured": true }
    }
  ]
}
```

## Variables d’environnement (optionnel)

| Variable | Rôle |
|----------|------|
| `PUBLIC_APP_URL` | URL publique app (défaut = `FRONTEND_URL`) |
| `PUBLIC_API_URL` | URL publique API (liens health / docs dans le catalogue) |
| `NERIACORP_PORTAL_STATUS` | `active` / `beta` / `maintenance` |
| `NERIACORP_PORTAL_SORT` | Ordre d’affichage dans la zone B2C (défaut `10`) |
| `N2_OCR_BASE_URL` / `N2_OCR_API_KEY` | Worker OCR Noyau (sinon OpenAI vision locale) |
| `NERIACORP_SSO_ISSUER` / `NERIACORP_SSO_LOGIN_URL` | Accroche SSO portail |
| `{APP}_BASE_URL` / `{APP}_API_KEY` | Publish live (Aevis, Heritia, …) |

## Côté portail NeriaCorp

1. Appeler `GET …/api/neriacorp/catalog` (ou lire `neriacorp-app.json`).
2. Filtrer / placer l’entrée où `zone === "B2C"`.
3. Afficher carte produit avec `theme_color`, `icon`, `urls.app`.

## Fichiers

- `backend/integrations/neriacorp/catalog.py`
- `backend/integrations/neriacorp/adapters.py`
- `backend/integrations/neriacorp/scanner_adapter.py`
- `backend/routes/neriacorp_portal.py`
- `backend/routes/scanner_ai.py`
- `frontend/public/neriacorp-app.json`
