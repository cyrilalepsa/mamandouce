# MamanDouce - Product Requirements Document

## Original Problem Statement
Application pour les femmes enceintes avec :
- Scanner d'aliments (caméra + manuel)
- Calculateur de grossesse avec dates clés
- Conseils hebdomadaires et suivi médical
- Liste de naissance partageable
- Liens vers services administratifs et ressources
- Système d'abonnement Premium (27€/an)
- Page d'administration complète

## Architecture Technique
- **Frontend**: React.js + Tailwind CSS + Shadcn/UI + Capacitor (PWA/Mobile)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Payments**: Stripe (27€/an non-tacite)
- **Email**: Resend

## Completed Features (Mars 2026)

### Interface & Design
- [x] Logo "MamanDouce" en Dancing Script avec dégradé rose
- [x] Nom utilisateur en police **Caveat** (arrondie et douce)
- [x] Badge Emergent ultra-discret (20px, opacité 40%)
- [x] Composants PageHeader avec titres calligraphiques

### Page d'accueil
- [x] Premium en haut à gauche, Déconnexion en haut à droite
- [x] Logo MamanDouce centré
- [x] "Bonjour, [Prénom]" avec police Caveat
- [x] Services & Ressources : CAF, Ameli, **Maternelles TV** (YouTube), Maps

### Calculateur de grossesse
- [x] Date des prochaines règles
- [x] Date d'ovulation estimée
- [x] Date de conception estimée
- [x] **Date de nidation estimée** (9 jours après ovulation)
- [x] Date prévue d'accouchement
- [x] Semaines de grossesse
- [x] **Conseils médicaux par trimestre** avec disclaimer
- [x] Signes d'urgence à surveiller
- [x] Sélection durée de cycle (24-34 jours)

### Scanner d'aliments
- [x] Scan par caméra (html5-qrcode)
- [x] Recherche par nom
- [x] Saisie manuelle code-barres
- [x] **Bibliothèque alimentaire** (192 aliments, recherche, filtres)
- [x] **Ajout d'aliments** par utilisateurs (soumis pour validation admin)

### Liste de naissance
- [x] Création de liste personnelle
- [x] Choix magasins : Orchestra, Vertbaudet, Amazon, Aubert, Kiabi, Autre
- [x] Ajout articles : nom, magasin, lien, prix, quantité, notes
- [x] **Lien de partage** pour les proches
- [x] **Réservation d'articles** par les proches

### Suivi médical
- [x] 20 rendez-vous médicaux prédéfinis
- [x] Statut complété/à venir
- [x] Notes personnelles (poids, tension, bébé)
- [x] Alertes personnalisées

### Conseils hebdomadaires
- [x] 41 semaines de conseils
- [x] Démarches administratives
- [x] **Note importante dents & cheveux** (fragilisés pendant grossesse)

### Page d'Administration (NOUVEAU - 13 Mars 2026)
- [x] **Onglet Utilisateurs** : Liste complète avec statuts
  - Bêta testeuse (utilisateurs ayant utilisé un code promo)
  - Premium (abonnés payants)
  - Gratuit
- [x] **Onglet Messages** : Réception et gestion des messages utilisateurs
  - Compteur de messages non lus
  - Bouton "Marquer comme lu"
- [x] **Onglet Aliments** : Validation des aliments proposés
  - Liste des aliments en attente
  - Boutons Approuver/Rejeter
- [x] **Onglet Codes Promo** : Génération et gestion
  - Génération de 1-20 codes à la fois
  - Note optionnelle pour chaque code
  - Liste des codes avec statut (utilisé/disponible)

### Système de Contact (NOUVEAU - 13 Mars 2026)
- [x] **Formulaire de contact** dans la page Profil
  - Sujet et message
  - Envoi vers la boîte admin
  - Confirmation visuelle

### Fonctionnalités annexes
- [x] Historique de recherche
- [x] Aliments favoris avec alertes
- [x] Système de notifications/rappels
- [x] Paiement Stripe (27€/an)
- [x] Codes promo à usage unique pour bêta testeuses
- [x] Emails via Resend

## API Endpoints

### Auth & User
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

### Pregnancy
- `POST /api/pregnancy/calculate` (avec next_period_date, implantation_date)

### Food
- `POST /api/scan/barcode`, `POST /api/scan/search`
- `GET /api/food-library`, `POST /api/user-added-foods`

### Birth List
- `GET /api/birth-list`, `POST /api/birth-list`
- `POST /api/birth-list/items`, `DELETE /api/birth-list/items/{id}`
- `GET /api/birth-list/shared/{share_id}` (public)
- `POST /api/birth-list/shared/{share_id}/items/{id}/toggle` (public)

### Medical & Favorites
- `GET /api/medical/appointments`, `POST /api/medical/complete/{id}`
- `GET /api/favorites`, `POST /api/favorites`

### Admin (NOUVEAU)
- `GET /api/admin/users?admin_secret=xxx` - Liste des utilisateurs
- `GET /api/admin/pending-foods?admin_secret=xxx` - Aliments en attente
- `POST /api/admin/food-status/{id}?status=xxx&admin_secret=xxx` - Approuver/Rejeter
- `GET /api/admin/messages?admin_secret=xxx` - Messages reçus
- `POST /api/admin/messages/{id}/read?admin_secret=xxx` - Marquer lu
- `POST /api/admin/generate-codes` - Générer codes promo
- `GET /api/admin/promo-codes` - Lister codes

### Contact (NOUVEAU)
- `POST /api/contact/send` - Envoyer message à l'admin

## Database Collections
- `users`, `pregnancy_profiles`, `search_history`
- `favorites`, `notifications`, `notification_preferences`
- `completed_appointments`, `appointment_notes`
- `user_added_foods`, `birth_lists`
- `promo_codes` (NOUVEAU)
- `admin_messages` (NOUVEAU)

## Credentials Admin
- **Email**: cyrilalepsa@gmail.com
- **Password**: Cyc@dmin9630
- **API Secret**: Cyca-admin2026

## Deployment
- **PWA** : Service Worker actif
- **Google Play** : Capacitor configuré, guide dans `GOOGLE_PLAY_GUIDE.md`
- **Polices** : Dancing Script, Caveat, Quicksand, Nunito, Pacifico, Satisfy, Betania Patmos

## Known Limitations
- Stripe/Resend nécessitent clés API
- Scan caméra dépend permission navigateur
- Scan code-barres avec pyzbar ne fonctionne pas si libzbar0 manquant sur le serveur

## Test Results (13 Mars 2026)
- Backend: 100% (11/11 tests passés)
- Frontend: 100% (tous les onglets et fonctionnalités testés)
- Rapport: `/app/test_reports/iteration_1.json`

## Session Summary (13 Mars 2026)
1. **Page Admin complète** avec 4 onglets fonctionnels
2. **Statuts utilisateurs** : Bêta testeuse / Premium / Gratuit
3. **Système de messagerie** utilisateur vers admin
4. **Validation des aliments** proposés par la communauté
5. **Tous les tests passent** (backend + frontend)
