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
- **Backend**: FastAPI (Python) - **FULLY REFACTORED**
- **Database**: MongoDB
- **Payments**: Stripe (27€/an non-tacite)
- **Email**: Resend
- **Push Notifications**: Web Push API + pywebpush

## Backend Architecture (Refactored - 13 Mars 2026)

### Avant
- `server.py` : 1845 lignes (monolithique)

### Après
- `server.py` : **78 lignes** (point d'entrée uniquement)
- Architecture modulaire complète

```
/app/backend/
├── server.py              # Point d'entrée (78 lignes)
├── core/
│   ├── __init__.py        # Exports
│   ├── config.py          # Configuration (secrets, keys, email)
│   ├── database.py        # MongoDB connection
│   └── security.py        # Auth, JWT, password hashing
├── models/
│   ├── __init__.py        # Exports
│   └── schemas.py         # Tous les modèles Pydantic
├── routes/
│   ├── __init__.py        # Exports
│   ├── auth.py            # Register, Login, Me
│   ├── pregnancy.py       # Calculate, Profile
│   ├── food.py            # Scan, Search, Library, Favorites
│   ├── medical.py         # Appointments, Notes, Health summary
│   ├── birth_list.py      # Birth list, Items, Sharing
│   ├── admin.py           # Users, Codes, Foods, Messages
│   ├── contact.py         # User messages
│   ├── push_notifications.py  # VAPID, Subscribe
│   └── payments.py        # Stripe
└── data/
    └── food_database.py   # 192 aliments
```

## Completed Features (Mars 2026)

### Interface & Design
- [x] Logo "MamanDouce" en Dancing Script
- [x] Nom utilisateur en police Caveat
- [x] Badge Emergent ultra-discret

### Page d'accueil
- [x] Services & Ressources : CAF, Ameli, Maternelles TV, Maps

### Calculateur de grossesse
- [x] Toutes les dates clés
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
- [x] **Onglet Dashboard** (NOUVEAU) avec compteurs :
  - Visites totales
  - Inscriptions
  - Premium (payants)
  - Bêta testeuses
  - Utilisateurs gratuits
  - Messages non lus
  - Aliments en attente
  - Résumé (taux premium, codes)
- [x] **Notifications push admin** quand :
  - Nouvelle inscription
  - Nouveau message
- [x] Onglet Utilisateurs (beta testeuse/premium/gratuit)
- [x] Onglet Messages avec réponse + email + push
- [x] Onglet Aliments (validation)
- [x] Onglet Codes Promo

### Système de Contact
- [x] Formulaire de contact
- [x] Réponse admin par email
- [x] Historique des échanges côté utilisateur

### Notifications Push
- [x] Web Push API avec VAPID
- [x] Abonnement/désabonnement depuis Profil
- [x] Notification automatique lors réponse admin

### Fonctionnalités annexes
- [x] Historique, favoris, rappels
- [x] Paiement Stripe (27€/an)
- [x] Codes promo à usage unique
- [x] Emails Resend

## API Endpoints (par module)

### auth.py
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### pregnancy.py
- `POST /api/pregnancy/calculate`
- `GET /api/pregnancy/profile`

### food.py
- `POST /api/scan/barcode`
- `POST /api/scan/search`
- `GET /api/foods/safe`
- `GET /api/food-library`
- `POST /api/user-added-foods`
- `GET /api/user-added-foods`
- `GET /api/history/search`
- `POST /api/favorites`
- `GET /api/favorites`
- `DELETE /api/favorites/{food_name}`
- `GET /api/favorites/check/{food_name}`

### medical.py
- `GET /api/medical/appointments`
- `GET /api/medical/upcoming`
- `POST /api/medical/complete/{id}`
- `DELETE /api/medical/complete/{id}`
- `POST /api/medical/notes/{id}`
- `GET /api/medical/notes/{id}`
- `GET /api/medical/notes`
- `GET /api/medical/health-summary`

### birth_list.py
- `GET /api/birth-list`
- `POST /api/birth-list`
- `POST /api/birth-list/items`
- `DELETE /api/birth-list/items/{id}`
- `GET /api/birth-list/shared/{share_id}` (public)
- `POST /api/birth-list/shared/{share_id}/items/{id}/toggle` (public)

### admin.py
- `POST /api/admin/generate-codes`
- `GET /api/admin/promo-codes`
- `GET /api/admin/users`
- `GET /api/admin/pending-foods`
- `POST /api/admin/food-status/{id}`
- `GET /api/admin/messages`
- `POST /api/admin/messages/{id}/read`
- `POST /api/admin/messages/{id}/reply`

### contact.py
- `POST /api/contact/send`
- `GET /api/contact/my-messages`

### push_notifications.py
- `GET /api/notifications/vapid-public-key`
- `POST /api/notifications/subscribe`
- `POST /api/notifications/unsubscribe`

### payments.py
- `POST /api/create-checkout-session`
- `POST /api/webhook/stripe`

## Database Collections
- `users`, `pregnancy_profiles`, `search_history`, `favorites`
- `notifications`, `notification_preferences`
- `completed_appointments`, `appointment_notes`
- `user_added_foods`, `birth_lists`
- `promo_codes`, `admin_messages`
- `push_subscriptions`

## Credentials Admin
- **Email**: cyrilalepsa@gmail.com
- **Password**: Cyc@dmin9630
- **Role in DB**: `admin` (champ `role` dans collection `users`)

## Session Summary (13 Mars 2026)
1. **Notifications Push** - Web Push API avec VAPID
2. **Refactoring COMPLET du backend** :
   - server.py : 1845 → 78 lignes
   - 9 fichiers de routes modulaires
   - Core (config, database, security)
   - Models (schemas)
3. Tous les tests passent après refactoring

## Session Update (13 Mars 2026 - v2)
1. **UI Admin Dashboard** - Icônes compteurs réduites (`w-3 h-3`) et transparentes (`opacity-30`)
2. **P3 Complété - Gestion du rôle admin** :
   - Ajout champ `role` ("user"/"admin") au modèle User
   - Création fonction `get_admin_user` dans security.py
   - Routes admin utilisent maintenant l'authentification JWT (plus de `admin_secret` dans l'URL)
   - Migration effectuée : admin a `role: "admin"` en BDD
   - Compatibilité arrière maintenue (fallback sur email)

## Future Tasks (Backlog)
- **(P2)** Graphiques de suivi grossesse
- **(P2)** Mode hors-ligne complet
