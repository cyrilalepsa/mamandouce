# MamanDouce - Product Requirements Document

## Overview
MamanDouce est une application PWA complète d'accompagnement à la maternité, ciblant les femmes francophones enceintes ou en projet de grossesse.

## Core Features (Implemented)

### 1. Outils de Grossesse
- Calculateur de date d'accouchement
- Roue de grossesse interactive
- Suivi embryonnaire semaine par semaine (semaines 1-4 gratuites)
- Conseils hebdomadaires personnalisés (semaines 1-4 gratuites)

### 2. Alimentation
- Scanner d'aliments (5 scans/semaine gratuits, illimité Premium)
- Bibliothèque alimentaire complète
- Recettes adaptées avec système de partage
- Compteur de vues pour recettes partagées

### 3. Organisation
- Liste de naissance partageable
- Sac de maternité avec checklist (Premium)
- Favoris pour articles du sac de maternité
- Section "Mes essentiels"
- Agenda des rendez-vous médicaux
- Système de rappels par email ET push

### 4. Post-partum (Premium)
- Guide complet post-accouchement
- Suivi de reprise
- Bouton "Tout ouvrir / Tout fermer" pour les sections

### 5. Premium Features
- Chatbot IA (GPT-4o-mini)
- Intégration Stripe pour abonnements
- Système de codes promo et parrainage
- **Essai gratuit 7 jours** avec rappels automatiques

### 6. Administration
- Panel admin complet avec **statistiques avancées**
- **Export CSV des statistiques**
- Export projet Android (ZIP/email)
- Kit Business (business plan + carte de visite)
- Protection Super Admin

### 7. Notifications Push
- Rappels de RDV médicaux (24h avant + jour même)
- Conseils hebdomadaires de grossesse
- **Rappels fin d'essai gratuit** (J-1 et jour J)
- Personnalisation complète dans les paramètres

### 8. UI/UX Avancée
- Bouton "Tout ouvrir / Tout fermer" sur :
  - Page Paramètres
  - Page Post-partum
  - Page Grossesse après 35 ans
- Indicateur de connexion hors-ligne
- Mode hors-ligne avec synchronisation automatique

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

### Garanties
1. **Essai gratuit 7 jours** - Tester toutes les fonctionnalités sans engagement
2. **Satisfait ou remboursé 30 jours** - Remboursement sur simple demande
3. **Paiement sécurisé** - Via Stripe
4. **Remboursement fausse couche** - Au prorata des mois restants

## Tech Stack
- **Frontend:** React, PWA, Shadcn/UI, Capacitor (Android)
- **Backend:** FastAPI, MongoDB
- **Integrations:** Stripe, Resend, OpenAI (via Emergent LLM Key), APScheduler, Web Push API

## Recent Changes

### Session du 18/03/2026 (Complète)
- ✅ **Restrictions Premium** - Différenciation gratuit/premium complète
- ✅ **Essai gratuit 7 jours** - API et UI implémentés
- ✅ **Notifications rappel fin d'essai** - J-1 et jour J avec emails
- ✅ **Export CSV statistiques** - Téléchargement direct depuis dashboard admin
- ✅ **Bouton "Tout ouvrir / Tout fermer"** - Paramètres, Post-partum, Grossesse 35+
- ✅ **Statistiques avancées admin** - Conversions, revenus, utilisation features
- ✅ **Mot de passe oublié** - Vérifié fonctionnel

## Architecture
```
/app
├── backend/
│   ├── core/
│   │   └── scheduler.py        # +Job rappels fin d'essai (toutes les heures)
│   └── routes/
│       ├── admin.py            # +endpoint /admin/export-stats-csv
│       └── payments.py         # +endpoints /trial/start, /trial/status
└── frontend/
    └── src/
        ├── components/
        │   ├── ToggleAllSections.jsx
        │   └── admin/
        │       └── DashboardTab.jsx    # +Bouton Export CSV
        └── pages/
            ├── SettingsPage.js         # +Bouton toggle
            ├── PostpartumPage.js       # +Bouton toggle
            └── PregnancyAfter35Page.js # +Bouton toggle
```

## API Endpoints (Nouveaux)
- `GET /api/admin/export-stats-csv` - Export statistiques en CSV
- `GET /api/admin/advanced-stats` - Statistiques avancées (conversions, revenus)
- `POST /api/payments/trial/start` - Démarrer l'essai gratuit
- `GET /api/payments/trial/status` - Statut de l'essai

## Scheduler Jobs
- **send_due_reminders_job** - Toutes les minutes (rappels RDV)
- **send_weekly_tips_push_job** - Tous les jours à 9h (conseils hebdo)
- **send_trial_expiry_reminders_job** - Toutes les heures (rappels fin d'essai)

## Backlog

### P1 - Haute priorité
- [ ] Guide publication Google Play Store

### P2 - Complétés ✅
- [x] Notifications push rappel fin d'essai
- [x] Export CSV des statistiques
- [x] Bouton toggle sur autres pages

### P3 - Future
- [ ] Statistiques plus détaillées (graphiques temporels)
- [ ] Notifications push personnalisables par type

## Known Issues
- Bannière "Spinning up servers" : script de masquage en place (artefact preview)
- URL preview "femme-enceinte-app" - utiliser domaine personnalisé en production

## Credentials (Test)
- **Admin:** cyrilalepsa@gmail.com / Cyc@dmin9630
- **Test Essai:** test.free@example.com / Test1234! (essai activé)
