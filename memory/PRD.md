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
  - Distinction entre vrais paiements et déblocages admin
  - Revenus calculés uniquement sur les vrais paiements
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

## Statistiques Admin (Corrigées)

### Revenus et Conversions
Les statistiques excluent les déblocages admin :
- **premium_paid** : Uniquement les vrais paiements Stripe
- **premium_admin** : Déblocages par l'admin (non comptés)
- **postpartum_paid** : Vrais achats post-partum
- **postpartum_free** : Via parrainage ou admin

### Formule de Revenus
```
Revenus = (premium_paid × 27€) + (postpartum_paid × 8€)
```

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
- ✅ **Statistiques corrigées** - Exclusion des déblocages admin des revenus/conversions
- ✅ **UI Scheduler corrigée** - Boutons bien alignés dans le cadre

## Backlog

### P1 - Haute priorité
- [ ] Guide publication Google Play Store

### P2 - Complétés ✅
- [x] Notifications push rappel fin d'essai
- [x] Export CSV des statistiques
- [x] Bouton toggle sur autres pages
- [x] Correction statistiques (hors admin)
- [x] Correction UI page Rappels

### P3 - Future
- [ ] Statistiques avec graphiques temporels
- [ ] Notifications push personnalisables par type

## Known Issues
- Bannière "Spinning up servers" : script de masquage en place (artefact preview)
- URL preview "femme-enceinte-app" - utiliser domaine personnalisé en production

## Credentials (Test)
- **Admin:** cyrilalepsa@gmail.com / Cyc@dmin9630
- **Test Essai:** test.free@example.com / Test1234! (essai activé)
