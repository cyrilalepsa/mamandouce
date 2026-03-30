# MamanDouce - Product Requirements Document

## Original Problem Statement
Application pour femmes enceintes avec une UX/UI type smartphone (iOS/Android). 

### Core Features
- Page "Socle" fixe type tiroir d'applications
- Pages personnalisables avec duplication
- Création de dossiers/groupes via Drag & Drop
- Système d'épingle pour les sections
- Support Multi-langues complet

## Tech Stack
- **Frontend**: React, Context API, Tailwind CSS, HTML5 Drag and Drop API
- **Backend**: FastAPI, MongoDB
- **Hosting**: Railway
- **Integrations**: Resend (emails), Stripe (payments), OpenAI GPT-5.2 (translations)

## Database Schema
- `users`: Données utilisateur
- `user_layouts`: Layouts personnalisés liés par email
- `contact_messages`: Messages de contact
- `reminders`: Rappels personnalisés

## Key API Endpoints
- `/api/user/layout` (GET/POST/DELETE) - Gestion des layouts

---

# CHANGELOG

## 2026-03-30
- ✅ Vérification visuelle de la réforme 2026 (congés parentaux)
- ✅ Vérification de `UpcomingRemindersCard` (carte rappels sur accueil)
- ✅ Vérification du point rouge clignotant (notifications messages)

## Sessions précédentes (récap)
- ✅ Correction bug API `/api/user_layout` (remplacement `_id` par `email`)
- ✅ Remplacement accordéons par pages de sections dédiées avec système d'épingle
- ✅ Création popups de duplication "façon bulle/nuage"
- ✅ Déplacement et redesign des bulles de pagination
- ✅ Implémentation Drag & Drop pour créer des groupes/dossiers
- ✅ Design en relief de la carte "Les étapes de votre plus beau voyage"
- ✅ Création de `PreconceptionTipsPage.js` et `ParentalLeavePage.js`
- ✅ Création de `UpcomingRemindersCard.jsx`
- ✅ Ajout réforme 2026 dans `ParentalLeavePage.js`
- ✅ Intégration carte rappels dans `CustomizableHome.jsx`
- ✅ Point rouge clignotant dans `TopBar.jsx`

---

# ROADMAP

## P0 - Critical
- Aucun bloqueur actuel

## P1 - High Priority
- 🟡 Publication Google Play Store (génération archive `.aab`)

## P2 - Medium Priority
- Aucune tâche P2 en attente

## P3 - Low Priority
- 🔵 Audio prononciation pour les prénoms

## P4 - Backlog
- 🔵 Comparateur de prénoms

---

## Key Files Reference
- `/app/frontend/src/pages/ParentalLeavePage.js`
- `/app/frontend/src/components/home/UpcomingRemindersCard.jsx`
- `/app/frontend/src/components/home/CustomizableHome.jsx`
- `/app/frontend/src/components/home/TopBar.jsx`
- `/app/frontend/src/components/home/DragDropComponents.jsx`
- `/app/frontend/src/contexts/HomeLayoutContext.js`
- `/app/backend/routes/user_layout.py`

## Areas to Watch
- `CustomizableHome.jsx` et `HomeLayoutContext.js` deviennent denses (Drag&Drop, touch events, swipes, long press)

## Credentials for Testing
- Test account: Créer via `/api/auth/register`
- Admin: `cyrilalepsa@gmail.com`
