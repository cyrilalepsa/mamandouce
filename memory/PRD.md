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

## 2026-03-31 (Session 2 - Suite)
- ✅ BUG FIX: Section Post-partum affiche maintenant les cartes en mosaïque (RDV, Difficultés, Allaitement, Biberon, Couches, Portage)
- ✅ BUG FIX: Clic sur carte Post-partum → entre directement dans le contenu (plein écran)
- ✅ BUG FIX: Retour depuis contenu → revient à JourneyStepsPage avec épingle ouverte
- ✅ BUG FIX: Épingle Post-partum dans JourneyStepsPage affiche les 6 cartes
- ✅ BUG FIX: Items sur pages personnalisées ont les bonnes icônes (pas 📌)
- ✅ BUG FIX: Clic sur item de page personnalisée → navigue vers le contenu
- ✅ BUG FIX: Persistance du layout - HomeLayoutContext attend maintenant l'authentification avant de charger

## 2026-03-31 (Session 2)
- ✅ BUG FIX: Ajout de l'item "Rappels" manquant dans la section Grossesse (`JourneyStepsPage.js`)
- ✅ BUG FIX: Correction route "Suivi grossesse" → `/tracking` au lieu de `/calculator`
- ✅ BUG FIX: Correction `RemindersPage.js` - parsing correct de `response.data?.reminders`
- ✅ BUG FIX: Correction `referral.py` - recherche alternative par email si utilisateur non trouvé par id
- ✅ AMÉLIORATION: `PageHeader.js` utilise maintenant `navigate(-1)` par défaut pour un retour contextuel

## 2026-03-31 (Session 1)
- ✅ BUG FIX: Suppression de page fonctionne maintenant (long press sur zone vide)
- ✅ FEATURE: Épingles ajoutées sur JourneyStepsPage (bouton sur chaque section)
- ✅ BUG FIX: Croix de suppression apparaît seulement après appui long sur les cartes dupliquées

## 2026-03-30
- ✅ Carte de rappels (`UpcomingRemindersCard`) visible sur TOUTES les pages (pas seulement la page principale)
- ✅ Renommage "Page Socle" → "Page principale" (terminologie plus intuitive)
- ✅ Nouveau composant `PushNotificationReminder.jsx` : rappel d'activation des notifications après 3 connexions
- ✅ Vérification visuelle de la réforme 2026 (congés parentaux)
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
- `/app/frontend/src/pages/JourneyStepsPage.js` - Accordéon des sections (pilules)
- `/app/frontend/src/pages/SectionDetailPage.js` - Détail des sections (mosaïque)
- `/app/frontend/src/pages/RemindersPage.js` - Page des rappels (grossesse)
- `/app/frontend/src/components/PageHeader.js` - Header avec bouton retour contextuel
- `/app/frontend/src/pages/ParentalLeavePage.js`
- `/app/frontend/src/components/home/UpcomingRemindersCard.jsx`
- `/app/frontend/src/components/home/CustomizableHome.jsx`
- `/app/frontend/src/components/home/TopBar.jsx`
- `/app/frontend/src/components/home/DragDropComponents.jsx`
- `/app/frontend/src/contexts/HomeLayoutContext.js`
- `/app/backend/routes/user_layout.py`
- `/app/backend/routes/referral.py`

## Areas to Watch
- `CustomizableHome.jsx` et `HomeLayoutContext.js` deviennent denses (Drag&Drop, touch events, swipes, long press)

## Credentials for Testing
- Test account: Créer via `/api/auth/register`
- Admin: `cyrilalepsa@gmail.com`
