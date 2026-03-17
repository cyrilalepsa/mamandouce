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

### 3. Organisation
- Liste de naissance partageable
- Sac de maternité avec checklist
- Agenda des rendez-vous médicaux
- Système de rappels par email ET push

### 4. Post-partum
- Guide complet post-accouchement
- Suivi de reprise

### 5. Premium Features
- Chatbot IA (GPT-4o-mini)
- Intégration Stripe pour abonnements
- Système de codes promo et parrainage

### 6. Administration
- Panel admin complet
- Export projet Android (ZIP/email)
- Kit Business (business plan + carte de visite)
- Protection Super Admin

### 7. Notifications Push Natives
- Rappels de RDV médicaux (24h avant + jour même)
- Conseils hebdomadaires de grossesse
- Personnalisation complète dans les paramètres

### 8. Personnalisation du Profil (NEW)
- Upload d'avatar (compression auto 200x200, max 500KB)
- Nom d'affichage personnalisé (display_name)
- Affichage sur page d'accueil "Bonjour, [nom]" avec avatar

## Tech Stack
- **Frontend:** React, PWA, Shadcn/UI, Capacitor (Android)
- **Backend:** FastAPI, MongoDB
- **Integrations:** Stripe, Resend, OpenAI (via Emergent LLM Key), APScheduler, Web Push API

## Recent Changes (December 2025)

### Session du 17/03/2026 (suite)
- ✅ Avatar utilisateur dans la page Profil
- ✅ Nom d'affichage personnalisé (display_name)
- ✅ Affichage de l'avatar et du nom sur la page d'accueil
- ✅ Composant ProfileEditCard avec upload d'image

### Session du 17/03/2026
- ✅ Notifications push natives implémentées
- ✅ Nettoyage fichiers obsolètes
- ✅ Correction écran de chargement initial

### Session précédente
- ✅ Guide complet pour build Android (.aab généré)
- ✅ Export projet Android dans admin
- ✅ Kit Business (plan financier + carte de visite)
- ✅ Protection compte Super Admin
- ✅ Refonte UI: TopBar, Tarification, Paramètres

## Backlog

### P1 - Haute priorité
- [ ] Guide publication Google Play Store

### P2 - Moyenne priorité
- [ ] Compteur de vues pour recettes partagées
- [ ] Favoris pour articles du sac de maternité
- [ ] Fonction "Tout ouvrir/Tout fermer" pour sections

### P3 - Future
- [ ] Mode hors-ligne amélioré
- [ ] Statistiques d'utilisation

## Credentials (Test)
- **Admin:** cyrilalepsa@gmail.com / Cyc@dmin9630

## Architecture
```
/app
├── backend/
│   ├── routes/
│   │   ├── auth.py         # PUT /auth/profile pour avatar/display_name
│   │   ├── admin.py        # Export, kit business, super admin
│   │   ├── preferences.py  # Préférences notifications
│   │   └── push_notifications.py
│   ├── models/
│   │   └── schemas.py      # User avec display_name, avatar + ProfileUpdate
│   ├── core/
│   │   └── scheduler.py    # Jobs: rappels RDV + conseils hebdo push
│   └── server.py
└── frontend/
    ├── public/
    │   └── index.html      # Loader pré-React + hide Emergent banners
    └── src/
        ├── components/
        │   └── profile/
        │       └── ProfileEditCard.jsx  # NEW - avatar + nom
        ├── pages/
        │   ├── ProfilePage.js  # Intègre ProfileEditCard
        │   └── HomePage.js     # Affiche avatar + displayName
        └── utils/
            └── api.js          # auth.updateProfile()
```

## API Endpoints (Profile)
- `PUT /api/auth/profile` - Update display_name and avatar
  - Body: `{ display_name?: string, avatar?: string (base64) }`
  - Validation: display_name max 50 chars, avatar max 500KB
- `GET /api/auth/me` - Returns user with display_name and avatar fields
