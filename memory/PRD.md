# MamanDouce - Product Requirements Document

## Application Overview
MamanDouce est une application française complète d'accompagnement à la grossesse et au post-partum. Elle offre un suivi personnalisé, un scanner d'aliments, un chatbot IA, des recettes post-partum, et de nombreuses fonctionnalités pour les futures et jeunes mamans.

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Shadcn/UI, PWA, Capacitor (Android)
- **Backend**: FastAPI, Python 3.11, APScheduler
- **Database**: MongoDB
- **Integrations**: Stripe, Resend, OpenAI GPT-4o-mini (via Emergent LLM Key)

---

## Implemented Features (Complete)

### Core Features
- ✅ Suivi de grossesse semaine par semaine
- ✅ Scanner d'aliments (barcode + recherche)
- ✅ Chatbot IA 24/7
- ✅ Calendrier des RDV médicaux avec rappels automatiques
- ✅ Sac de maternité personnalisable
- ✅ Liste de naissance partageable
- ✅ Espace post-partum avec recettes et conseils
- ✅ Système de favoris pour les recettes
- ✅ Partage de recettes via lien public

### User Management
- ✅ Authentification JWT
- ✅ Authentification 2FA par email
- ✅ Mot de passe oublié
- ✅ Système d'abonnement Stripe (paywall)
- ✅ Codes promo pour beta testeuses
- ✅ Système de parrainage

### Admin Features
- ✅ Dashboard avec statistiques globales
- ✅ Gestion des utilisateurs (premium, post-partum, admin)
- ✅ Protection Super Admin permanent (cyrilalepsa@gmail.com)
- ✅ Gestion des codes promo
- ✅ Validation des aliments proposés
- ✅ Messagerie admin/utilisateurs
- ✅ Gestion des demandes de remboursement
- ✅ Dashboard des rappels de RDV
- ✅ Export Android (téléchargement ZIP + envoi email)
- ✅ Kit Business (plan financier, carte de visite)

### Technical Features
- ✅ PWA avec Service Worker (cache, offline)
- ✅ Notifications Push
- ✅ Rappels de RDV automatiques (APScheduler cron job)
- ✅ Mode hors-ligne avec synchronisation
- ✅ Build Android avec Capacitor (AAB généré avec succès)

### UI/UX Improvements (17/03/2026)
- ✅ Menus déroulants sur pages: Profil, Post-partum, RDV médicaux, Sac de maternité
- ✅ Sommaire des recettes groupé par catégorie déroulante
- ✅ Instructions de build Android en menu déroulant
- ✅ Badge "Super Admin" avec protection permanente

---

## Session du 17/03/2026 - Accomplissements

1. **Build Android réussi** - Guidé l'utilisateur pour:
   - Installer Node.js
   - Configurer l'environnement de développement
   - Compiler l'application avec `npm run build` et `npx cap sync android`
   - Générer le fichier `app-release.aab` avec Android Studio

2. **Section Export Android dans Admin**
   - Téléchargement du projet en ZIP
   - Envoi par email du projet
   - Instructions de build en menu déroulant

3. **Kit Business complet**
   - Plan financier sur 3 ans
   - Stratégie d'internationalisation
   - Pitchs pour partenariats (maternités, sages-femmes, influenceuses)
   - Fiche App Store optimisée
   - Carte de visite prête à imprimer
   - Envoyé par email + disponible dans l'Admin

4. **Protection Super Admin**
   - `cyrilalepsa@gmail.com` = admin permanent
   - Badge "Super Admin" avec icône cadenas
   - Impossible de retirer les droits (UI + API protégées)

---

## Backlog / Future Tasks

### P1 - Priorité haute
- [ ] Publication sur Google Play Store (en attente retours beta testeuses)
- [ ] Publication sur Apple App Store (nécessite compte développeur Apple)

### P2 - Améliorations
- [ ] Compteur de vues pour les recettes partagées
- [ ] Fonction favoris pour les articles du sac de maternité
- [ ] Bouton "Tout ouvrir / Tout fermer" pour les pages avec sections déroulantes
- [ ] Internationalisation (Belgique, Suisse, Québec)

### P3 - Nice to have
- [ ] Mode sombre
- [ ] Widget Android pour suivi rapide
- [ ] Intégration calendrier Google/Apple

---

## Credentials
- **Admin**: cyrilalepsa@gmail.com / Cyc@dmin9630
- **Super Admin Email**: cyrilalepsa@gmail.com (protégé)

---

## Key Files
- `/app/frontend/public/docs/BUSINESS_PLAN_MAMANDOUCE.md` - Plan business complet
- `/app/frontend/public/docs/CARTE_VISITE_MAMANDOUCE.html` - Modèle carte de visite
- `/app/frontend/ANDROID_DEPLOYMENT.md` - Guide de déploiement Android

---

*Dernière mise à jour: 17/03/2026 01:30 UTC*
