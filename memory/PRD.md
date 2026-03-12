# MamanDouce - Product Requirements Document

## Original Problem Statement
Application recensant tous les aliments consommables pour les femmes enceintes avec:
- Page d'accueil avec dégradé bleu ciel → rose (diagonal)
- Logo calligraphique "MamanDouce"
- Boutons d'accès CAF, Ameli, Mairie
- Calculateurs d'ovulation, date de grossesse, date d'accouchement
- Scanner de produits par nom ou code-barres
- Disque de grossesse interactif
- Historique de recherche
- Évolution de l'embryon avec images

## Architecture Technique
- **Frontend**: React.js + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Payments**: Stripe (paiement unique 25€)
- **Email**: Resend (notifications)
- **PWA**: Service Worker pour accès hors-ligne

## Completed Features (March 2026)

### Core Features
- [x] Authentification utilisateur (inscription/connexion JWT)
- [x] Page d'accueil avec dégradé diagonal bleu→rose
- [x] Logo calligraphique "MamanDouce"
- [x] Liens vers services administratifs (CAF, Ameli, Mairie)
- [x] Calculateur de grossesse (ovulation, conception, accouchement)
- [x] Scanner d'aliments (recherche par nom ou code-barres)
- [x] Base de données alimentaire enrichie
- [x] Disque de grossesse interactif
- [x] Historique de recherche fonctionnel
- [x] Suivi évolution embryon avec images IA (6 images)
- [x] Conseils hebdomadaires (41 semaines)
- [x] Démarches administratives par semaine
- [x] **Aliments favoris** - Sauvegarde et gestion des aliments favoris
- [x] **Alertes personnalisées** - Alertes basées sur les favoris et la semaine de grossesse

### Monetization & Premium
- [x] Système de paiement Stripe (25€ paiement unique, sans renouvellement auto)
- [x] Page pricing avec comparatif gratuit/premium
- [x] Gestion des abonnements

### Technical
- [x] PWA avec service worker
- [x] Système de notifications email (Resend - scaffolded)
- [x] Préférences de notification

## API Endpoints
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/pregnancy/calculate` - Calcul dates grossesse
- `GET /api/pregnancy/profile` - Profil grossesse
- `POST /api/scan/barcode` - Scan code-barres
- `POST /api/scan/search` - Recherche aliment
- `GET /api/history/search` - Historique recherches
- `GET /api/tips/weekly/{week}` - Conseils hebdomadaires
- `POST /api/payments/create-checkout-session` - Créer session Stripe
- `POST /api/favorites` - Ajouter un favori
- `GET /api/favorites` - Liste des favoris
- `DELETE /api/favorites/{food_name}` - Supprimer un favori
- `GET /api/alerts/personalized` - Alertes personnalisées

## Database Schema
### MongoDB Collections
- `users`: {id, email, name, hashed_password, subscription_status}
- `pregnancy_profiles`: {id, user_id, last_period_date, estimated_due_date, current_week}
- `search_history`: {id, user_id, query, result_type, created_at}
- `notifications`: {id, user_id, title, description, date, completed}
- `notification_preferences`: {id, user_id, email_notifications, weekly_tips}
- `favorites`: {id, user_id, name, status, reason, category, created_at}

## Key Files
- `/app/backend/server.py` - API principale
- `/app/backend/routes/payments.py` - Endpoints Stripe
- `/app/backend/data/weekly_tips.py` - Données conseils hebdo
- `/app/backend/data/food_database.py` - Base aliments
- `/app/frontend/src/App.js` - Routing React
- `/app/frontend/src/pages/` - Toutes les pages

## Known Limitations
- Stripe et Resend nécessitent des clés API valides (actuellement en mode test)
- Images embryon générées par IA (6 images disponibles)

## Backlog / Future Tasks
- [ ] Enrichir la base de données alimentaire
- [ ] Ajouter plus d'images d'évolution embryonnaire
- [ ] Fonctionnalité de partage des conseils
- [ ] Mode hors-ligne complet
- [ ] Notifications push
