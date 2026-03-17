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

### 8. Personnalisation du Profil
- **Avatar personnalisable** (NEW)
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

### 10. Grossesse après 35 ans (NEW)
Nouvelle section dédiée avec :
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

## Recent Changes (March 2026)

### Session du 17/03/2026
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
│   │   ├── auth.py         # avatar_config support
│   │   └── contact.py      # images in messages
│   └── models/schemas.py   # User with avatar_config
└── frontend/
    └── src/
        ├── components/profile/
        │   ├── AvatarBuilder.jsx     # Avatar creation system
        │   └── ProfileEditCard.jsx   # Integration
        └── pages/
            ├── HomePage.js           # AvatarPreview display
            └── PregnancyAfter35Page.js  # New content page
```

## Avatar Configuration
```javascript
avatar_config: {
  faceShape: 'oval',        // round, oval, heart, square
  skinTone: 'medium',       // light, light-medium, medium, medium-dark, dark, deep
  hairStyle: 'curly',       // long-straight, long-wavy, medium-straight, medium-curly, short, curly, afro, braids, bun, hijab
  hairColor: 'dark-brown',  // black, dark-brown, brown, light-brown, blonde, red, gray, white
  glasses: 'none',          // none, round, square, cat
  age: 'young'              // young, mature
}
```
