# NeriaCorp — Branchement APIs métier

L'orchestrateur NeriaCorp est **plug-and-play** : il bascule automatiquement entre **mock**
et **live** en lisant les variables d'environnement.

## Configuration

Pour activer une app, ajoute ses 2 variables dans `/app/backend/.env` :

```bash
# VisaTrace
VISATRACE_BASE_URL=https://api.visatrace.example.com
VISATRACE_API_KEY=ton-bearer-token

# Heritia
HERITIA_BASE_URL=https://api.heritia.example.com
HERITIA_API_KEY=ton-bearer-token

# VeoVision
VEOVISION_BASE_URL=https://api.veovision.example.com
VEOVISION_API_KEY=ton-bearer-token

# Vellumia
VELLUMIA_BASE_URL=https://api.vellumia.example.com
VELLUMIA_API_KEY=ton-bearer-token

# Aevis
AEVIS_BASE_URL=https://api.aevis.example.com
AEVIS_API_KEY=ton-bearer-token
```

Puis : `sudo supervisorctl restart backend`

## Contrat d'API attendu côté apps métier

L'orchestrateur appelle :

```
POST {BASE_URL}/api/neriacorp/inject

Headers:
  Authorization: Bearer {API_KEY}
  Content-Type: application/json
  X-NeriaCorp-Publication-Id: NC-VEL-A82CA01B
  X-NeriaCorp-Admin: admin@mamandouce.com

Body:
{
  "publication_id": "NC-VEL-A82CA01B",
  "scan_id": "uuid-du-scan",
  "payload": {
    "business": { ... données NeriaCorp ... },
    "display_card": { title, summary, ... }
  }
}
```

Réponse attendue **200 OK** :
```json
{
  "id": "remote-business-id-12345",
  "reference": "REF-2026-001"
}
```

## Comportement

| Cas | Status retourné | partial | Toast frontend |
|---|---|---|---|
| Env configurée + appel HTTP OK | `published_live` | `false` | ✓ Live Vellumia — NC-VEL-... |
| Env configurée + erreur réseau (après 2 retries backoff) | `published_mock` | `true` | ⚠️ ... non branchée — mock NC-... |
| Env non configurée | `published_mock` | `true` | ✓ Injecté ... mock |

## Retries

- 2 retries (3 tentatives au total)
- Backoff exponentiel : 0.5s puis 1.0s
- Timeouts : connect 8s / read 15s

## Audit

Toutes les publications (live ET mock) sont persistées dans `db.scanner_publications` :
- `status`, `partial`, `configured`, `remote_id`, `error`, `revenue_estimated`, `currency`

Dashboard cumulé : `GET /api/scanner/publications`.
