# MamanDouce - Product Requirements Document

## Original Problem Statement
Application PWA de suivi de grossesse "MamanDouce" pour accompagner les futures mamans tout au long de leur grossesse avec des fonctionnalités premium et gratuites.

## User Personas
- **Futures mamans** : Femmes enceintes cherchant un accompagnement personnalisé
- **Utilisatrices premium** : Accès complet à toutes les fonctionnalités
- **Utilisatrices gratuites** : Accès limité avec possibilité d'upgrade

## Core Features

### Implemented Features ✅
1. **Authentification** - Inscription, connexion, mot de passe oublié
2. **Calculateur de grossesse** - Dates clés, ovulation
3. **Scanner alimentaire** - Vérification des aliments
4. **Bibliothèque alimentaire** - Base de données des aliments
5. **Rendez-vous médicaux** - Suivi par trimestre (T1 gratuit, T2-T3 premium)
6. **Suivi de grossesse** - Premium uniquement
7. **Liste de naissance** - Premium uniquement, partageable
8. **Sac de maternité** - Checklist interactive, Premium
9. **Chatbot IA** - Assistant virtuel
10. **Notifications/Rappels** - Push notifications PWA
11. **Post-partum** - Conseils pour les 6 premiers mois
12. **Grossesse après 35 ans** - Section dédiée
13. **Carte de visite** - Téléchargeable HTML/PDF/JPEG
14. **Admin Dashboard** - Gestion utilisateurs avec filtres Année/Mois, envoi email/messages directs
15. **Liste des Prénoms** - 28 pays, recherche, export HTML, partage
16. **Prénom du jour** - Calendrier des Saints avec message "Bonne fête"
17. **Système "Quoi de neuf ?"** - Pop-up nouveautés, badges NEW, historique des mises à jour
18. **Recettes personnalisées** - Création et partage individuel
19. **Menus déroulants** - Bouton "Fermer" en bas de toutes les cartes
20. **Épinglage des catégories** ✅ NEW - Garder une section toujours ouverte sur la page d'accueil

### Premium Features 👑
- Suivi de grossesse complet
- Rendez-vous médicaux T2 et T3
- Préparer l'arrivée de bébé (Liste naissance, Sac maternité, Vidéos, Livres)
- Liste des prénoms complète (tous pays + lettres F-Z)

## Tech Stack
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB Atlas
- **Payments**: Stripe
- **Emails**: Resend
- **Deployment**: Railway (Production)

## Deployment Status ✅
- **GitHub**: Repository `cyrilalepsa/mamandouce`
- **MongoDB Atlas**: Cluster0 configuré
- **Railway**: Déployé et opérationnel
- **Domaine**: cycafamily.com (configuré sur Railway)

### Super Admin
- Email codé en dur pour bypass: `cyrilalepsa@gmail.com`

---

## Prioritized Backlog

### P0 - Critical (Bloquant)
- ✅ ~~Finaliser déploiement Railway~~ FAIT
- ✅ ~~Épinglage des catégories~~ FAIT (26 Mars 2026)

### P1 - High Priority
- [ ] **Publier sur Google Play Store** - Générer le bundle AAB depuis la PWA avec TWA (Trusted Web Activity)

### P2 - Medium Priority
- [ ] **Apple App Store** - Publier sur iOS via PWA ou wrapper natif
- [ ] **Multi-langues** - Support anglais/portugais/espagnol avec i18n

### P3 - Low Priority / Enhancements
- [ ] **Audio prononciation** - Écouter la prononciation des prénoms
- [ ] **Comparateur de prénoms** - Comparer 2-3 prénoms côte à côte
- [ ] **Mode sombre amélioré** - Dark mode pour toute l'application
- [ ] **Filtres avancés prénoms** - Par longueur, lettre finale, sonorité
- [ ] **Synchronisation cloud améliorée** - Sync des sections épinglées dans le compte utilisateur

### P4 - Future Ideas
- [ ] **IA suggestion** - Suggérer des prénoms basés sur les favoris
- [ ] **Forum communauté** - Discussions entre futures mamans
- [ ] **Partenariats** - Marques bébé, assurances maternité

---

## Completed Work (Changelog)

### 26 Mars 2026 - Session Actuelle
- ✅ **ÉPINGLAGE DES CATÉGORIES** :
  - `PinnedSectionsProvider` wrapper les sections dans HomePage
  - Ajout de `sectionId` aux 5 sections (preconception, pregnancy, baby-preparation, postpartum, services)
  - Bouton Pin/PinOff pour chaque section
  - Sauvegarde des préférences dans localStorage (`mamandouce_pinned_sections`)
  - Toast de confirmation lors de l'épinglage/désépinglage
  - Les sections épinglées restent toujours ouvertes

### Sessions Précédentes (Mars 2026)
- ✅ Déploiement Railway complet (Backend + Frontend)
- ✅ Super Admin auto-attribué pour `cyrilalepsa@gmail.com`
- ✅ Envoi direct d'email/message via Dashboard Admin
- ✅ Menus accordéons avec bouton "Fermer"
- ✅ Calendrier des Saints + Bannière "Bonne fête"
- ✅ Création de recettes personnalisées et partage
- ✅ Système "Quoi de neuf ?" (Pop-up, badges NEW, historique)
- ✅ Conseils test d'ovulation Clearblue
- ✅ Affichage grossesse conditionné à rapport dans fenêtre fertile

---

## Key Files Reference
- `/app/frontend/src/pages/HomePage.js` - Page d'accueil (avec PinnedSectionsProvider)
- `/app/frontend/src/components/home/NavigationSections.jsx` - Sections de navigation (épinglage)
- `/app/frontend/src/components/home/index.js` - Exports des composants home
- `/app/frontend/src/data/saintsCalendar.js` - Calendrier des Saints
- `/app/frontend/src/data/appUpdates.js` - Historique des mises à jour
- `/app/frontend/src/components/WhatsNewModal.jsx` - Modal nouveautés
- `/app/backend/routes/admin.py` - Routes admin (email/message)
- `/app/backend/routes/postpartum.py` - Routes post-partum (recettes)

## Test Accounts
- Email: test4@example.com / Password: test123

## Important Notes for Deployment
⚠️ Après chaque modification de code, l'utilisateur doit cliquer sur **"Save to GitHub"** dans le chat Emergent pour déclencher le build Railway.
