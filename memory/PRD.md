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
15. **Liste des Prénoms** ✅ COMPLET
    - Navigation hiérarchique : Genre → Région → Pays → Lettre → Prénom
    - **23 pays avec données complètes** :
      - 🌍 Europe (14) : France, Espagne, Italie, Allemagne, Royaume-Uni, Portugal, Belgique, Suisse, Pays-Bas, Pologne, Irlande, Grèce, Russie, Suède, Norvège
      - 🌎 Amérique (9) : États-Unis, Brésil, Canada, Mexique, Argentine, Colombie, Chili
    - **Barre de recherche** : Recherche rapide par nom
    - **Section Favoris** avec catégories Filles/Garçons
    - **Export HTML** : Télécharger ses favoris
    - **Partage** ✅ : Partager ses favoris (Web Share API + fallback presse-papiers)
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
```
MONGO_URL=mongodb+srv://mamandouce:CycaFamily2026@cluster0.i0qqqwu.mongodb.net/MamanDouce?retryWrites=true&w=majority
DB_NAME=MamanDouce
CORS_ORIGINS=*
SECRET_KEY=mamandouce-production-secret-2026-cyca
RESEND_API_KEY=re_Y9zodfdk_A9fS6UxAA985a2nKjhUgJZ2Z
SENDER_EMAIL=noreply@cycafamily.com
STRIPE_API_KEY=sk_test_51TABGLPcuaKD7kzT9OwJsnhGROWSLNWUnWacCIUPjtIQbov84ihhFOed1oDi60EghbQcasscjLP4AS3ftUmN8AbJ00OgJtRpb6
```

**Frontend:**
```
REACT_APP_BACKEND_URL=${APP_URL}
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51TABGLPcuaKD7kzTSEtw3Y51HQpV1y5UMMXSibtrD8sjpARMWUVdjjeFNKOZZnVWwJoNkMzNONFw7UkqRikhoGbo00WYwHdF3o
```

---

## Prioritized Backlog

### P0 - Critical (Bloquant)
- [ ] **Finaliser déploiement DigitalOcean** - Résoudre le blocage bancaire

### P1 - High Priority
- [ ] **Publier sur Google Play Store** - Générer le bundle AAB depuis la PWA
- [x] ~~Ajouter plus de pays aux prénoms~~ ✅ 23 pays disponibles
- [x] ~~Barre de recherche prénoms~~ ✅ Recherche globale implémentée
- [x] ~~Export favoris~~ ✅ Export HTML implémenté
- [x] ~~Partage favoris~~ ✅ Partage via Web Share API

### P2 - Medium Priority
- [ ] **Configurer domaine personnalisé** - cycafamily.com sur DigitalOcean
- [ ] **Ajouter encore plus de pays** (optionnel) : Ukraine, Finlande, Danemark, Pérou, Venezuela

### P3 - Low Priority / Enhancements
- [ ] **Refactoring** - Découper `MedicalAppointmentsPage.js` (>800 lignes)
- [ ] **Multi-langues** - Support anglais/portugais
- [ ] **Statistiques prénoms** - Popularité et tendances

---

## Completed Work (Changelog)

### 22 Mars 2026 - Session 4
- ✅ **Fonction Partage des favoris** : Bouton "Partager" utilisant Web Share API (mobile) avec fallback presse-papiers (desktop)
- ✅ Mise à jour du backlog

### 22 Mars 2026 - Session 3
- ✅ Ajout de 6 nouveaux pays : Russie 🇷🇺, Suède 🇸🇪, Norvège 🇳🇴, Colombie 🇨🇴, Chili 🇨🇱
- ✅ **Barre de recherche globale** : Recherche instantanée parmi tous les prénoms
- ✅ **Export HTML des favoris** : Bouton "Télécharger mes favoris"
- ✅ **Total : 23 pays avec données complètes**

### 22 Mars 2026 - Session 2
- ✅ Ajout de 9 pays : Belgique, Suisse, Pays-Bas, Pologne, Irlande, Grèce, Canada, Mexique, Argentine

### 22 Mars 2026 - Session 1
- ✅ Fonctionnalité "Liste des Prénoms" complète
- ✅ Section Favoris avec catégories Filles/Garçons
- ✅ Base de données initiale pour 8 pays

### Sessions précédentes
- ✅ Carte de visite, Switch Admin, Restrictions Premium, Admin filters, DigitalOcean config

---

## Statistiques Prénoms

| Région | Pays disponibles | Total |
|--------|------------------|-------|
| 🌍 Europe | FR, ES, IT, DE, GB, PT, BE, CH, NL, PL, IE, GR, RU, SE, NO | 15 |
| 🌎 Amérique | US, BR, CA, MX, AR, CO, CL | 7 |
| **Total** | | **22 pays** |

---

## Key Files Reference
- `/app/frontend/src/pages/BabyNamesPage.js` - Page prénoms (recherche + export)
- `/app/frontend/src/data/babyNames.js` - Base de données (22 pays)
- `/app/frontend/src/components/home/NavigationSections.jsx` - Navigation
- `/app/frontend/src/components/SubscriptionGate.jsx` - Premium/Gratuit

## Test Accounts
- Email: test4@example.com / Password: test123
