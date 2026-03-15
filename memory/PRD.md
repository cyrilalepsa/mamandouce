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

### Features Ajoutées (15 Mars 2026 - Après-midi)
- [x] **Refactoring AuthPage.js** (743 → 250 lignes, -66%)
  - 7 sous-composants créés dans `/app/frontend/src/components/auth/`
  - Composants: LoginForm, RegisterForm, TwoFactorInput, ForgotPasswordForm, BiometricPrompt, PinSetup, QuickLogin
  
- [x] **Refactoring HomePage.js** (892 → 200 lignes, -78%)
  - 5 sous-composants créés dans `/app/frontend/src/components/home/`
  - Composants: AgendaCard, PregnancyCards, NavigationSections, TopBar

- [x] **Graphiques de suivi de grossesse** (TrackingPage.js)
  - Courbe de poids de la mère avec graphique AreaChart (recharts)
  - Courbe de croissance du bébé (poids + taille) avec graphique LineChart
  - 4 cartes statistiques: Poids actuel, Prise de poids, Poids bébé, Taille bébé
  - Boutons pour ajouter des mesures manuellement
  - Nouvelle route: `/tracking`
  - Nouvelle carte "Graphiques" dans la section Grossesse de la page d'accueil

- [x] **Logique de fin de vie du compte post-partum**
  - Après 6 mois d'accouchement, le compte peut être archivé
  - Export des données utilisateur (JSON complet avec profil, notes médicales, favoris, etc.)
  - Option d'archivage anticipé
  - Endpoints: `/api/postpartum/account-status`, `/api/postpartum/export-data`, `/api/postpartum/archive-account`, `/api/postpartum/request-early-archive`

- [x] **UI - Réorganisation page Profil**
  - Statuts Premium et Post-partum en première position (juste après le titre "Mon profil")
  - Carte d'informations utilisateur déplacée après les statuts

- [x] **Corrections qualité code Python**
  - Remplacement des `bare except` par des exceptions spécifiques dans `/app/backend/routes/postpartum.py`

- [x] **Refactoring ProfilePage.js** (724 → 302 lignes, -58%)
  - 8 sous-composants créés dans `/app/frontend/src/components/profile/`
  - Composants: SubscriptionStatusCards, UserInfoCard, PregnancyCard, NotificationsCard, QuickLoginCard, FertilityRemindersCard, ContactCard, MessageHistoryCard

### Features Ajoutées (15 Mars 2026 - Session 6)

- [x] **Flux d'onboarding avec paywall**
  - Nouveau visiteur → Page de connexion/inscription
  - Après inscription → Redirection automatique vers page de choix d'abonnement
  - Sans abonnement → Pas d'accès au contenu (redirection vers choix)
  - Options: Gratuit (limité), Premium (27€), Post-partum (8€)
  - Utilisateurs avec abonnement → Accès direct à l'app
  - SubscriptionGate vérifie l'abonnement sur chaque page protégée

- [x] **Correction majuscules jours de la semaine**
  - "dimanche" → "Dimanche" quand le jour est en début de ligne
  - Appliqué dans AgendaCard et FertilityCalendar

- [x] **Service Worker v2.0.3 - Mise à jour automatique du cache**
  - Stratégie "Network First" pour toujours récupérer la dernière version
  - Suppression automatique des anciens caches
  - Rechargement automatique quand nouvelle version détectée
  - Plus besoin de vider le cache manuellement

### Features Ajoutées (15 Mars 2026 - Session 5)

- [x] **Fonction Favoris pour recettes**
  - Coeur cliquable sur chaque recette (rouge si favori, transparent sinon)
  - Filtre "Favoris" pour afficher uniquement les recettes sélectionnées
  - Persistance des favoris en base de données par utilisateur
  - API: `GET /api/postpartum/favorites`, `POST /api/postpartum/favorites/toggle`
  - Toast de confirmation "Recette ajoutée/retirée des favoris"

- [x] **Fonction Partage de recettes favorites**
  - Bouton "Partager" visible quand l'utilisateur a des favoris
  - Génération d'un lien unique de partage
  - Modale avec lien copiable et bouton de partage natif (mobile)
  - Page publique `/recipes/shared/:shareCode` accessible sans authentification
  - Vue détaillée des recettes partagées (ingrédients, étapes, vidéo)
  - CTA pour découvrir MamanDouce
  - API: `POST /api/postpartum/share-recipes`, `GET /api/postpartum/shared/:code`

- [x] **Refactoring COMPLET de PostpartumPage.js**
  - Code réduit de 1261 lignes à 533 lignes (-58%)
  - 9 sous-composants créés dans `/app/frontend/src/components/postpartum/`:
    - AppointmentsSection.jsx (121 lignes)
    - DifficultiesSection.jsx (124 lignes)
    - BreastfeedingSection.jsx (108 lignes)
    - FormulaSection.jsx (115 lignes)
    - DiapersSection.jsx (93 lignes)
    - BabywearingSection.jsx (81 lignes)
    - DiversificationSection.jsx (114 lignes)
    - RecipesSection.jsx (273 lignes) - inclut fonction favoris
    - PrecautionsSection.jsx (75 lignes)
  - Code plus maintenable et testable

- [x] **Correction bug hydratation React**
  - Résolu le problème de boutons imbriqués dans RecipesSection
  - Remplacement `<button>` par `<div>` pour le conteneur de recette

- [x] **Tests automatisés**
  - 100% backend tests passés (11/11)
  - 95% frontend tests passés
  - Fichier de test: `/app/backend/tests/test_postpartum_favorites.py`

### Features Ajoutées (15 Mars 2026 - Session 4)
- [x] **Section Difficultés améliorée**
  - Affichage des conseils pratiques pour chaque difficulté
  - Liens vidéo explicatives intégrés
  - Ressources utiles (numéros de téléphone, sites web)
  - Bloc "Quand consulter ?" bien visible
  
- [x] **Section Précautions enrichie**
  - Descriptions détaillées pour chaque précaution
  - Nouveau bloc "Pourquoi c'est important ?" avec explications
  - Liens vidéo pour certaines précautions (couchage sécurisé, signes d'alerte)
  - 4 catégories: Couchage sécurisé, Hygiène et protection, Signes d'alerte bébé, Récupération maman

- [x] **Recettes réorganisées en sommaire cliquable**
  - Interface sommaire avec navigation par catégorie
  - Tri alphabétique des recettes dans chaque catégorie
  - 8 catégories colorées: Légumes, Fruits, Viandes, Poissons, Légumineuses, Œufs, Féculents, Desserts
  - Vue détaillée de la recette au clic (ingrédients, étapes numérotées, conseils, vidéo)
  - Filtres par catégorie fonctionnels
  - 40 recettes au total
  - Conseils de cuisine collapsibles

### Features Ajoutées (15 Mars 2026 - Session 3)
- [x] **Nouvelle icône PWA** avec logo et texte "MamanDouce"
- [x] **Bannière installation PWA** pour faciliter l'ajout sur l'écran d'accueil
- [x] **Contenu Post-partum enrichi**
  - Section Portage bébé (5 types de porte-bébé avec vidéos YouTube)
  - Section Diversification alimentaire (3 étapes, aliments interdits, premiers légumes/fruits)
  - Section Recettes bébé (8 recettes de purées avec vidéos)
  - Tous avec liens vidéo YouTube
- [x] **Admin - Bouton "Tout débloquer"** pour donner Premium + Post-partum en un clic
- [x] **Admin - Bouton "Voir comme utilisateur"** pour basculer vers l'interface utilisateur
- [x] **Error Boundary global** pour éviter les écrans d'erreur avec du code
- [x] **Amélioration gestion erreur "J'ai accouché"** - Meilleure gestion si l'utilisateur n'a pas de premium

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
│   ├── auth/            # 7 composants auth (NOUVEAU)
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── TwoFactorInput.jsx
│   │   ├── ForgotPasswordForm.jsx
│   │   ├── BiometricPrompt.jsx
│   │   ├── PinSetup.jsx
│   │   └── QuickLogin.jsx
│   ├── home/            # 5 composants home (NOUVEAU)
│   │   ├── AgendaCard.jsx
│   │   ├── PregnancyCards.jsx
│   │   ├── NavigationSections.jsx
│   │   └── TopBar.jsx
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
│   ├── AuthPage.js      # 250 lignes (refactorisé)
│   ├── HomePage.js      # 200 lignes (refactorisé)
│   ├── SettingsPage.js  # 158 lignes (refactorisé)
│   └── TrackingPage.js  # 538 lignes (NOUVEAU)
└── public/
    ├── sw.js            # Service Worker
    └── offline.html     # Page hors-ligne
```

## Future Tasks (Backlog)
- **(P2)** Déploiement Google Play Store : Finaliser le build Capacitor et préparer la publication

## Testing Status
- Backend: 100% fonctionnel (iteration 7)
- Frontend: 100% fonctionnel (iteration 7 - toutes les pages vérifiées)
- Dernière exécution: 15 Mars 2026

## Corrections effectuées (15 Mars 2026 - après-midi)
- [x] **Page guide (/guide)** - Nouvelle page de bienvenue avec tutoriel interactif
- [x] **Notification de bienvenue** - Email + push notification pour les nouveaux utilisateurs
- [x] **Endpoints CRUD /api/notifications** - Rappels personnalisés (GET, POST, PUT, DELETE)
- [x] **Liens GuidePage corrigés** - Routes mises à jour (/calculator, /scanner, /medical)
- [x] **Flow 2FA amélioré** - Validation mot de passe avant envoi du code 2FA

## Chatbot IA (15 Mars 2026 - soir)
- [x] **MamanDouce AI** - Chatbot intelligent alimenté par GPT-4o-mini
  - Questions sur l'alimentation, symptômes, démarches administratives
  - Historique des conversations avec sessions
  - 6 suggestions de questions prédéfinies
  - Ton chaleureux et bienveillant
  - Disclaimer médical
  - **Bulle flottante discrète** en bas à droite (au lieu d'une page dédiée)
  - Fenêtre de chat compacte avec minimisation

## Modifications UX (15 Mars 2026 - soir)
- [x] **Section "Informations de grossesse"** dans Paramètres (pour premium)
  - Bouton "J'ai accouché" avec icône bébé
  - Confirmation de la date d'accouchement
  - Fin du premium et déblocage du post-partum

- [x] **Offre Post-partum (8€) clarifiée**
  - Badge "Achat possible à tout moment"
  - 4 étapes pour débloquer le contenu expliquées
  - Référence à Profil → Informations de grossesse

### API Endpoints Chatbot
- `POST /api/chatbot/message` - Envoyer un message et recevoir une réponse
- `GET /api/chatbot/history` - Historique des conversations
- `DELETE /api/chatbot/session/{id}` - Supprimer une conversation
- `GET /api/chatbot/suggestions` - Questions suggérées

## 3rd Party Integrations
- **Stripe** (Paiements)
- **Resend** (Emails)
- **Gemini Nano Banana** (Génération d'images) via Emergent LLM Key
- **Capacitor** (Mobile)
