# MamanDouce - Product Requirements Document

## Overview
MamanDouce est une application PWA complète d'accompagnement à la maternité, ciblant les femmes francophones enceintes ou en projet de grossesse.

## Core Features (Implemented)

### 1. Outils de Grossesse
- Calculateur de date d'accouchement
- Roue de grossesse interactive
- Suivi embryonnaire semaine par semaine
- Conseils hebdomadaires personnalisés

### 2. Alimentation
- Scanner d'aliments (vérification compatibilité grossesse)
- Bibliothèque alimentaire complète
- Recettes adaptées avec système de partage
- Compteur de vues pour recettes partagées

### 3. Organisation
- Liste de naissance partageable
- Sac de maternité avec checklist
- Favoris pour articles du sac de maternité
- Section "Mes essentiels" - Vue rapide des articles favoris
- Agenda des rendez-vous médicaux
- Système de rappels par email ET push

### 4. Post-partum
- Guide complet post-accouchement
- Suivi de reprise
- Bouton "Tout ouvrir / Tout fermer" pour les sections

### 5. Premium Features
- Chatbot IA (GPT-4o-mini)
- Intégration Stripe pour abonnements
- Système de codes promo et parrainage
- **Essai gratuit 7 jours** (NEW)

### 6. Administration
- Panel admin complet
- Export projet Android (ZIP/email)
- Kit Business (business plan + carte de visite)
- Protection Super Admin

### 7. Notifications Push Natives
- Rappels de RDV médicaux (24h avant + jour même)
- Conseils hebdomadaires de grossesse
- Personnalisation complète dans les paramètres

### 8. Personnalisation du Profil
- Avatar personnalisable (6 couleurs de peau, 10 coiffures, hijab)
- Nom d'affichage personnalisé
- Avatar SVG dynamique

### 9. Messagerie avec Photos
- Joindre jusqu'à 3 photos par message
- Support caméra et galerie sur mobile
- Visualisation plein écran

### 10. Grossesse après 35 ans
Section dédiée avec fertilité, examens, risques, accompagnement

## Restrictions Premium/Gratuit

### Fonctionnalités GRATUITES
| Fonctionnalité | Limite |
|---|---|
| Scanner d'aliments | 5 scans/semaine |
| Conseils hebdomadaires | Semaines 1-4 uniquement |
| Évolution de l'embryon | Semaines 1-4 uniquement |
| Calculateur de grossesse | Illimité |
| Calendrier de fertilité | Illimité |
| Liste de naissance | Illimité |

### Fonctionnalités PREMIUM
| Fonctionnalité | Accès |
|---|---|
| Scanner d'aliments | Illimité |
| Conseils hebdomadaires | 41 semaines complètes |
| Évolution de l'embryon | 40 semaines complètes |
| Chatbot IA | Accès complet |
| Sac de maternité | Accès complet |
| Images embryon HD | Toutes les semaines |
| Démarches administratives | Toutes les semaines |

### Garanties (Page Tarification)
1. **Essai gratuit 7 jours** - Tester toutes les fonctionnalités sans engagement
2. **Satisfait ou remboursé 30 jours** - Remboursement sur simple demande
3. **Paiement sécurisé** - Via Stripe
4. **Remboursement fausse couche** - Au prorata des mois restants

## Tech Stack
- **Frontend:** React, PWA, Shadcn/UI, Capacitor (Android)
- **Backend:** FastAPI, MongoDB
- **Integrations:** Stripe, Resend, OpenAI (via Emergent LLM Key), APScheduler, Web Push API

## Recent Changes

### Session du 18/03/2026 (Suite)
- ✅ **Essai gratuit 7 jours implémenté**
  - API `/api/payments/trial/start` pour activer l'essai
  - API `/api/payments/trial/status` pour vérifier le statut
  - Intégration avec le statut d'abonnement global
  - Protection contre réactivation de l'essai
- ✅ **FAQ mise à jour** avec questions sur l'essai et le remboursement
- ✅ **Bouton "Tout ouvrir / Tout fermer"** ajouté à la page post-partum
- ✅ **Script anti-bannière renforcé** pour masquer "Spinning up servers"
- ✅ **Composant ToggleAllSections créé** - Réutilisable pour autres pages

### Session du 18/03/2026
- ✅ **Restrictions Premium implémentées**
- ✅ **Bug scanner corrigé**
- ✅ **SubscriptionGate refactorisé** avec Context React
- ✅ **Composant PremiumFeatureLock créé**

## Architecture
```
/app
├── backend/
│   ├── routes/
│   │   ├── payments.py     # Endpoints essai gratuit (NEW)
│   │   ├── food.py         # Logique restriction scans
│   │   └── referral.py     # Endpoint full-status avec trial
│   └── models/schemas.py
└── frontend/
    └── src/
        ├── components/
        │   ├── SubscriptionGate.jsx
        │   ├── PremiumFeatureLock.jsx
        │   └── ToggleAllSections.jsx  # (NEW)
        └── pages/
            ├── PricingPage.js          # Essai gratuit + FAQ
            └── PostpartumPage.js       # Bouton tout ouvrir/fermer
```

## API Endpoints
- `POST /api/payments/trial/start` - Activer l'essai gratuit de 7 jours
- `GET /api/payments/trial/status` - Vérifier le statut de l'essai
- `GET /api/subscription/full-status` - Retourne is_premium, is_trial_active, trial_days_remaining

## Backlog

### P1 - Haute priorité
- [ ] Guide publication Google Play Store

### P2 - Complétés
- [x] Résolution bannière "Spinning up servers" (script renforcé)
- [x] Fonction "Tout ouvrir/Tout fermer" pour sections déroulantes

### P3 - Future
- [ ] Mode hors-ligne amélioré
- [ ] Statistiques d'utilisation
- [ ] Ajouter bouton toggle à d'autres pages (Settings, etc.)

## Known Issues
- Bannière "Spinning up servers" : script de masquage ajouté, mais peut persister dans certains cas (artefact preview)
- L'URL de preview contient "femme-enceinte-app" - en production, utilisez un domaine personnalisé

## Credentials (Test)
- **Admin:** cyrilalepsa@gmail.com / Cyc@dmin9630
- **Test Gratuit:** test.free@example.com / Test1234! (essai activé)
