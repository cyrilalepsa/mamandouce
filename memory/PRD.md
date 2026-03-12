# MamanDouce - Product Requirements Document

## Original Problem Statement
Application recensant tous les aliments consommables pour les femmes enceintes avec:
- Page d'accueil avec dégradé bleu ciel → rose (diagonal)
- Logo calligraphique "MamanDouce"
- Boutons d'accès CAF, Ameli, Mairie (avec icône Maps)
- Calculateurs d'ovulation, date de grossesse, date d'accouchement (durée de cycle 24-34 jours)
- Scanner de produits par nom, code-barres manuel ou scan caméra
- Bibliothèque alimentaire complète avec recherche
- Historique de recherche
- Système de favoris avec alertes personnalisées
- Suivi des rendez-vous médicaux avec notes personnelles

## Architecture Technique
- **Frontend**: React.js + Tailwind CSS + Shadcn/UI + Capacitor (PWA/Mobile)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Payments**: Stripe (paiement unique 25€)
- **Email**: Resend (notifications)
- **Barcode Scanner**: html5-qrcode (frontend)

## Completed Features (March 2026)

### Core Features
- [x] Authentification utilisateur (inscription/connexion JWT)
- [x] Page d'accueil avec dégradé diagonal bleu→rose, catégories Alimentation/Grossesse
- [x] **Logo calligraphique "MamanDouce"** - Style Dancing Script avec dégradé rose vif
- [x] Liens vers services administratifs (CAF, Ameli, Mairie avec icône Maps)
- [x] Calculateur de grossesse (ovulation, conception, accouchement) - **Durée de cycle 24-34 jours**
- [x] Scanner d'aliments (recherche par nom, code-barres manuel, **scan caméra**)
- [x] **Bibliothèque alimentaire** - 192 aliments référencés, recherche et filtres
- [x] **Ajout d'aliments par utilisateurs** - Proposition d'aliments non répertoriés
- [x] Historique de recherche fonctionnel
- [x] Conseils hebdomadaires (41 semaines) avec démarches administratives
- [x] **Aliments favoris** - Sauvegarde et gestion des aliments favoris
- [x] **Alertes personnalisées** - Alertes basées sur les favoris et la semaine de grossesse
- [x] **Rendez-vous médicaux** - Calendrier complet des 20 rendez-vous avec rappels automatiques
- [x] **Notes de rendez-vous** - Suivi santé maman (poids, tension) et bébé (cœur, poids, taille)

### Interface & Design
- [x] Titres calligraphiques "Dancing Script" sur toutes les pages
- [x] Composant PageHeader réutilisable avec style unifié
- [x] Dégradé rose vif (rose-400 → pink-400 → coral-400) pour les titres

### Monetization & Premium
- [x] Système de paiement Stripe (25€ paiement unique, sans renouvellement auto)
- [x] Page pricing avec comparatif gratuit/premium
- [x] Gestion des abonnements

### Technical
- [x] PWA avec service worker + Capacitor (Google Play Store ready)
- [x] Système de notifications email (Resend)
- [x] Préférences de notification

## Fonctionnalités supprimées (à la demande utilisateur)
- Disque de grossesse interactif
- Évolution de l'embryon avec images

## API Endpoints
### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Pregnancy
- `POST /api/pregnancy/calculate` - Calcul dates grossesse (avec cycle_duration)
- `GET /api/pregnancy/profile` - Profil grossesse

### Food & Scanner
- `POST /api/scan/barcode` - Scan code-barres
- `POST /api/scan/search` - Recherche aliment
- `GET /api/food-library` - Bibliothèque complète avec pagination/filtres
- `POST /api/user-added-foods` - Proposer un nouvel aliment
- `GET /api/user-added-foods` - Voir ses propositions

### History & Favorites
- `GET /api/history/search` - Historique recherches
- `POST /api/favorites` - Ajouter un favori
- `GET /api/favorites` - Liste des favoris
- `DELETE /api/favorites/{food_name}` - Supprimer un favori
- `GET /api/alerts/personalized` - Alertes personnalisées

### Medical
- `GET /api/medical/appointments` - Tous les rendez-vous médicaux
- `GET /api/medical/upcoming` - Rendez-vous à venir
- `POST /api/medical/complete/{id}` - Marquer rendez-vous complété
- `DELETE /api/medical/complete/{id}` - Annuler complétion
- `POST /api/medical/notes/{id}` - Sauvegarder notes de rendez-vous
- `GET /api/medical/notes` - Toutes les notes utilisateur

### Payments & Email
- `POST /api/payments/checkout/session` - Créer session Stripe
- `POST /api/email/send-reminder` - Envoyer rappel email

## Database Schema
### MongoDB Collections
- `users`: {id, email, name, hashed_password, subscription_status}
- `pregnancy_profiles`: {id, user_id, last_period_date, cycle_duration, estimated_due_date, current_week}
- `search_history`: {id, user_id, query, result_type, created_at}
- `notifications`: {id, user_id, title, description, date, completed}
- `notification_preferences`: {id, user_id, email_notifications, weekly_tips}
- `favorites`: {id, user_id, name, status, reason, category, created_at}
- `completed_appointments`: {id, user_id, appointment_id, completed_at}
- `appointment_notes`: {id, user_id, appointment_id, weight, blood_pressure_*, baby_*, notes, doctor_name}
- `user_added_foods`: {id, user_id, name, barcode, status, safe_for_pregnancy, category, notes}

## Key Files
- `/app/backend/server.py` - API principale
- `/app/backend/data/food_database.py` - Base 192 aliments
- `/app/frontend/src/components/AppTitle.js` - Titre calligraphique
- `/app/frontend/src/components/PageHeader.js` - En-tête de page
- `/app/frontend/src/pages/FoodLibraryPage.js` - Bibliothèque alimentaire
- `/app/frontend/src/pages/FoodScanner.js` - Scanner avec modal d'ajout

## Known Limitations
- Stripe et Resend nécessitent des clés API configurées
- Scan caméra dépend de la permission navigateur
- pyzbar optionnel côté backend (pas bloquant)

## Backlog / Future Tasks (P2)
- [ ] Graphiques de suivi de la grossesse (poids mère, croissance bébé)
- [ ] Administration des aliments proposés par utilisateurs
- [ ] Mode hors-ligne complet
- [ ] Notifications push

## Session Summary (12 Mars 2026)
1. **Style calligraphique** - Ajout de la police Dancing Script, composants AppTitle et PageHeader avec dégradé rose vif
2. **Bibliothèque alimentaire** - Page complète avec 192 aliments, recherche, filtres par catégorie/statut, pagination
3. **Ajout d'aliments utilisateur** - Modal d'ajout accessible depuis scanner et bibliothèque
4. **Navigation** - Bouton "Bibliothèque" ajouté sur la page d'accueil (catégorie Alimentation)
