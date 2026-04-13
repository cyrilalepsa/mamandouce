# MamanDouce - Application de suivi grossesse et maternité

## Description
Application mobile PWA (encapsulée via Capacitor) de suivi de grossesse et maternité avec UI/UX soignée style "Nacre & Contraste", personnalisation Premium et navigation fluide.

## Stack technique
- **Frontend**: React + Tailwind CSS + Capacitor (Android) + Leaflet.js + Recharts + canvas-confetti
- **Backend**: FastAPI + MongoDB + reportlab (PDF)
- **Hosting**: Railway
- **Intégrations**: OpenAI GPT-5.2 (Expert IA), GPT-4o Vision (scanner IA), Stripe (paiements), Resend (emails)

---

## Version actuelle: v4.8.0 (Avril 2026)

### Nouveautés v4.8.0 - Design Nacré Global & Couleurs Structurées

#### 1. Cartes & Boutons — Gris Dégradé Blanc Glossy
- **Fond** : `linear-gradient(145deg, #eaeaec → #f0f0f2 → #f5f5f7 → #fafafa → #ffffff)`
- **Effet** : Neumorphisme nacré (ombres internes/externes)
- **Texte** : NOIR #000000 impératif
- **Bulles d'icônes** : gris dégradé blanc glossy avec icône colorée

#### 2. Système de couleurs strict (Jaune → Bleu → Vert → Rouge → Violet)
- **JourneyStepsPage** : 5 sections dans l'ordre exact
- **Grossesse** : 4 Jaune → Prénoms Bleu → 4 Rouge → Congés Vert
- **Post-partum/Préparation/Services** : cycle Jaune→Bleu→Vert→Rouge→Violet
- **Préconception** : Jaune→Bleu→Vert

#### 3. Éléments verrouillés (NE PAS TOUCHER)
- Titre "Les étapes de votre plus beau voyage" : gradient rose→violet→bleu
- Carte "Semaine X" : fond rose glossy (`badge-semaine-x`) + texte bleu→violet
- Admin : 4 tuiles pastel (Lilas, Rose, Vert, Bleu) avec texte noir

#### 4. Calendrier Fertilité
- Légendes en NOIR #000000, indicateurs colorés visibles
- Cœurs rapports : z-index 20, classe `.fertility-calendar` pour isolation CSS
- Aucun blur/transparence

#### 5. Accueil
- Cœurs flottants avec animation `heartFloat` (mouvement haut/bas + léger latéral)
- Pas de bulle blanche autour du titre

---

## Règles de design strictes
1. Pas de transparence, pas de flou (backdrop-filter: blur)
2. Cartes = gris dégradé blanc glossy nacré (sauf Admin/Accueil)
3. TOUS les textes en NOIR (#000000)
4. Icônes colorées selon cycle : Jaune → Bleu → Vert → Rouge → Violet
5. Bulles d'icônes = gris dégradé blanc glossy bombé

---

## Packages Stripe
| Package | Price ID | Montant |
|---------|----------|---------|
| Premium 9 mois | annual | 30€ |
| Post-partum 6 mois | postpartum | 10€ |

---

## Backlog / Tâches futures

### P0 - Terminé
- [x] Calendrier : légendes visibles, cœurs z-index, texte noir
- [x] Admin : texte noir sur tuiles, couleurs pastel
- [x] Cartes gris dégradé glossy sur toutes les sections
- [x] Couleurs icônes Jaune→Bleu→Vert→Rouge→Violet
- [x] Codes promo Stripe déjà en place

### P1 - Prioritaire
- [ ] Publication Google Play Store (APK via Android Studio) - BLOQUÉ (action utilisateur)

### P2 - Améliorations
- [ ] Vérifier les sous-pages PostPartum individuelles (portage, allaitement, etc.)

---

## Credentials de test
Voir `/app/memory/test_credentials.md`

---

*Dernière mise à jour: 13 Avril 2026 - v4.8.0 Design Nacré Global*
