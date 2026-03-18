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
- Agenda des rendez-vous médicaux
- Système de rappels par email ET push

### 4. Post-partum (Premium)
- Guide complet post-accouchement
- Bouton "Tout ouvrir / Tout fermer" pour les sections

### 5. Premium Features
- Chatbot IA (GPT-4o-mini)
- Intégration Stripe pour abonnements
- Système de codes promo et parrainage
- **Essai gratuit 7 jours** avec rappels automatiques

### 6. Administration
- Panel admin complet avec **statistiques avancées**
  - Revenus calculés uniquement sur les vrais paiements (hors admin)
- **Export CSV des statistiques**
- **Graphiques temporels** : inscriptions 30j, répartition utilisateurs, utilisation features
- Export projet Android (ZIP/email)
- Kit Business

### 7. Notifications Push Personnalisables
- Conseils hebdomadaires
- Rappels de rendez-vous (24h avant, jour même)
- **Rappels fin d'essai** (J-1 et jour J)
- **Promotions et actualités**
- Personnalisation complète par type dans Paramètres

### 8. UI/UX
- Bouton "Tout ouvrir / Tout fermer" sur : Paramètres, Post-partum, Grossesse 35+
- Mode hors-ligne avec synchronisation automatique
- Interface en français (Planificateur au lieu de Scheduler)

## Statistiques Admin

### Graphiques Disponibles
1. **Inscriptions (30 derniers jours)** - Courbe linéaire
2. **Répartition des utilisateurs** - Camembert (Gratuits, Essai, Premium, Promo, Admin)
3. **Utilisation des fonctionnalités** - Barres horizontales

### Calcul des Revenus
```
Revenus = (premium_paid × 27€) + (postpartum_paid × 8€)
```
Les déblocages admin sont exclus du calcul.

## Tech Stack
- **Frontend:** React, PWA, Shadcn/UI, Recharts, Capacitor
- **Backend:** FastAPI, MongoDB
- **Integrations:** Stripe, Resend, OpenAI, APScheduler, Web Push API

## Recent Changes

### Session du 18/03/2026 (Complète)
- ✅ Restrictions Premium implémentées
- ✅ Essai gratuit 7 jours
- ✅ Notifications rappel fin d'essai
- ✅ Export CSV statistiques
- ✅ Bouton toggle sur 3 pages
- ✅ Statistiques corrigées (hors admin)
- ✅ **Graphiques temporels** (Recharts)
- ✅ **Notifications push personnalisables par type**
- ✅ **Traduction "Scheduler" → "Planificateur"**

## API Endpoints
- `GET /api/admin/chart-stats` - Données pour graphiques
- `GET /api/admin/advanced-stats` - Stats avancées (hors admin)
- `GET /api/admin/export-stats-csv` - Export CSV
- `POST /api/payments/trial/start` - Démarrer essai
- `GET /api/payments/trial/status` - Statut essai

## Backlog

### P1 - Haute priorité
- [ ] Guide publication Google Play Store

### P2/P3 - Complétés ✅
- [x] Notifications push rappel fin d'essai
- [x] Export CSV des statistiques
- [x] Bouton toggle sur autres pages
- [x] Correction statistiques (hors admin)
- [x] Graphiques temporels
- [x] Notifications push personnalisables

## Credentials (Test)
- **Admin:** cyrilalepsa@gmail.com / Cyc@dmin9630
- **Test Essai:** test.free@example.com / Test1234!
