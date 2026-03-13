# MamanDouce - Product Requirements Document

## Original Problem Statement
Application pour les femmes enceintes avec :
- Scanner d'aliments (caméra + manuel)
- Calculateur de grossesse avec dates clés
- Conseils hebdomadaires et suivi médical
- Liste de naissance partageable
- Liens vers services administratifs et ressources
- Système d'abonnement Premium (27€/an)
- Page d'administration complète avec messagerie
- Notifications push

## Architecture Technique
- **Frontend**: React.js + Tailwind CSS + Shadcn/UI + Capacitor (PWA/Mobile)
- **Backend**: FastAPI (Python) - **REFACTORED** en modules
- **Database**: MongoDB
- **Payments**: Stripe (27€/an non-tacite)
- **Email**: Resend
- **Push Notifications**: Web Push API + pywebpush

## Backend Architecture (Refactored - Mars 2026)
```
/app/backend/
├── core/
│   ├── __init__.py      # Exports
│   ├── config.py        # Configuration (secrets, keys)
│   ├── database.py      # MongoDB connection
│   └── security.py      # Auth, JWT, password
├── models/
│   ├── __init__.py      # Exports
│   └── schemas.py       # All Pydantic models
├── routes/
│   ├── __init__.py      # Exports
│   ├── admin.py         # Admin endpoints (users, codes, foods, messages)
│   └── payments.py      # Stripe payments
├── data/
│   └── food_database.py # Food data
└── server.py            # Main app (still contains most endpoints)
```

## Completed Features (Mars 2026)

### Interface & Design
- [x] Logo "MamanDouce" en Dancing Script avec dégradé rose
- [x] Nom utilisateur en police **Caveat**
- [x] Badge Emergent ultra-discret

### Page d'accueil
- [x] Services & Ressources : CAF, Ameli, Maternelles TV, Maps

### Calculateur de grossesse
- [x] Toutes les dates clés (conception, ovulation, nidation, accouchement)
- [x] Conseils médicaux par trimestre

### Scanner d'aliments
- [x] Scan caméra + recherche + saisie manuelle
- [x] Bibliothèque 192 aliments
- [x] Ajout d'aliments par utilisateurs

### Liste de naissance
- [x] Création, partage, réservation

### Suivi médical
- [x] 20 RDV médicaux, notes personnelles

### Conseils hebdomadaires
- [x] 41 semaines de conseils

### Page d'Administration
- [x] Onglet Utilisateurs (beta testeuse/premium/gratuit)
- [x] Onglet Messages avec réponse + email + push
- [x] Onglet Aliments (validation)
- [x] Onglet Codes Promo

### Système de Contact
- [x] Formulaire de contact
- [x] Réponse admin par email
- [x] Historique des échanges côté utilisateur

### Notifications Push (NOUVEAU - Mars 2026)
- [x] Web Push API avec VAPID
- [x] Abonnement/désabonnement depuis Profil
- [x] Notification automatique lors réponse admin
- [x] Service Worker configuré

### Fonctionnalités annexes
- [x] Historique, favoris, rappels
- [x] Paiement Stripe (27€/an)
- [x] Codes promo à usage unique
- [x] Emails Resend

## API Endpoints

### Auth & User
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

### Pregnancy
- `POST /api/pregnancy/calculate`

### Food
- `POST /api/scan/barcode`, `POST /api/scan/search`
- `GET /api/food-library`, `POST /api/user-added-foods`

### Birth List
- `GET/POST /api/birth-list`, `POST/DELETE /api/birth-list/items`
- `GET /api/birth-list/shared/{share_id}` (public)

### Admin
- `GET /api/admin/users`, `GET /api/admin/pending-foods`
- `POST /api/admin/food-status/{id}`, `GET /api/admin/messages`
- `POST /api/admin/messages/{id}/read`, `POST /api/admin/messages/{id}/reply`
- `POST /api/admin/generate-codes`, `GET /api/admin/promo-codes`

### Contact
- `POST /api/contact/send`, `GET /api/contact/my-messages`

### Notifications (NOUVEAU)
- `GET /api/notifications/vapid-public-key`
- `POST /api/notifications/subscribe`
- `POST /api/notifications/unsubscribe`

## Database Collections
- `users`, `pregnancy_profiles`, `search_history`, `favorites`
- `notifications`, `notification_preferences`
- `completed_appointments`, `appointment_notes`
- `user_added_foods`, `birth_lists`
- `promo_codes`, `admin_messages`
- `push_subscriptions` (NOUVEAU)

## Credentials Admin
- **Email**: cyrilalepsa@gmail.com
- **Password**: Cyc@dmin9630
- **API Secret**: Cyca-admin2026

## Known Limitations
- Stripe/Resend nécessitent clés API
- Scan caméra dépend permission navigateur
- Push notifications nécessitent HTTPS et permission utilisateur

## Session Summary (13 Mars 2026)
1. **Notifications Push** implémentées avec Web Push API
2. **Refactoring partiel** de server.py en modules (core/, models/, routes/)
3. **Abonnement notifications** depuis page Profil
4. **Notification automatique** quand admin répond à un message

## Future Tasks (Backlog)
- **(P2)** Graphiques de suivi grossesse
- **(P2)** Mode hors-ligne complet
- **(P3)** Continuer le refactoring (déplacer plus d'endpoints vers routes/)
