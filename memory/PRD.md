# MamanDouce v5.5.0 — Design 33 Prompts Appliqué

## Layout Accueil
- **Haut gauche** : Couronne Premium + Tirelire (fond jaune, cochon rose, sans contour)
- **Haut droite** : Drapeau langue (sans bulle) + Menu
- **Centre** : Avatar avec trophée mat conditionnel (bas-droite)
- **Bas gauche** : Info (vert menthe bombé, niveau pagination) + Ampoule (jaune bombé, au-dessus)

## Règles immuables (33 Prompts)
1. **Cartes: BLANC INTENSE nacré** avec double inset shadow (gradient #fff → #f0f0f2)
2. **ZÉRO VOILE BLANC** sur les cartes (GlossyReflect = null, ::before = display:none)
3. **Bulles logos: COLORÉES pleines** + icône blanche
4. **Texte: NOIR PUR #000000**
5. **Cycle couleurs: Jaune → Bleu → Rouge → Vert → Violet** (Rouge AVANT Vert)
6. **Titres en texte pur** (pas de bulles)
7. **Boutons action: Rose glossy 3D bombé**
8. **overscroll-behavior-y: contain** (pull-to-refresh)
9. Protégés: badge-semaine-x, badge-fete-du-jour, admin-drawer, fertility-calendar
10. **Trophée avatar**: petit badge MAT (bronze/argent/or), seulement si gagné

## Architecture CSS (v3.0.0 - Modulaire)
`glossy.css` est un fichier barrel qui importe 12 modules :
```
styles/glossy/
  _variables.css     — Propriétés CSS custom
  _background.css    — Fond aurore nacrée + pull-to-refresh
  _cards-nacre.css   — Cartes blanc intense + voile blanc supprimé
  _typography.css    — Texte noir pur + logo/prénom rose corail
  _inputs.css        — Champs de saisie nacrés
  _buttons.css       — Boutons Chamallow 3D + btn-action-rose
  _cards-colored.css — Variantes colorées (pink, blue, green, etc.)
  _icons-pills.css   — Icônes 3D + boutons pill glossy
  _utilities.css     — Neumorphic, couronne, hover, transitions
  _overrides.css     — Titres finaux + badges spéciaux
  _buttons-cloud.css — Boutons Cloud 3D (blue, coral, relief)
  _animations.css    — Keyframes (fade-in, spin, heartBreath)
  _exclusions.css    — Calendrier fertilité + Admin drawer
```

## Fichiers clés
- `/app/frontend/src/styles/glossy.css` — Barrel file (imports)
- `/app/frontend/src/styles/glossy/` — 12 modules CSS
- `/app/frontend/src/pages/HomePage.js` — Layout accueil
- `/app/frontend/src/pages/JourneyStepsPage.js` — Sections avec cycle couleurs
- `/app/frontend/src/pages/SectionDetailPage.js` — Items avec cycle couleurs
- `/app/frontend/src/components/ui/card.jsx` — Card sans voile blanc
- `/app/frontend/src/components/ui/CloudCard.jsx` — CloudCard sans voile blanc
- `/app/frontend/src/components/home/TopBar.jsx` — Zen layout haut
- `/app/frontend/src/components/profile/PremiumSunAvatar.jsx` — Avatar + trophée

## Attention CSS
- Ne JAMAIS appliquer de sélecteurs globaux sans `:not()` pour les badges protégés
- Les exclusions sont dans `_exclusions.css` — toujours vérifier avant d'ajouter des règles globales
- L'ordre des imports dans `glossy.css` est critique (cascade CSS)
- Le cycle couleurs est STRICT : Jaune → Bleu → Rouge → Vert → Violet

## Changelog
- **13 Avril 2026** : Refactoring CSS modulaire (glossy.css → 12 modules)
- **13 Avril 2026** : Application des 33 prompts design :
  - Cartes blanc intense (plus gris)
  - Voile blanc supprimé globalement (~30 fichiers)
  - Cycle couleurs corrigé (Rouge↔Vert inversés)
  - Bouton action rose glossy 3D ajouté en CSS

*MàJ: 13 Avril 2026*
