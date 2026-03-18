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
- Avatar personnalisable (6 couleurs de peau, 10 coiffures, hijab)
- Nom d'affichage personnalisé
- Avatar SVG dynamique

### 9. Messagerie avec Photos
- Joindre jusqu'à 3 photos par message
- Support caméra et galerie sur mobile
- Visualisation plein écran

### 10. Grossesse après 35 ans
Section dédiée avec fertilité, examens, risques, accompagnement

## Restrictions Premium/Gratuit (NEW 18/03/2026)

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

## Tech Stack
- **Frontend:** React, PWA, Shadcn/UI, Capacitor (Android)
- **Backend:** FastAPI, MongoDB
- **Integrations:** Stripe, Resend, OpenAI (via Emergent LLM Key), APScheduler, Web Push API

## Recent Changes

### Session du 18/03/2026
- ✅ **Restrictions Premium implémentées** - Différenciation claire entre utilisateurs gratuits et premium
- ✅ **Bug scanner corrigé** - La page blanche pour utilisateurs gratuits est résolue
- ✅ **SubscriptionGate refactorisé** - Utilise maintenant un Context React pour partager le statut d'abonnement
- ✅ **Composant PremiumFeatureLock créé** - Composant réutilisable pour bloquer les fonctionnalités premium
- ✅ **Nettoyage du code** - Suppression du fichier subscription.js inutilisé

### Session du 17/03/2026
- Compteur de vues pour recettes partagées
- Favoris sac de maternité
- Avatar personnalisable
- Correction bug traduction automatique
- Suppression/sélection multiple des messages
- Point rouge notification messages non lus

## Architecture
```
/app
├── backend/
│   ├── routes/
│   │   ├── food.py         # Logique restriction scans
│   │   ├── referral.py     # Endpoint full-status avec scans_this_week
│   │   └── contact.py      # Suppression messages
│   └── models/schemas.py
└── frontend/
    └── src/
        ├── components/
        │   ├── SubscriptionGate.jsx    # Context d'abonnement (refactorisé)
        │   ├── PremiumFeatureLock.jsx  # Composant blocage premium (NEW)
        │   └── ui/
        └── pages/
            ├── FoodScanner.js          # Restrictions scans
            ├── WeeklyTipsPage.js       # Restrictions semaines 1-4
            ├── EmbryoTracker.js        # Restrictions semaines 1-4
            ├── ChatbotPage.js          # Blocage complet
            └── MaternityBagPage.js     # Blocage complet
```

## API Endpoints
- `GET /api/subscription/full-status` - Retourne is_premium, scans_this_week, scans_limit
- `POST /api/scan/barcode` - Vérifie limite scans, retourne 403 si dépassée
- `POST /api/scan/search` - Vérifie limite scans, retourne 403 si dépassée

## Backlog

### P1 - Haute priorité
- [ ] Guide publication Google Play Store

### P2 - Moyenne priorité
- [ ] Résolution bannière "Spinning up servers" (artefact preview)
- [ ] Fonction "Tout ouvrir/Tout fermer" pour sections déroulantes

### P3 - Future
- [ ] Mode hors-ligne amélioré
- [ ] Statistiques d'utilisation

## Known Issues
- Bannière "Spinning up servers" visible sur environnement preview uniquement (disparaîtra en production)
- L'URL de preview contient "femme-enceinte-app" - en production, utilisez un domaine personnalisé

## Credentials (Test)
- **Admin:** cyrilalepsa@gmail.com / Cyc@dmin9630
- **Test Gratuit:** test.free@example.com / Test1234!
