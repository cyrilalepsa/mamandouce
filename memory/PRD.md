# MamanDouce - Application de suivi grossesse et maternité

## Description
Application mobile PWA de suivi de grossesse et maternité avec UI/UX soignée style "Nacre Bombé Glossy Argenté".

## Stack technique
- **Frontend**: React + Tailwind CSS + Capacitor (Android)
- **Backend**: FastAPI + MongoDB
- **Hosting**: Railway
- **Intégrations**: OpenAI GPT-5.2, GPT-4o Vision, Stripe, Resend

---

## Version actuelle: v4.9.0 (Avril 2026)

### Design Nacre Bombé Glossy Argenté — Règles Immuables

#### Effet technique sur TOUTES les cartes (sauf Accueil/Admin) :
- **Gradient** : `linear-gradient(160deg, #ffffff 0%, #f5f5f5 20%, #e8e8ea 50%, #d5d5d8 80%, #c0c0c5 100%)`
- **Double box-shadow** : ombre portée ext. + inset blanc haut-gauche / gris bas-droite
- **Bordure perle** : `1px solid rgba(255,255,255,0.7)`
- **Texte** : NOIR PUR #000000

#### Éléments protégés (NE PAS TOUCHER — exclus du CSS global) :
- `.badge-semaine-x` → fond ROSE dégradé glossy
- `.badge-fete-du-jour` → fond JAUNE dégradé glossy
- `.admin-drawer` → tuiles pastel (Lilas, Rose, Vert, Bleu)
- `.fertility-calendar` → calendrier isolé du CSS global
- Titre "Les étapes" → gradient rose→violet→bleu

#### Système de couleurs icônes : Jaune → Bleu → Vert → Rouge → Violet
- Grossesse : 4 Jaune → Prénoms Bleu → 4 Rouge → Congés Vert
- Autres sections : cycle Jaune→Bleu→Vert→Rouge→Violet
- Épingles : Rouge clair universel

---

## Backlog

### P0 - Terminé
- [x] Effet nacre bombé argenté sur toutes les cartes/boutons
- [x] Calendrier légendes + cœurs z-index
- [x] Admin texte noir sur tuiles pastel
- [x] Couleurs icônes structurées

### P1
- [ ] Publication Google Play Store (action utilisateur)

---

*Dernière mise à jour: 13 Avril 2026 - v4.9.0 Nacre Bombé Glossy*
