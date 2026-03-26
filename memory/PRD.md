# MamanDouce - Product Requirements Document

## Original Problem Statement
Application PWA de suivi de grossesse "MamanDouce" pour accompagner les futures mamans tout au long de leur grossesse avec des fonctionnalités premium et gratuites.

## User Personas
- **Futures mamans** : Femmes enceintes cherchant un accompagnement personnalisé
- **Utilisatrices premium** : Accès complet à toutes les fonctionnalités
- **Utilisatrices gratuites** : Accès limité avec possibilité d'upgrade

## Tech Stack
- **Frontend**: React + Tailwind CSS + Shadcn/UI + i18next
- **Backend**: FastAPI (Python)
- **Database**: MongoDB Atlas
- **Payments**: Stripe
- **Emails**: Resend
- **Deployment**: Railway (Production)
- **i18n**: i18next + react-i18next (6 langues)

## Deployment Status ✅
- **GitHub**: Repository `cyrilalepsa/mamandouce`
- **Railway**: Déployé et opérationnel
- **Domaine**: cycafamily.com

---

## Implemented Features ✅

### Core Features
1. Authentification (inscription, connexion, mot de passe oublié)
2. Calculateur de grossesse (dates clés, ovulation)
3. Scanner alimentaire + Bibliothèque alimentaire
4. Rendez-vous médicaux (T1 gratuit, T2-T3 premium)
5. Suivi de grossesse (Premium)
6. Liste de naissance partageable (Premium)
7. Sac de maternité - checklist (Premium)
8. Chatbot IA
9. Push notifications PWA
10. Post-partum (6 premiers mois)
11. Grossesse après 35 ans
12. Carte de visite téléchargeable
13. Admin Dashboard avec filtres
14. Liste des Prénoms (28 pays)
15. Prénom du jour (Calendrier des Saints)
16. Système "Quoi de neuf ?" (Pop-up, badges, historique)
17. Recettes personnalisées avec partage
18. Menus déroulants avec bouton "Fermer"

### Nouvelles fonctionnalités (Session actuelle) ✨
19. **Épinglage des catégories** - Garder sections favorites toujours ouvertes
20. **Multi-langues (6 langues)** - FR, EN, ES, PT, IT, DE
21. **Bannière d'aide épinglage** - Guide nouvelles utilisatrices
22. **Services localisés par pays** - CAF/NHS/INPS selon la langue

---

## Services par Pays 🌍

| Pays | Allocations | Santé | Local | Urgences | Site officiel |
|------|-------------|-------|-------|----------|---------------|
| 🇫🇷 France | CAF | Ameli | Mairie | SAMU 15 | 1000-premiers-jours.fr |
| 🇬🇧 UK | Gov.uk | NHS | Council | 111/999 | Start4Life |
| 🇪🇸 Espagne | Seg. Social | Sanidad | Ayuntamiento | 112 | Salud Mujer |
| 🇵🇹 Portugal | Seg. Social | SNS | Câmara | 112 | SNS Grávida |
| 🇮🇹 Italie | INPS | SSN | Comune | 118 | Salute Donna |
| 🇩🇪 Allemagne | Familienkasse | Krankenkasse | Standesamt | 112 | Familienportal |

---

## Prioritized Backlog

### P0 - Critical ✅ DONE
- ~~Déploiement Railway~~ ✅
- ~~Épinglage catégories~~ ✅
- ~~Multi-langues~~ ✅
- ~~Services localisés~~ ✅

### P1 - High Priority
- [ ] **Publication Google Play Store** - Générer AAB avec TWA

### P2 - Medium Priority
- [ ] **Apple App Store** - PWA/wrapper natif
- [ ] **Étendre traductions** - Autres pages (calculateur, scanner détaillé)

### P3 - Low Priority
- [ ] Audio prononciation prénoms
- [ ] Comparateur de prénoms
- [ ] Mode sombre amélioré

---

## Key Files Reference

### i18n
- `/app/frontend/src/i18n/index.js` - Configuration
- `/app/frontend/src/i18n/locales/*.json` - Traductions (fr, en, es, pt, it, de)
- `/app/frontend/src/components/settings/LanguageSelector.jsx`

### Services localisés
- `/app/frontend/src/data/servicesByCountry.js` - Données par pays

### Navigation
- `/app/frontend/src/components/home/NavigationSections.jsx` - Sections traduites
- `/app/frontend/src/components/home/PinTip.jsx` - Bannière aide

---

## Completed Work (Changelog)

### 26 Mars 2026
- ✅ Épinglage des catégories (localStorage)
- ✅ Multi-langues: 6 langues avec sélecteur dans Paramètres
- ✅ Bannière "Astuce" pour l'épinglage
- ✅ Services et ressources dynamiques par pays
- ✅ Traductions étendues: toutes les sections de navigation

---

## Important Notes
⚠️ Après modifications: cliquer sur **"Save to GitHub"** pour déclencher Railway.

Super Admin: `cyrilalepsa@gmail.com` (codé en dur)
