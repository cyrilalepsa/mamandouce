# MamanDouce - Product Requirements Document

## Original Problem Statement
Application pour les femmes enceintes avec :
- Scanner d'aliments (caméra + manuel)
- Calculateur de grossesse avec dates clés
- Conseils hebdomadaires et suivi médical
- Liste de naissance partageable
- Liens vers services administratifs et ressources

## Architecture Technique
- **Frontend**: React.js + Tailwind CSS + Shadcn/UI + Capacitor (PWA/Mobile)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Payments**: Stripe (25€ paiement unique)
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
- [x] **Ajout d'aliments** par utilisateurs

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

### Fonctionnalités annexes
- [x] Historique de recherche
- [x] Aliments favoris avec alertes
- [x] Système de notifications/rappels
- [x] Paiement Stripe (25€)
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

## Database Collections
- `users`, `pregnancy_profiles`, `search_history`
- `favorites`, `notifications`, `notification_preferences`
- `completed_appointments`, `appointment_notes`
- `user_added_foods`, `birth_lists`

## Deployment
- **PWA** : Service Worker actif
- **Google Play** : Capacitor configuré, guide dans `GOOGLE_PLAY_GUIDE.md`
- **Polices** : Dancing Script, Caveat, Quicksand, Nunito, Pacifico, Satisfy, Betania Patmos

## Known Limitations
- Stripe/Resend nécessitent clés API
- Scan caméra dépend permission navigateur

## Session Summary (12 Mars 2026)
1. Style calligraphique amélioré (titres, nom utilisateur en Caveat)
2. Badge Emergent 2x plus petit et discret
3. Mairie remplacée par **Maternelles TV** (YouTube)
4. **Liste de naissance** avec magasins et partage
5. **Conseils médicaux** dans calculateur avec disclaimer
6. **Note dents & cheveux** dans conseils hebdomadaires
7. Date nidation et prochaines règles ajoutées au calculateur
