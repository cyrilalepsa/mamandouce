# MamanDouce v5.4.0 — Architecture Modulaire CSS

## Layout Accueil
- **Haut gauche** : Couronne Premium + Tirelire (fond jaune, cochon rose, sans contour)
- **Haut droite** : Drapeau langue (sans bulle) + Menu
- **Centre** : Avatar avec trophée mat conditionnel (bas-droite)
- **Bas gauche** : Info (vert menthe bombé, niveau pagination) + Ampoule (jaune bombé, au-dessus)

## Règles immuables
1. Cartes: gris nacre bombé avec double inset shadow
2. Bulles logos: COLORÉES pleines + icône blanche
3. Texte: NOIR PUR #000000
4. Trophée avatar: petit badge MAT (bronze/argent/or), seulement si gagné
5. overscroll-behavior-y: contain (pull-to-refresh)
6. Protégés: badge-semaine-x, badge-fete-du-jour, admin-drawer, fertility-calendar

## Architecture CSS (v3.0.0 - Modulaire)
`glossy.css` est désormais un fichier barrel qui importe 12 modules :
```
styles/glossy/
  _variables.css     (38 lignes)  — Propriétés CSS custom
  _background.css    (25 lignes)  — Fond aurore nacrée + pull-to-refresh
  _cards-nacre.css   (70 lignes)  — Cartes globales glossy argenté + caméléon
  _typography.css    (62 lignes)  — Texte noir pur + logo/prénom rose corail
  _inputs.css        (39 lignes)  — Champs de saisie nacrés
  _buttons.css       (78 lignes)  — Boutons Chamallow 3D
  _cards-colored.css (263 lignes) — Variantes colorées (pink, blue, green, etc.)
  _icons-pills.css   (53 lignes)  — Icônes 3D + boutons pill glossy
  _utilities.css     (76 lignes)  — Neumorphic, couronne, hover, transitions
  _overrides.css     (95 lignes)  — Titres finaux + badges spéciaux
  _buttons-cloud.css (176 lignes) — Boutons Cloud 3D (blue, coral, relief)
  _animations.css    (34 lignes)  — Keyframes (fade-in, spin, heartBreath)
  _exclusions.css    (75 lignes)  — Calendrier fertilité + Admin drawer
```

## Fichiers clés
- `/app/frontend/src/styles/glossy.css` — Barrel file (imports)
- `/app/frontend/src/styles/glossy/` — 12 modules CSS
- `/app/frontend/src/pages/HomePage.js` — Layout accueil
- `/app/frontend/src/components/home/TopBar.jsx` — Zen layout haut
- `/app/frontend/src/components/profile/PremiumSunAvatar.jsx` — Avatar + trophée

## Attention CSS
- Ne JAMAIS appliquer de sélecteurs globaux sans `:not()` pour les badges protégés
- Les exclusions sont dans `_exclusions.css` — toujours vérifier avant d'ajouter des règles globales
- L'ordre des imports dans `glossy.css` est critique (cascade CSS)

*MàJ: 13 Avril 2026*
