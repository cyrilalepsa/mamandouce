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

### Features Ajoutées (15 Mars 2026 - P2 & Backlog)

- [x] **Refactoring AdminPage.js**
  - Code réduit de 1053 lignes à 272 lignes (-74%)
  - 6 sous-composants créés dans `/app/frontend/src/components/admin/`
  - Composants: DashboardTab, UsersTab, MessagesTab, FoodsTab, CodesTab, RefundsTab

- [x] **Gestion multi-admins**
  - Tout admin peut promouvoir un utilisateur en admin
  - Tout admin peut révoquer les droits admin d'un autre utilisateur
  - Protection: impossible de se retirer ses propres droits admin
  - Endpoint: `POST /api/admin/user/{user_id}/set-role?role=admin|user`

- [x] **Endpoints manquants corrigés**
  - `GET /api/notifications/preferences` - Récupérer les préférences de notification
  - `POST /api/notifications/preferences` - Mettre à jour les préférences
  - `GET /api/subscription-status` - Statut d'abonnement complet

- [x] **Mode hors-ligne (Service Worker)**
  - Cache des assets statiques
  - Cache des données API (tips, foods, appointments)
  - Page offline.html pour les utilisateurs déconnectés
  - Background sync pour synchroniser les actions hors-ligne

- [x] **Authentification 2FA par email (optionnelle)**
  - Activation/désactivation dans les paramètres
  - Code à 6 chiffres envoyé par email
  - Expiration du code après 10 minutes
  - Maximum 3 tentatives de saisie
  - Endpoints: `/api/auth/2fa/status`, `/api/auth/2fa/toggle`, `/api/auth/2fa/request-code`, `/api/auth/2fa/verify`

### Features Ajoutées (15 Mars 2026 - Matin)
- [x] **Modification du mot de passe**
- [x] **Blocage du compte après 4 tentatives**
- [x] **Modification de l'adresse email**
- [x] **Refactoring SettingsPage.js** (1050 → 158 lignes, -85%)

### Features Ajoutées (14 Mars 2026)
- [x] **Check-list Sac de maternité**
- [x] **Suivi Post-partum**
- [x] **Système de parrainage**
- [x] **Nouvelles offres d'abonnement**
- [x] **Système de remboursement (fausse couche)**
- [x] **Correction pages blanches**

## API Endpoints

### Auth (15 Mars 2026)
- `POST /api/auth/update-password` - Modifier le mot de passe
- `POST /api/auth/update-email` - Modifier l'adresse email
- `POST /api/auth/end-premium` - Terminer l'abonnement premium
- `GET /api/auth/2fa/status` - Statut 2FA
- `POST /api/auth/2fa/toggle` - Activer/désactiver 2FA
- `POST /api/auth/2fa/request-code?email=...` - Demander un code 2FA
- `POST /api/auth/2fa/verify` - Vérifier un code 2FA

### Admin (15 Mars 2026)
- `POST /api/admin/user/{user_id}/set-role?role=admin|user` - Promouvoir/révoquer admin

### Preferences (15 Mars 2026)
- `GET /api/notifications/preferences` - Préférences de notification
- `POST /api/notifications/preferences` - Mise à jour préférences
- `GET /api/subscription-status` - Statut d'abonnement complet

## Database Collections
- `users` - Ajout: `two_factor_enabled`, `role`, `role_changed_by`, `role_changed_at`
- `two_factor_codes` - Codes 2FA temporaires
- `notification_preferences` - Préférences de notification par utilisateur

## Credentials Admin
- **Email**: cyrilalepsa@gmail.com
- **Password**: Cyc@dmin9630
- **Role in DB**: `admin`

## Code Architecture
```
/app/frontend/src/
├── components/
│   ├── admin/           # 6 composants admin
│   │   ├── DashboardTab.jsx
│   │   ├── UsersTab.jsx
│   │   ├── MessagesTab.jsx
│   │   ├── FoodsTab.jsx
│   │   ├── CodesTab.jsx
│   │   └── RefundsTab.jsx
│   └── settings/        # 8 composants settings
│       ├── PromoCodeSection.jsx
│       ├── AccountSection.jsx
│       ├── PasswordSection.jsx
│       ├── TwoFactorSection.jsx
│       ├── ReferralSection.jsx
│       ├── RefundSection.jsx
│       ├── PostpartumStatusSection.jsx
│       └── NotificationsSection.jsx
├── pages/
│   ├── AdminPage.js     # 272 lignes (refactorisé)
│   └── SettingsPage.js  # 158 lignes (refactorisé)
└── public/
    ├── sw.js            # Service Worker
    └── offline.html     # Page hors-ligne
```

## Future Tasks (Backlog)
- **(P1)** Graphiques de suivi grossesse (poids, croissance)
- **(P3)** Déploiement Google Play Store

## Testing Status
- Backend: 100% fonctionnel (16/16 tests iteration 5)
- Frontend: 100% fonctionnel
- Dernière exécution: 15 Mars 2026

## 3rd Party Integrations
- **Stripe** (Paiements)
- **Resend** (Emails)
- **Gemini Nano Banana** (Génération d'images) via Emergent LLM Key
- **Capacitor** (Mobile)
