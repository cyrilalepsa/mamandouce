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
    - **28 pays avec données complètes** :
      - 🌍 Europe (18) : France, Espagne, Italie, Allemagne, Royaume-Uni, Portugal, Belgique, Suisse, Pays-Bas, Pologne, Irlande, Grèce, Russie, Suède, Norvège, Ukraine, Finlande, Danemark
      - 🌎 Amérique (8) : États-Unis, Brésil, Canada, Mexique, Argentine, Colombie, Chili, Pérou
      - 🌏 Asie (1) : Japon
      - 🌍 Afrique (1) : Maroc
    - **Barre de recherche** : Recherche rapide par nom
    - **Section Favoris** avec catégories Filles/Garçons
    - **Export HTML** : Télécharger ses favoris
    - **Partage** ✅ : Partager ses favoris ou un prénom individuel (Web Share API + fallback presse-papiers)
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
- [ ] **Finaliser déploiement DigitalOcean** - Résoudre le blocage bancaire pour mettre l'app en ligne

### P1 - High Priority
- [ ] **Publier sur Google Play Store** - Générer le bundle AAB depuis la PWA avec TWA (Trusted Web Activity)
- [x] ~~Ajouter plus de pays aux prénoms~~ ✅ 23 pays disponibles
- [x] ~~Barre de recherche prénoms~~ ✅ Recherche globale implémentée
- [x] ~~Export favoris~~ ✅ Export HTML implémenté
- [x] ~~Partage favoris~~ ✅ Partage via Web Share API
- [x] ~~Partage individuel prénom~~ ✅ Bouton partage sur chaque fiche prénom

### P2 - Medium Priority
- [ ] **Configurer domaine personnalisé** - cycafamily.com sur DigitalOcean
- [ ] **Apple App Store** - Publier sur iOS via PWA ou wrapper natif
- [ ] **Ajouter encore plus de pays** : Ukraine 🇺🇦, Finlande 🇫🇮, Danemark 🇩🇰, Pérou 🇵🇪, Venezuela 🇻🇪, Japon 🇯🇵, Chine 🇨🇳, Inde 🇮🇳
- [ ] **Améliorer SEO** - Meta tags, sitemap, robots.txt pour référencement Google

### P3 - Low Priority / Enhancements
- [ ] **Refactoring code**
  - Découper `MedicalAppointmentsPage.js` (>800 lignes) en sous-composants
  - Découper `BabyNamesPage.js` (>900 lignes) : `NameCard.jsx`, `FavoritesList.jsx`, `SearchBar.jsx`
- [ ] **Multi-langues** - Support anglais/portugais/espagnol avec i18n
- [ ] **Statistiques prénoms** - Popularité et tendances par année/pays
- [ ] **Mode sombre** - Dark mode pour toute l'application
- [ ] **Synchronisation cloud** - Sauvegarder favoris dans le compte utilisateur (pas seulement localStorage)
- [ ] **Notifications push** - Rappels de rendez-vous, conseils quotidiens
- [ ] **Comparateur de prénoms** - Comparer 2-3 prénoms côte à côte
- [ ] **Prénoms composés** - Générateur de prénoms composés (Marie-Anne, Jean-Pierre...)
- [ ] **Filtres avancés** - Par longueur, par lettre finale, par sonorité
- [ ] **Audio prononciation** - Écouter la prononciation des prénoms
- [ ] **Origine étymologique** - Détails sur l'histoire et l'origine de chaque prénom
- [ ] **Célébrités** - Personnalités célèbres portant ce prénom

### P4 - Future Ideas (Idées à explorer)
- [ ] **IA suggestion** - Suggérer des prénoms basés sur les favoris de l'utilisateur
- [ ] **Compatibilité prénom/nom** - Vérifier la sonorité prénom + nom de famille
- [ ] **Calendrier des saints** - Fête associée à chaque prénom
- [ ] **Forum communauté** - Discussions entre futures mamans
- [ ] **Partenariats** - Marques bébé, assurances maternité
- [ ] **Monétisation** - Publicités non-intrusives pour version gratuite
- [ ] **Analytics** - Tableau de bord des prénoms les plus recherchés

---

## Completed Work (Changelog)

### 22 Mars 2026 - Session 6
- ✅ **SEO AMÉLIORÉ** : 
  - robots.txt créé
  - sitemap.xml créé
  - Meta tags Open Graph et Twitter ajoutés
  - Keywords SEO ajoutés
- ✅ **MODE SOMBRE** :
  - ThemeContext créé (`/app/frontend/src/contexts/ThemeContext.jsx`)
  - Toggle dans Paramètres > Apparence
  - Styles CSS dark mode ajoutés
- ✅ **FILTRES AVANCÉS PRÉNOMS** :
  - Par longueur (Court 1-4, Moyen 5-7, Long 8+)
  - Par terminaison (A, E, I, O, N, S)
  - Par origine (arabe, breton, celtique, grec, hébraïque, latin, germanique, slave)
- ✅ **SYNC CLOUD FAVORIS** :
  - API Backend `/api/babynames-favorites` (GET, POST, POST /merge, DELETE)
  - Bouton sync cloud dans header de BabyNamesPage
  - Sauvegarde automatique des favoris dans MongoDB
- ✅ **PRÉNOM DU JOUR** :
  - Composant `/app/frontend/src/components/NameOfTheDay.jsx`
  - Affiché sur la page d'accueil
  - Change chaque jour automatiquement
- ✅ **REFACTORING BABYNAMES** :
  - BabyNamesPage.js : **1170 → 441 lignes** (réduction de 62%)
  - 10 composants extraits dans `/app/frontend/src/components/babynames/`
  - Code modulaire et maintenable
- ✅ **STATISTIQUES DE POPULARITÉ** :
  - API Backend `/api/babynames-stats` (tracking + top 10 + trending)
  - Composant `PopularityStats.jsx` avec classement Top 10
  - Tracking automatique des vues lors de l'expansion des prénoms
  - Onglets Filles/Garçons avec compteur total de vues
  - Navigation vers le pays du prénom cliqué

### 22 Mars 2026 - Session 5
- ✅ **BASE MASSIVE FRANCE : 1003 prénoms français modernes !** 
  - 582 prénoms féminins (A-Z complet)
  - 421 prénoms masculins (A-Z complet)
  - Fichier dédié : `/app/frontend/src/data/babyNamesFR.js`
  - Intégré dans `babyNames.js` via import ES6
- ✅ Toutes les lettres de l'alphabet couvertes pour la France
- ✅ Ajout de prénoms modernes 2020-2025 : Léna, Mila, Jade, Emma, Louise, Gabriel, Raphaël, Louis, Arthur, Jules...
- ✅ Prénoms multiculturels : arabes, bretons, italiens, slaves, etc.

### 22 Mars 2026 - Session 4
- ✅ **Fonction Partage des favoris** : Bouton "Partager" utilisant Web Share API (mobile) avec fallback presse-papiers (desktop)
- ✅ **Partage individuel** : Bouton "Partager ce prénom" sur chaque fiche de prénom
- ✅ **6 nouveaux pays ajoutés** : Ukraine 🇺🇦, Finlande 🇫🇮, Danemark 🇩🇰, Pérou 🇵🇪, Japon 🇯🇵, Maroc 🇲🇦
- ✅ **2 nouvelles régions** : Asie 🌏 et Afrique 🌍 avec navigation dédiée
- ✅ Mise à jour complète du backlog/future tasks (P0 à P4)
- ✅ **Total : 28 pays avec données**

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

| Région | Pays avec données | Total |
|--------|-------------------|-------|
| 🌍 Europe | FR (1003), ES, IT, DE, GB, PT, BE, CH, NL, PL, IE, GR, RU, SE, NO, UA, FI, DK | 18 |
| 🌎 Amérique | US, BR, CA, MX, AR, CO, CL, PE | 8 |
| 🌏 Asie | JP | 1 |
| 🌍 Afrique | MA | 1 |
| **Total** | | **28 pays, 1003+ prénoms FR** |

### Pays à ajouter (Future)
| Région | Pays suggérés |
|--------|---------------|
| 🌍 Europe | Autriche 🇦🇹, République Tchèque 🇨🇿, Hongrie 🇭🇺, Roumanie 🇷🇴 |
| 🌎 Amérique | Venezuela 🇻🇪, Cuba 🇨🇺, Porto Rico 🇵🇷 |
| 🌏 Asie | Chine 🇨🇳, Inde 🇮🇳, Corée du Sud 🇰🇷, Vietnam 🇻🇳 |
| 🌍 Afrique | Algérie 🇩🇿, Tunisie 🇹🇳, Égypte 🇪🇬, Sénégal 🇸🇳 |

---

## Key Files Reference
- `/app/frontend/src/pages/BabyNamesPage.js` - Page prénoms (recherche + export)
- `/app/frontend/src/data/babyNames.js` - Base de données principale (tous pays)
- `/app/frontend/src/data/babyNamesFR.js` - **Base massive France (1003 prénoms)**
- `/app/frontend/src/components/babynames/` - **Composants refactorisés** (NameCard, SearchBar, NameFilters, FavoritesList)
- `/app/frontend/src/components/NameOfTheDay.jsx` - **Prénom du jour**
- `/app/frontend/src/contexts/ThemeContext.jsx` - **Mode sombre**
- `/app/backend/routes/favorites.py` - **API sync cloud favoris**
- `/app/frontend/src/components/home/NavigationSections.jsx` - Navigation
- `/app/frontend/src/components/SubscriptionGate.jsx` - Premium/Gratuit

## Test Accounts
- Email: test4@example.com / Password: test123
