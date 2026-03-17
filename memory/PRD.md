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
- Système de rappels par email

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

## Tech Stack
- **Frontend:** React, PWA, Shadcn/UI, Capacitor (Android)
- **Backend:** FastAPI, MongoDB
- **Integrations:** Stripe, Resend, OpenAI (via Emergent LLM Key), APScheduler

## Recent Changes (December 2025)

### Session du 20/12/2025
- ✅ Guide complet pour build Android (.aab généré)
- ✅ Export projet Android dans admin
- ✅ Kit Business (plan financier + carte de visite)
- ✅ Protection compte Super Admin
- ✅ Refonte UI: TopBar avec menu déroulant
- ✅ Refonte page Tarification (FAQ déroulante)
- ✅ Refonte page Paramètres (sections déroulantes)
- ✅ Chatbot moins intrusif
- ✅ Écran de chargement pré-React (masque bannière Emergent)
- ✅ Nettoyage fichiers obsolètes (ShareAppSection, ServerWakeUp, AccountMenuSection)

## Backlog

### P1 - Haute priorité
- [ ] Guide publication Google Play Store

### P2 - Moyenne priorité
- [ ] Compteur de vues pour recettes partagées
- [ ] Favoris pour articles du sac de maternité
- [ ] Fonction "Tout ouvrir/Tout fermer" pour sections

### P3 - Future
- [ ] Notifications push natives
- [ ] Mode hors-ligne amélioré
- [ ] Statistiques d'utilisation

## Credentials (Test)
- **Admin:** cyrilalepsa@gmail.com / Cyc@dmin9630

## Architecture
```
/app
├── backend/
│   ├── routes/admin.py    # Export, kit business, super admin
│   └── server.py          # API principale
└── frontend/
    ├── public/
    │   ├── docs/          # Business plan, carte de visite
    │   └── index.html     # Loader pré-React
    └── src/
        ├── components/
        │   ├── admin/     # AndroidExportTab
        │   └── home/      # TopBar avec menu
        └── pages/         # Toutes les pages
```
