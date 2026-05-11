# MamanDouce v10.1.0 — Bugfixes & validation Birth List + DPA

## ✅ Sessions récentes
1. Menu 3-points: position fixed, plus de décalage (CSS :not(.fixed))
2. HomePage: height 100dvh + overflow hidden (page fixe)
3. Scanner IA: déplacé de la bibliothèque vers catégorie scanner (grossesse)
4. Sac de maternité: GlossyReflect crash corrigé
5. Favoris: même fix GlossyReflect
6. **BirthListPage v2** (refonte 2 onglets : Référence + Ma Liste, soumission gamifiée, magasins externes) — TESTÉ ✅
7. **Backend `birth_list_item`** ajouté aux types valides de `/api/contributions/submit` — TESTÉ ✅
8. **Frontend** envoie maintenant `title` requis lors d'une proposition d'article — TESTÉ ✅
9. **Cycle Tracking** — bouton "Je suis enceinte !" + DPA (last_period + 280 j) validé end-to-end ✅

## Architecture CSS
- `_cards-nacre.css`: exclusions :not(.fixed) pour préserver position fixed
- Cycle couleurs strict : Jaune → Bleu → Rouge → Vert → Violet

## API contributions (P0 fixé)
- POST /api/contributions/submit accepte désormais `food_scan`, `maternity_bag`, `recipe`, `birth_list_item`
- Le frontend BirthListPage envoie : `{ contribution_type, title, description, data: { name, category } }`

## Roadmap restante
- 🟡 P2 : Refactor `CycleTrackingPage.js` (1343 lignes) en plusieurs composants
- 🟡 P2 : Refactor `DragDropComponents.jsx` (1000+ lignes)
- ⚪ Action utilisateur : déploiement Railway / Google Play Store
- ⚪ Suivi visuel utilisateur sur mobile (validation finale)

*MàJ : 11 Fév 2026*
