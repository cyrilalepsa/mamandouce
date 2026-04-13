# MamanDouce - Application de suivi grossesse et maternité

## Description
Application mobile PWA (encapsulée via Capacitor) de suivi de grossesse et maternité avec UI/UX soignée style "Nacre & Contraste", personnalisation Premium et navigation fluide.

## Stack technique
- **Frontend**: React + Tailwind CSS + Capacitor (Android) + Leaflet.js + Recharts + canvas-confetti
- **Backend**: FastAPI + MongoDB + reportlab (PDF)
- **Hosting**: Railway
- **Intégrations**: OpenAI GPT-5.2 (Expert IA), GPT-4o Vision (scanner IA), Stripe (paiements), Resend (emails)

---

## Version actuelle: v4.7.0 (Avril 2026)

### Nouveautés v4.7.0 - Calendrier & Admin Polish

#### 1. Calendrier Fertilité — Légendes et Cœurs restaurés
- **Classe `.fertility-calendar`** ajoutée au wrapper pour isoler du CSS global
- **Légendes** : Texte noir pur #000000, indicateurs colorés visibles (inline styles)
- **Cœurs rapports** : z-index 20 pour passer devant les cercles de jours
- **Cellules du calendrier** : backgrounds en inline styles (vert fertile, bleu ovulation, rose règles, jaune nidation)
- **Aucun blur/transparence** sur le calendrier

#### 2. Admin Dashboard — Texte Noir + Tuiles Pastel
- **Texte NOIR #000000** sur toutes les tuiles (icônes, labels, badges, chevrons)
- **Couleurs pastel plus claires** : Lilas #E9D5FF/#D8B4FE, Rose #FECDD3/#FDA4AF, Vert #A7F3D0/#6EE7B7, Bleu #BAE6FD/#7DD3FC
- **Bouton Export CSV** : style gris dégradé avec texte noir (cohérent avec les autres)

#### 3. CSS Global (glossy.css)
- **Exclusion calendrier** : Tous les boutons/éléments dans `.fertility-calendar` exemptés des règles neumorphiques
- **Pas de backdrop-filter blur** sur aucun élément

---

## Règles de design strictes (session courante)
1. Pas de transparence, pas de flou (backdrop-filter: blur)
2. Cartes BLANC PUR OPAQUE sur fond dégradé pastel
3. TOUS les textes en NOIR (#000000) — non-négociable
4. Admin : 4 tuiles (Lilas, Rose, Vert, Bleu) avec effet bombé/glossy
5. Chaque section admin = accordéon (pas de scroll)
6. Calendrier : légendes visibles + petits cœurs pour rapports

---

## Packages Stripe
| Package | Price ID | Montant |
|---------|----------|---------|
| Premium 9 mois | annual | 30€ |
| Post-partum 6 mois | postpartum | 10€ |

---

## Backlog / Tâches futures

### P0 - Terminé cette session
- [x] Calendrier : légendes visibles, cœurs avec z-index, texte noir
- [x] Admin : texte noir sur tuiles, couleurs pastel, Export CSV lisible
- [x] Codes promo Stripe : déjà en place (backend + frontend)

### P1 - Prioritaire
- [ ] Boutons glossy gris dégradé sur TOUTE l'app (uniquement boutons cliquables)
- [ ] Publication Google Play Store (APK via Android Studio) - BLOQUÉ (action utilisateur)

### P2 - Améliorations
- [ ] Design Nacre complet sur toutes les pages restantes

---

## Credentials de test
Voir `/app/memory/test_credentials.md`

---

*Dernière mise à jour: 13 Avril 2026 - v4.7.0 Calendrier & Admin Polish*
