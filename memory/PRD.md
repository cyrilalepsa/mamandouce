# MamanDouce - Product Requirements Document

## Original Problem Statement
Application PWA de suivi de grossesse "MamanDouce" pour accompagner les futures mamans tout au long de leur grossesse avec des fonctionnalités premium et gratuites.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Shadcn/UI + i18next (6 langues)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB Atlas
- **Payments**: Stripe
- **Emails**: Resend
- **Deployment**: Railway (Production)

## Deployment
- **Railway**: Déployé et opérationnel
- **Domaine**: cycafamily.com
- **Super Admin**: `cyrilalepsa@gmail.com`

---

## Implemented Features ✅

### Core Features (1-18)
Authentification, Calculateur, Scanner alimentaire, Bibliothèque, RDV médicaux, Suivi grossesse (Premium), Liste naissance, Sac maternité, Chatbot IA, Push notifications, Post-partum, Grossesse après 35, Carte visite, Admin Dashboard, Prénoms (28 pays), Prénom du jour, "Quoi de neuf ?", Recettes personnalisées

### Session actuelle ✨
19. **Épinglage des catégories** - Garder sections favorites ouvertes
20. **Multi-langues (6 langues)** - FR, EN, ES, PT, IT, DE
21. **Bannière d'aide épinglage** - Guide nouvelles utilisatrices
22. **Services localisés** - CAF/NHS/INPS selon langue
23. **Traductions étendues** ✅ - Auth, calculateur, scanner, bibliothèque, prénoms
24. **Détection auto langue** ✅ - Détecte la langue du navigateur
25. **Prénom du jour localisé** ✅ NEW - Calendrier des saints par pays (FR, ES, PT, IT, DE)
26. **Magasins liste naissance** ✅ NEW - Enseignes adaptées par pays (Vertbaudet FR, John Lewis UK, etc.)
27. **Sac de maternité localisé** ✅ NEW - Documents, durée séjour, marques par pays

---

## Langues supportées 🌍

| Code | Langue | Drapeau | Détection auto |
|------|--------|---------|----------------|
| fr | Français | 🇫🇷 | ✅ Fallback |
| en | English | 🇬🇧 | ✅ |
| es | Español | 🇪🇸 | ✅ |
| pt | Português | 🇵🇹 | ✅ |
| it | Italiano | 🇮🇹 | ✅ |
| de | Deutsch | 🇩🇪 | ✅ |

### Clés de traduction disponibles
- `common.*` - Actions communes (save, cancel, close, etc.)
- `auth.*` - Authentification (login, register, errors)
- `home.*` - Page d'accueil (welcome, agenda, pins)
- `sections.*` - Noms des sections
- `calculator.*` - Calculateur de grossesse
- `scanner.*` - Scanner alimentaire
- `library.*` - Bibliothèque alimentaire
- `pregnancy.*` - Section grossesse
- `babyPrep.*` - Préparation bébé
- `postpartum.*` - Post-partum
- `settings.*` - Paramètres
- `premium.*` - Messages premium
- `fertility.*` - Fertilité
- `babyNames.*` - Prénoms

---

## Services par Pays

| Pays | Allocations | Santé | Urgences |
|------|-------------|-------|----------|
| 🇫🇷 FR | CAF | Ameli | SAMU 15 |
| 🇬🇧 EN | Gov.uk | NHS | 111/999 |
| 🇪🇸 ES | Seg. Social | Sanidad | 112 |
| 🇵🇹 PT | Seg. Social | SNS | 112 |
| 🇮🇹 IT | INPS | SSN | 118 |
| 🇩🇪 DE | Familienkasse | Krankenkasse | 112 |

---

## Prioritized Backlog

### ✅ DONE
- ~~P0: Déploiement Railway~~
- ~~P0: Épinglage catégories~~
- ~~P0: Vérification visuelle composants localisés~~ (26/03/2026)
- ~~P2: Multi-langues~~
- ~~P2: Services localisés~~
- ~~P2: Traductions étendues~~
- ~~P2: Finalisation fichiers i18n~~
- ~~Amélioration: Détection auto langue~~
- ~~Amélioration: Prénom du jour par pays~~
- ~~Amélioration: Magasins liste naissance par pays~~
- ~~Amélioration: Sac de maternité par pays~~

### P1 - High Priority
- [ ] **Publication Google Play Store** - Générer AAB avec TWA

### P2 - Medium Priority
- [ ] **Apple App Store** - PWA/wrapper natif

### P3 - Low Priority
- [ ] Audio prononciation prénoms
- [ ] Comparateur de prénoms
- [ ] Mode sombre amélioré

---

## Key Files

### i18n
- `/app/frontend/src/i18n/index.js` - Configuration
- `/app/frontend/src/i18n/locales/*.json` - 6 fichiers de traduction
- `/app/frontend/src/components/settings/LanguageSelector.jsx`

### Données localisées
- `/app/frontend/src/data/servicesByCountry.js` - Services par pays
- `/app/frontend/src/data/namesByCountry.js` - Calendrier des prénoms
- `/app/frontend/src/data/storesByCountry.js` - Magasins liste naissance
- `/app/frontend/src/data/maternityBagByCountry.js` - Infos sac maternité

### Navigation
- `/app/frontend/src/components/home/NavigationSections.jsx`
- `/app/frontend/src/components/home/PinTip.jsx`

---

## Notes importantes
⚠️ Après modifications: cliquer sur **"Save to GitHub"** pour déclencher Railway.
