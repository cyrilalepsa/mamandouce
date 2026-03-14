# MamanDouce - Product Requirements Document

## Original Problem Statement
Application pour les femmes enceintes avec :
- Scanner d'aliments (caméra + manuel)
- Calculateur de grossesse avec dates clés
- Conseils hebdomadaires et suivi médical
- Liste de naissance partageable
- Liens vers services administratifs et ressources
- Système d'abonnement Premium (27€/9 mois)
- Page d'administration complète avec messagerie
- Notifications push

## Architecture Technique
- **Frontend**: React.js + Tailwind CSS + Shadcn/UI + Capacitor (PWA/Mobile)
- **Backend**: FastAPI (Python) - **FULLY REFACTORED**
- **Database**: MongoDB
- **Payments**: Stripe (27€/9 mois sans renouvellement auto)
- **Email**: Resend
- **Push Notifications**: Web Push API + pywebpush

## Backend Architecture

```
/app/backend/
├── server.py              # Point d'entrée
├── core/
│   ├── config.py          # Configuration
│   ├── database.py        # MongoDB connection
│   └── security.py        # Auth, JWT
├── models/
│   └── schemas.py         # Modèles Pydantic
├── routes/
│   ├── auth.py            # Register, Login, Me
│   ├── pregnancy.py       # Calculate, Profile
│   ├── food.py            # Scan, Search, Library
│   ├── medical.py         # Appointments, Notes
│   ├── birth_list.py      # Birth list, Sharing
│   ├── admin.py           # Users, Codes, Foods, Messages
│   ├── contact.py         # User messages
│   ├── push_notifications.py  # VAPID, Subscribe
│   ├── payments.py        # Stripe
│   ├── tips.py            # Weekly tips
│   ├── postpartum.py      # Maternity bag & Postpartum content
│   └── referral.py        # Referral system (NEW)
└── data/
    └── food_database.py   # 192 aliments
```

## Completed Features

### Core Features
- [x] Calculateur de grossesse avec dates clés
- [x] Scanner d'aliments (caméra + manuel)
- [x] Bibliothèque 192 aliments
- [x] Liste de naissance partageable
- [x] 41 semaines de conseils hebdomadaires
- [x] Suivi médical (20 RDV)
- [x] Calendrier de fertilité avancé (5 ans vacances/fériés, 6 mois prédictions)
- [x] Système de paiement Stripe

### New Features (14 Mars 2026)
- [x] **Check-list Sac de maternité**
  - 32 articles par défaut (Pour maman, Pour bébé, Pour le retour)
  - Cases à cocher interactives avec persistence
  - Barre de progression
  - Système de suggestions (soumis à validation admin)
  - Notification admin avec catégorie "[Sac maternité]"

- [x] **Suivi Post-partum**
  - 6 onglets de contenu (Rendez-vous, Difficultés, Allaitement, Lait infantile, Couches, Précautions)
  - 9 rendez-vous sur 6 mois (obligatoires + recommandés)
  - Conseils détaillés sur baby blues, dépression, allaitement, lait infantile
  - Guide des tailles de couches
  - Avertissement médical

- [x] **Système de parrainage**
  - Section dans les paramètres
  - 2 champs pour filleules (nom + email)
  - Barre de progression 0/2
  - Post-partum offert si 2 filleuls inscrits
  - Notifications admin avec catégorie "[Parrainage]"

- [x] **Nouvelles offres d'abonnement**
  - Premium: 27€/9 mois (grossesse)
  - Post-partum: 8€ (accessible après 6 mois d'abonnement)
  - Alternative: parrainage 2 amies = post-partum gratuit

### Interface & Design
- [x] Logo "MamanDouce" en Dancing Script
- [x] Réorganisation page d'accueil en 5 catégories:
  1. En route vers la grossesse
  2. Grossesse
  3. Préparer l'arrivée de bébé (avec Sac de maternité)
  4. Suivi post-partum (NOUVEAU)
  5. Services et ressources

### Administration
- [x] Dashboard avec compteurs
- [x] Notifications push admin (avec catégories)
- [x] Gestion utilisateurs, messages, aliments
- [x] Codes promo

## API Endpoints

### New Endpoints (14 Mars 2026)

#### postpartum.py
- `GET /api/maternity-bag` - Liste du sac de maternité
- `POST /api/maternity-bag/check` - Cocher/décocher un item
- `POST /api/maternity-bag/suggest` - Suggérer un article
- `GET /api/maternity-bag/suggestions` - Liste suggestions (admin)
- `POST /api/maternity-bag/approve` - Approuver/rejeter (admin)
- `GET /api/postpartum/content` - Contenu post-partum
- `GET /api/postpartum/appointments` - Rendez-vous post-partum

#### referral.py
- `GET /api/referral/status` - Statut des parrainages
- `POST /api/referral/submit` - Soumettre des parrainages
- `GET /api/referral/check-completion` - Vérifier si 2 complétés
- `GET /api/subscription/full-status` - Statut complet (premium + post-partum)
- `POST /api/subscription/purchase-postpartum` - Acheter post-partum

## Database Collections
- `users`, `pregnancy_profiles`, `search_history`, `favorites`
- `notifications`, `notification_preferences`
- `completed_appointments`, `appointment_notes`
- `user_added_foods`, `birth_lists`
- `promo_codes`, `admin_messages`
- `push_subscriptions`
- `maternity_bags` (NEW) - Listes de sac par utilisateur
- `maternity_bag_suggestions` (NEW) - Suggestions en attente
- `referrals` (NEW) - Parrainages

## Credentials Admin
- **Email**: cyrilalepsa@gmail.com
- **Password**: Cyc@dmin9630
- **Role in DB**: `admin`

## Future Tasks (Backlog)
- **(P2)** Gestion multi-admins depuis l'interface
- **(P2)** Graphiques de suivi grossesse (poids, croissance)
- **(P2)** Mode hors-ligne complet
- **(P3)** Déploiement Google Play Store

## Testing Status
- Backend: 100% (19/19 tests passés)
- Frontend: 100% (toutes les pages et interactions fonctionnelles)
- Dernière exécution: 14 Mars 2026

## 3rd Party Integrations
- **Stripe** (Paiements)
- **Resend** (Emails)
- **Gemini Nano Banana** (Génération d'images) via Emergent LLM Key
- **Capacitor** (Mobile)
