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
10. **Notifications/Rappels** - Push notifications
11. **Post-partum** - Conseils pour les 6 premiers mois
12. **Grossesse après 35 ans** - Section dédiée
13. **Carte de visite** - Téléchargeable HTML/PDF/JPEG
14. **Admin Dashboard** - Gestion utilisateurs avec filtres Année/Mois
15. **Liste des Prénoms** - Nouvelle fonctionnalité (22 Mars 2026)
    - Navigation hiérarchique : Genre → Région → Pays → Lettre → Prénom
    - 40 pays (Europe + Amérique)
    - Chaque prénom avec signification et personnalité
    - Restrictions : 3 pays gratuits (FR, US, ES) + lettres A-E

### Premium Features 👑
- Suivi de grossesse complet
- Rendez-vous médicaux T2 et T3
- Préparer l'arrivée de bébé (Liste naissance, Sac maternité, Vidéos, Livres)
- Liste des prénoms complète (tous pays + lettres F-Z)

## Tech Stack
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Payments**: Stripe
- **Emails**: Resend
- **Deployment**: DigitalOcean App Platform (en cours)

## Deployment Status 🚧
- **GitHub**: Repository public `cyrilalepsa/mamandouce`
- **MongoDB Atlas**: Cluster0 configuré (gratuit)
- **DigitalOcean**: Configuration prête, en attente de paiement

### Variables d'environnement requises:
**Backend:**
- MONGO_URL=mongodb+srv://mamandouce:CycaFamily2026@cluster0.i0qqqwu.mongodb.net/MamanDouce?retryWrites=true&w=majority
- DB_NAME=MamanDouce
- CORS_ORIGINS=*
- SECRET_KEY=mamandouce-production-secret-2026-cyca
- RESEND_API_KEY=re_Y9zodfdk_A9fS6UxAA985a2nKjhUgJZ2Z
- SENDER_EMAIL=noreply@cycafamily.com
- STRIPE_API_KEY=sk_test_51TABGLPcuaKD7kzT9OwJsnhGROWSLNWUnWacCIUPjtIQbov84ihhFOed1oDi60EghbQcasscjLP4AS3ftUmN8AbJ00OgJtRpb6

**Frontend:**
- REACT_APP_BACKEND_URL=${APP_URL}
- REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51TABGLPcuaKD7kzTSEtw3Y51HQpV1y5UMMXSibtrD8sjpARMWUVdjjeFNKOZZnVWwJoNkMzNONFw7UkqRikhoGbo00WYwHdF3o

## Prioritized Backlog

### P0 - Critical
- [ ] Finaliser déploiement DigitalOcean (bloquer bancaire à résoudre)

### P1 - High Priority
- [ ] Publier sur Google Play Store (bundle AAB)
- [ ] Compléter la base de données des prénoms (autres pays)

### P2 - Medium Priority
- [ ] Configurer domaine personnalisé cycafamily.com
- [ ] Améliorer les données prénoms pour tous les pays européens

### P3 - Low Priority / Enhancements
- [ ] Refactoring MedicalAppointmentsPage.js (>800 lignes)
- [ ] Ajouter plus de langues

## Key Files Reference
- `/app/frontend/src/pages/BabyNamesPage.js` - Page liste des prénoms
- `/app/frontend/src/data/babyNames.js` - Base de données prénoms
- `/app/frontend/src/components/home/NavigationSections.jsx` - Navigation sections
- `/app/frontend/src/components/SubscriptionGate.jsx` - Gestion Premium/Gratuit
- `/app/frontend/public/docs/CARTE_VISITE_MAMANDOUCE.html` - Carte de visite

## Test Accounts
- Email: test3@example.com / Password: test123 (utilisateur gratuit)
