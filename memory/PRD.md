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

### Système de personnalisation smartphone (UPDATED - Mars 2025)
- [x] **Page SOCLE** (3 éléments fixes) : Fête du jour, Semaine X, Carte "Les étapes de votre plus beau voyage"
- [x] **Page `/journey-steps`** : 5 sections en cartes cliquables (plus d'accordéons)
- [x] **Page `/section/:sectionId`** : Page de détail avec message "appui long pour sélectionner et dupliquer"
- [x] **Appui long Page Socle** : Création d'une nouvelle page personnalisée
- [x] **Appui long carte utilisateur** : Animation tremblement + croix rouge pour suppression
- [x] **Popup duplication** : Choix de la page de destination
- [x] **Bouton Home 🏠** : Toujours visible + définir page par défaut
- [x] **Bulles de pagination** : Home (rose) + Socle (rose) + Pages utilisateur (violet)
- [x] **Admin - Messages** : Sélection multiple et suppression en lot

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

## Completed in Current Session (30 Mars 2025)

### 6 Corrections UX/UI Type Smartphone - DONE
1. ✅ **Création de page** : Corrigé l'API `/api/user/layout` (prefix et type User)
2. ✅ **Phrase "mode édition..."** : Retirée de JourneyStepsPage
3. ✅ **Accordéons remplacés** : Cartes cliquables sur `/journey-steps` → `/section/:sectionId`
4. ✅ **Double appui** : Remplacé par clic simple
5. ✅ **Appui long Page Socle** : Ouvre popup création de page
6. ✅ **Bulles de pagination** : Home + Socle (rose) + Pages utilisateur (violet)

## Backlog

### P1 - High Priority
- [ ] Publication Google Play Store (génération fichier .aab)

### P3 - Medium Priority
- [ ] Audio prononciation pour les prénoms

### P4 - Low Priority
- [ ] Comparateur de prénoms

## Key Files
- `/app/frontend/src/pages/HomePage.js` - Page d'accueil avec sections collapsibles
- `/app/frontend/src/pages/JourneyStepsPage.js` - 5 cartes cliquables vers sections
- `/app/frontend/src/pages/SectionDetailPage.js` - Détail section avec appui long
- `/app/frontend/src/components/home/CustomizableHome.jsx` - Accueil personnalisable, pagination
- `/app/frontend/src/components/home/NavigationSections.jsx` - Composants de navigation
- `/app/frontend/src/contexts/HomeLayoutContext.js` - Gestion état global pages
- `/app/backend/routes/user_layout.py` - API layout utilisateur

## Deployment Notes
- Preview: `https://femme-enceinte-app.preview.emergentagent.com`
- Production: `https://mamandouce.cycafamily.com`
- **Important**: Cliquer "Save to GitHub" pour déclencher le déploiement Railway
