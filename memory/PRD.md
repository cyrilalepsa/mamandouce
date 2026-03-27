# MamanDouce - Product Requirements Document

## Original Problem Statement
Application mobile de suivi de grossesse "MamanDouce" - Companion complet pour les femmes avant, pendant et après la grossesse. Déploiement full-stack sur Railway, amélioration UX/UI, support multi-langues (statique et dynamique), publication Google Play Store.

## Tech Stack
- **Frontend**: React (PWA)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Hosting**: Railway
- **Integrations**: Stripe (paiements), Resend (emails), OpenAI GPT-5.2 (chatbot + traduction)

## Core Features Implemented

### Authentification & Profil
- [x] Inscription/Connexion email + mot de passe
- [x] Reset password par email
- [x] Profil utilisateur avec date d'accouchement prévue
- [x] Gestion abonnement Stripe

### Suivi Grossesse
- [x] Calculateur de grossesse (roue)
- [x] Conseils hebdomadaires personnalisés
- [x] Scanner d'aliments (autorisés/interdits)
- [x] Bibliothèque alimentaire complète
- [x] RDV médicaux avec rappels
- [x] Valise de maternité interactive

### Post-Partum
- [x] Guide post-partum complet (RDV bébé, allaitement, biberon)
- [x] Recettes adaptées
- [x] Suivi des étapes clés

### Fonctionnalités Avancées
- [x] Chatbot IA (GPT-5.2) disponible 24/7
- [x] Suivi des règles et ovulation (TrackingPage)
- [x] Liste de naissance partageable
- [x] Idées de prénoms (base FR + US)
- [x] Grossesse après 35 ans (guide spécialisé)

### Multi-langues (6 langues)
- [x] Français, English, Español, Português, Italiano, Deutsch
- [x] Traduction statique (i18next) sur toutes les pages
- [x] Traduction dynamique (GPT-5.2) pour contenu BDD
- [x] Sélecteur de langue (drapeau) sur HomePage/AuthPage

### Business Kit (Admin)
- [x] Carte de visite (2 versions: avec/sans QR code)
- [x] Accès aux documents téléchargeables
- [x] Panel admin pour statistiques et gestion

## Completed in Current Session (March 2025)

### Carte de Visite - DONE
- Version avec QR Code (recto: logo + slogan + QR)
- Version sans QR Code (recto: logo + slogan + 4 features)
- Verso: Liste complète des fonctionnalités + contact
- Slogan: "Votre compagnon avant, pendant et après la grossesse"
- Features listées: Suivi règles/ovulation, Grossesse semaine/semaine, Scanner aliments, Idées prénoms

### Correction RDV - DONE
- "Examen des hanches" → "Échographie des hanches (dépistage luxation)"

## Backlog

### P1 - High Priority
- [ ] Publication Google Play Store (génération fichier .aab)

### P3 - Medium Priority
- [ ] Audio prononciation pour les prénoms

### P4 - Low Priority
- [ ] Comparateur de prénoms

## Key Files
- `/app/frontend/src/pages/CarteVisitePage.js` - Carte de visite
- `/app/backend/routes/postpartum.py` - RDV post-partum
- `/app/frontend/src/i18n/locales/` - Fichiers de traduction
- `/app/backend/services/translation_service.py` - Service traduction GPT-5.2

## Deployment Notes
- Preview: `https://femme-enceinte-app.preview.emergentagent.com`
- Production: `https://mamandouce.cycafamily.com`
- **Important**: Cliquer "Save to GitHub" pour déclencher le déploiement Railway
