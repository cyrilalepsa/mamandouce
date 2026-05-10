# MamanDouce v5.6.0 — Cycle Couleurs Complet

## Règles immuables (33 Prompts)
1. **Cartes: BLANC INTENSE nacré** (gradient #fff → #f0f0f2)
2. **ZÉRO VOILE BLANC** sur les cartes
3. **Cycle couleurs: Jaune → Bleu → Rouge → Vert → Violet**
4. **Titres en texte pur** (pas de bulles)
5. **Texte: NOIR PUR #000000**
6. **Boutons action: Rose glossy 3D bombé**
7. **overscroll-behavior-y: contain** (pull-to-refresh)

## Cycle couleurs appliqué à TOUS les niveaux

### Niveau 1 — Sections principales (JourneyStepsPage)
Préconception=Jaune, Grossesse=Bleu, Bébé=Rouge, Post-partum=Vert, Services=Violet

### Niveau 2 — Sous-sections (SectionDetailPage)
Chaque section suit: Jaune → Bleu → Rouge → Vert → Violet

### Niveau 3 — Sous-pages (pages individuelles)
- **PostpartumAlimentationPage** (header Bleu): Allaitement=J, Biberons=B, Diversification=R, Recettes=V
- **PostpartumSoinsPage** (header Rouge): Coucher=J, Portage=B
- **PostpartumSecuritePage** (header Vert): Difficultés=J, Précautions=B
- **PostpartumRdvPage** (header Jaune)
- **BabyPrepTipsPage**: Médical=J, Admin=B, Psycho=R, Pratique=V
- **BabyVideosPage**: 8 items suivant J→B→R→V→Vi→J→B→R

### Niveau 4 — Sous-sous-pages (feuilles)
Allaitement=J, Biberons=B, Diversification=R, Recettes=V
CoucherChange=J, Portage=B, Difficultés=J, Précautions=B

## Architecture CSS (v3.0 Modulaire)
`styles/glossy/` — 12 modules importés par `glossy.css`

## Changelog
- **13 Avr 2026**: CSS modulaire + 33 prompts (blanc intense, zéro voile, cycle global)
- **13 Avr 2026**: Cycle couleurs étendu à toutes les sous-sections et sous-sous-sections

*MàJ: 13 Avril 2026*
