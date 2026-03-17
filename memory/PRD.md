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
- **Compteur de vues pour recettes partagées** (NEW 17/03)

### 3. Organisation
- Liste de naissance partageable
- Sac de maternité avec checklist
- **Favoris pour articles du sac de maternité** (NEW 17/03)
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

### 8. Personnalisation du Profil
- **Avatar personnalisable**
  - 6 couleurs de peau
  - 10 styles de coiffure (inclut hijab)
  - 8 couleurs de cheveux
  - 4 types de lunettes
  - 2 tranches d'âge
  - Option photo réelle (caméra/galerie)
- Nom d'affichage personnalisé
- Avatar SVG dynamique affiché partout

### 9. Messagerie avec Photos
- Joindre jusqu'à 3 photos par message
- Support caméra et galerie sur mobile
- Visualisation plein écran

### 10. Grossesse après 35 ans
Section dédiée avec :
- Fertilité après 35 ans
- Examens recommandés (DPNI, amniocentèse)
- Risques et précautions
- Suivi médical renforcé
- Accompagnement psychologique
- Avantages d'être maman plus tard

## Tech Stack
- **Frontend:** React, PWA, Shadcn/UI, Capacitor (Android)
- **Backend:** FastAPI, MongoDB
- **Integrations:** Stripe, Resend, OpenAI (via Emergent LLM Key), APScheduler, Web Push API

## Recent Changes

### Session du 17/03/2026
- ✅ **Compteur de vues** pour recettes partagées (affiché avec icône œil)
- ✅ **Favoris sac de maternité** (icône cœur sur chaque article)
- ✅ Tests automatisés validés (100% de réussite)

### Session précédente (17/03/2026)
- ✅ Avatar personnalisable avec système de création
- ✅ 10 styles de coiffures multi-ethniques
- ✅ Support du hijab
- ✅ Nouvelle page "Grossesse après 35 ans"
- ✅ 6 sections de contenu médical complet
- ✅ Photos dans messagerie
- ✅ Notifications push natives

## Backlog

### P1 - Haute priorité
- [ ] Guide publication Google Play Store

### P2 - Moyenne priorité
- [x] ~~Compteur de vues pour recettes partagées~~ ✅
- [x] ~~Favoris pour articles du sac de maternité~~ ✅
- [ ] Fonction "Tout ouvrir/Tout fermer" pour sections

### P3 - Future
- [ ] Mode hors-ligne amélioré
- [ ] Statistiques d'utilisation

## Known Issues
- Bannière "Spinning up servers" visible sur environnement preview (disparaîtra en production)

## Credentials (Test)
- **Admin:** cyrilalepsa@gmail.com / Cyc@dmin9630

## Architecture
```
/app
├── backend/
│   ├── routes/
│   │   ├── auth.py         # avatar_config support
│   │   ├── contact.py      # images in messages
│   │   └── postpartum.py   # maternity-bag/favorites + recipe views
│   └── models/schemas.py   # User with avatar_config
└── frontend/
    └── src/
        ├── components/profile/
        │   ├── AvatarBuilder.jsx     # Avatar creation system
        │   └── ProfileEditCard.jsx   # Integration
        └── pages/
            ├── HomePage.js           # AvatarPreview display
            ├── MaternityBagPage.js   # Heart favorites icons
            ├── SharedRecipesPage.js  # View counter with Eye icon
            └── PregnancyAfter35Page.js  # New content page
```

## API Endpoints (New)
- `GET /api/maternity-bag/favorites` - Liste des articles favoris
- `POST /api/maternity-bag/favorites/toggle` - Ajouter/retirer un favori
- `GET /api/postpartum/shared/{shareCode}` - Retourne maintenant le compteur de vues
