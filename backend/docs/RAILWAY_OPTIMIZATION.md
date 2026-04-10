# Guide d'Optimisation Railway - Maman Douce

## Vue d'ensemble des optimisations (v2.1.0)

Ce document décrit les optimisations implémentées pour réduire les coûts Railway et rester dans le crédit gratuit mensuel.

---

## 1. Optimisations Mémoire RAM

### Bibliothèques supprimées (non utilisées)
- `pandas` (~150MB RAM)
- `numpy` (~50MB RAM)
- `opencv-python-headless` (~100MB RAM)
- `pillow` (~30MB RAM)
- `black`, `flake8`, `mypy`, `isort`, `pytest` (outils dev uniquement)

**Économie estimée: ~350MB RAM**

### Mode Low Memory activé
```env
LOW_MEMORY_MODE="true"
```

Le mode active:
- Garbage Collector agressif (seuils: 700, 10, 10)
- Nettoyage automatique toutes les 5 minutes
- Suppression des fichiers temporaires > 30 min
- GC après chaque opération lourde

---

## 2. Optimisations Emails (Gardien v2.0)

### Avant
- Email à chaque alerte (succès, warning, critique)
- Pas de debounce → spam d'emails

### Après
| Fonctionnalité | Configuration |
|----------------|---------------|
| Emails critiques uniquement | API Server, Database, Stripe |
| Debounce | 10 erreurs/min → 1 email récap |
| Rapport quotidien | 8h00 UTC |
| Log interne | Tous les autres statuts |

**Économie: ~90% des emails**

---

## 3. Variables d'Environnement Railway

Ajouter dans Railway > Variables:

```env
# Mode production
LOW_MEMORY_MODE=true
DEBUG=false

# Gardien optimisé
ADMIN_DASHBOARD_URL=https://votre-domaine.railway.app/admin

# Optionnel - Limite de workers
WEB_CONCURRENCY=1
```

---

## 4. Endpoints de Monitoring

### Health Check
```
GET /api/health
```
Retourne: version, status

### Stats Mémoire
```
GET /api/health/memory
```
Retourne: usage RAM, stats GC, mode low memory

### Nettoyage Manuel
```
POST /api/health/cleanup
```
Force un cycle de garbage collection

---

## 5. Logs Railway à surveiller

### Bons indicateurs ✅
```
[Guardian] 📊 Résultat: ✅6 ⚠️0 ❌0
[MemoryOptimizer] ⚡ MODE LOW MEMORY ACTIVÉ
[MemoryOptimizer] ✅ Nettoyage terminé - GC: XX objets
```

### Alertes ⚠️
```
[Guardian] 🚨 INCIDENT CRITIQUE
[MemoryOptimizer] Erreur nettoyage
```

---

## 6. Estimation des Coûts Railway

### Configuration recommandée
- **Starter Plan** (gratuit): 500 MB RAM, $5/mois crédit
- **Usage typique**: ~200-300 MB RAM

### Économies mensuelles
| Poste | Avant | Après | Économie |
|-------|-------|-------|----------|
| RAM Backend | ~550MB | ~200MB | -350MB |
| Emails Resend | ~500/mois | ~50/mois | -90% |
| Builds | Avec deps lourdes | Optimisé | -30% temps |

---

## 7. Checklist Déploiement

- [ ] Variables d'environnement configurées
- [ ] `LOW_MEMORY_MODE=true`
- [ ] `DEBUG=false`
- [ ] MongoDB Atlas IP whitelist (0.0.0.0/0)
- [ ] Domaine configuré dans `ADMIN_DASHBOARD_URL`
- [ ] Webhook Stripe configuré

---

## 8. Dépannage

### RAM élevée
1. Vérifier `/api/health/memory`
2. Appeler `POST /api/health/cleanup`
3. Vérifier les logs pour fuites mémoire

### Emails non reçus
1. Vérifier quota Resend
2. Vérifier `RESEND_API_KEY`
3. Consulter les logs Guardian

### Service lent
1. Vérifier usage RAM Railway
2. Activer `LOW_MEMORY_MODE`
3. Redéployer le service

---

*Dernière mise à jour: Avril 2026*
