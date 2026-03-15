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

### Features Ajoutées (15 Mars 2026)
- [x] **Modification du mot de passe**
  - Section dédiée dans les paramètres
  - Vérification du mot de passe actuel obligatoire
  - Validation : minimum 6 caractères
  - Confirmation du nouveau mot de passe
  - Endpoint: `POST /api/auth/update-password`

- [x] **Blocage du compte après 4 tentatives**
  - Compteur de tentatives échouées par compte
  - Message indiquant le nombre de tentatives restantes
  - Blocage de 30 minutes après 4 échecs (code HTTP 423)
  - Message de durée de blocage affiché
  - Réinitialisation automatique après connexion réussie

- [x] **Modification de l'adresse email**
  - Section "Mon compte" dans les paramètres
  - Vérification que l'email n'est pas déjà utilisé
  - Endpoint: `POST /api/auth/update-email`

- [x] **Refactoring SettingsPage.js**
  - Code réduit de 1050 lignes à 154 lignes
  - Sous-composants extraits dans `/app/frontend/src/components/settings/`
  - Composants: PromoCodeSection, AccountSection, PasswordSection, ReferralSection, RefundSection, PostpartumStatusSection, NotificationsSection

### Features Ajoutées (14 Mars 2026)
- [x] **Check-list Sac de maternité**
  - 32 articles par défaut (Pour maman, Pour bébé, Pour le retour)
  - Cases à cocher interactives avec persistence
  - Barre de progression
  - Système de suggestions avec notification admin catégorisée "[Sac maternité]"

- [x] **Suivi Post-partum**
  - 6 onglets de contenu (Rendez-vous, Difficultés, Allaitement, Lait infantile, Couches, Précautions)
  - 9 rendez-vous sur 6 mois (obligatoires + recommandés)
  - Avertissement médical
  - **Date d'accouchement** à saisir au 7ème mois (semaine 28+)
  - **Rappels automatiques** 7 jours et 3 jours avant chaque RDV post-partum
  - Le suivi démarre après les 9 mois d'abonnement (fin de grossesse)

- [x] **Système de parrainage**
  - Section dans les paramètres avec formulaire 2 filleules
  - Barre de progression 0/2
  - Post-partum offert si 2 filleuls inscrits
  - Notifications admin avec catégorie "[Parrainage]"

- [x] **Nouvelles offres d'abonnement**
  - Premium: 27€/9 mois (grossesse)
  - Post-partum: 8€ (accessible après 6 mois d'abonnement)
  - Alternative: parrainage 2 amies = post-partum gratuit

- [x] **Système de remboursement (fausse couche)**
  - Demande de remboursement au prorata sur attestation
  - Notification admin avec catégorie "[Remboursement]"
  - Validation par l'admin avec notification utilisateur
  - Calcul automatique du montant au prorata des jours restants

- [x] **Correction pages blanches**
  - Intercepteur axios global pour détecter les tokens expirés
  - Redirection automatique vers /auth si token invalide (401/403)

## API Endpoints

### New Endpoints (14 Mars 2026)

#### auth.py (15 Mars 2026)
- `POST /api/auth/update-password` - Modifier le mot de passe (avec vérification de l'actuel)
- `POST /api/auth/update-email` - Modifier l'adresse email
- `POST /api/auth/end-premium` - Terminer l'abonnement premium (après accouchement)

#### postpartum.py
- `GET /api/maternity-bag` - Liste du sac de maternité
- `POST /api/maternity-bag/check` - Cocher/décocher un item
- `POST /api/maternity-bag/suggest` - Suggérer un article
- `GET /api/postpartum/content` - Contenu post-partum
- `GET /api/postpartum/status` - Statut post-partum (date accouchement, semaine)
- `POST /api/postpartum/set-birth-date` - Définir la date d'accouchement réelle
- `GET /api/postpartum/pending-reminders` - Rappels en attente
- `POST /api/postpartum/send-due-reminders` - Envoyer les rappels dus
- `POST /api/postpartum/request-refund` - Demander un remboursement
- `GET /api/admin/refund-requests` - Liste des demandes (admin)
- `POST /api/admin/refund-requests/{user_id}/approve` - Approuver/rejeter (admin)

#### referral.py
- `GET /api/referral/status` - Statut des parrainages
- `POST /api/referral/submit` - Soumettre des parrainages
- `GET /api/subscription/full-status` - Statut complet (premium + post-partum)
- `POST /api/subscription/purchase-postpartum` - Acheter post-partum

## Database Collections
- `users`, `pregnancy_profiles`, `search_history`, `favorites`
- `notifications`, `notification_preferences`
- `completed_appointments`, `appointment_notes`
- `user_added_foods`, `birth_lists`
- `promo_codes`, `admin_messages`
- `push_subscriptions`
- `maternity_bags` - Listes de sac par utilisateur
- `maternity_bag_suggestions` - Suggestions en attente
- `referrals` - Parrainages
- `postpartum_reminders` - Rappels RDV post-partum programmés
- `refund_requests` - Demandes de remboursement

## Credentials Admin
- **Email**: cyrilalepsa@gmail.com
- **Password**: Cyc@dmin9630
- **Role in DB**: `admin`

## Logique Post-partum
1. **Achat** : Accessible après 6 mois d'abonnement premium OU gratuit avec 2 parrainages
2. **Démarrage** : Le suivi démarre après les 9 mois d'abonnement (date accouchement)
3. **Date accouchement** : L'utilisatrice peut saisir sa date d'accouchement prévue/réelle à partir du 7ème mois (semaine 28+)
4. **Rappels** : 7 jours + 3 jours avant chaque RDV post-partum

## Logique Remboursement (Fausse couche)
1. L'utilisatrice demande un remboursement depuis les paramètres
2. Calcul automatique au prorata : (jours restants / 270) × 27€
3. L'admin reçoit une notification "[Remboursement]"
4. L'admin approuve ou rejette depuis l'interface admin
5. L'utilisatrice reçoit une notification du résultat

- [x] **Section admin pour les demandes de remboursement**
  - Onglet "Remboursements" dans l'interface admin
  - Compteurs : En attente / Approuvés / Rejetés
  - Liste des demandes avec détails complets
  - **Upload de document** : L'utilisatrice peut joindre une attestation médicale (PDF, JPG, PNG max 5Mo)
  - **Visualisation du document** : Bouton "Télécharger" dans l'interface admin
  - Alerte si aucun document n'est joint
  - Boutons Approuver/Rejeter pour chaque demande
  - Notification automatique à l'utilisatrice après traitement

## Future Tasks (Backlog)
- **(P1)** Graphiques de suivi grossesse (poids, croissance)
- **(P2)** Gestion multi-admins depuis l'interface
- **(P2)** Refactoring AdminPage.js (actuellement 1050 lignes)
- **(P2)** Mode hors-ligne complet
- **(P3)** Déploiement Google Play Store

## Testing Status
- Backend: 100% fonctionnel (15/15 tests passés)
- Frontend: 100% fonctionnel
- Dernière exécution: 15 Mars 2026

## 3rd Party Integrations
- **Stripe** (Paiements)
- **Resend** (Emails)
- **Gemini Nano Banana** (Génération d'images) via Emergent LLM Key
- **Capacitor** (Mobile)
