# MamanDouce - Application de suivi grossesse et maternité

## Description
Application mobile PWA (encapsulée via Capacitor) de suivi de grossesse et maternité avec UI/UX soignée style "Nacre & Contraste", personnalisation Premium et navigation fluide.

## Stack technique
- **Frontend**: React + Tailwind CSS + Capacitor (Android) + Leaflet.js + Recharts + canvas-confetti
- **Backend**: FastAPI + MongoDB + reportlab (PDF)
- **Hosting**: Railway
- **Intégrations**: OpenAI GPT-5.2 (Expert IA), GPT-4o Vision (scanner IA), OpenAI TTS-1 (prononciation), Stripe (paiements), Resend (emails)

---

## Version actuelle: v4.5.0 COMPLETE (Avril 2026)

### Nouveautés v4.5.0 - Version Complète avec Backlog vidé

#### 1. Système de Tirelire
- **Page `/tirelire`**: Affichage du solde, historique des transactions
- **Bonus Filleule**: 5€ crédités automatiquement via lien de parrainage
- **Usage**: Déductible de l'achat Premium (30€) ou Post-partum (10€)
- **Générosité Marraine**: Cumul 5€/parrainage dans solde cadeaux
- **Boutons HomePage**: Icône Tirelire (rose) et Trophée (or) en bas à gauche

#### 2. Intelligence Émotionnelle Complète
- **Watchdog Cycle (J+15)**: Widget dans le profil avec alerte retard règles
- **Effet WAOUH Annonce Grossesse**: Animation confettis + cœurs + message
- **Messages Spéciaux**: Anniversaire, Noël, Saint-Valentin, Fête des mères
- **Milestones Grossesse**: Semaines 12, 20, 28, 37
- **EmotionalIntelligenceProvider**: Composant global dans App.js

#### 3. Module Prénoms Complet
- **Comparateur de Prénoms**: Bouton Scale dans header, analyse syllabes/popularité/caractéristiques
- **Audio Prononciation (TTS)**: Bouton Volume2 sur chaque prénom, OpenAI TTS-1 voix "nova"
- **Historique comparaisons**: Sauvegardé en base

#### 4. Modération Marraines Or
- **Page `/moderation`**: Interface de vote pour contributions en attente
- **Règles de validation**: 3 approuvés OU 2 rejetés pour finaliser
- **Accès depuis profil**: Bouton visible si `gold_status=true`
- **Historique des votes**: Stats personnelles de modération

#### 5. Micro-animations Premium
- **animate-glow-pulse**: Pulsation lumineuse pour widgets importants
- **animate-float**: Flottement léger pour cartes premium
- **animate-shimmer**: Effet nacré brillant
- **animate-heartbeat**: Battement pour cœurs
- **animate-sparkle**: Scintillement pour badges
- **animate-bounce-in**: Entrée avec rebond
- **widget-hover**: Micro-interaction au survol

#### 6. Design 'Nacre & Contraste'
- **Fond Nacre**: Rose poudré #FFF8F9 (au lieu de blanc pur)
- **Texte Contrasté**: Gris anthracite #2D2A32 (meilleure lisibilité)
- **Champs de saisie**: Bordures 2px visibles, ombres inset, focus rose
- **Cartes**: Glassmorphism nacre avec neumorphisme marqué
- **Boutons**: Bordures visibles, ombres 3D prononcées

#### Nouveaux Endpoints API - Module Prénoms
- `POST /api/babynames/compare` : Comparer 2-5 prénoms (syllabes, popularité, caractéristiques)
- `GET /api/babynames/comparison-history` : Historique des comparaisons
- `GET /api/babynames/pronounce-base64/{name}` : Prononciation audio base64 (TTS)
- `GET /api/babynames/pronounce/{name}` : Prononciation audio MP3 direct
- `GET /api/babynames/moderation/pending` : Contributions en attente (Gold only)
- `POST /api/babynames/moderation/{id}/vote` : Voter sur une contribution
- `GET /api/babynames/moderation/my-votes` : Historique de mes votes

#### Endpoints API - Tirelire
- `GET /api/tirelire/balance` : Solde + prix après réduction
- `POST /api/tirelire/apply-referral-bonus` : Appliquer bonus 5€
- `POST /api/tirelire/use-for-purchase` : Calculer réduction
- `POST /api/tirelire/confirm-discount` : Confirmer réduction
- `POST /api/tirelire/send-gift` : Envoyer cadeau

#### Endpoints API - Intelligence Émotionnelle
- `GET /api/emotional/cycle-status` : Statut cycle J+15
- `GET /api/emotional/special-dates` : Messages fêtes
- `GET /api/emotional/pending-notifications` : Notifications émotionnelles
- `POST /api/emotional/pregnancy-announced` : Annoncer grossesse (WAOUH)
- `POST /api/emotional/mark-celebrated` : Marquer célébration vue

---

### BACKLOG VIDÉ ✅
Toutes les fonctionnalités demandées ont été implémentées et testées.

---

### Version 4.4.0 - Système Contributions, Expert Comptable IA & Badges

#### 1. Tarification mise à jour
- **Premium**: 30€ pour 9 mois (au lieu de 27€)
- **Post-partum**: 10€ paiement unique (au lieu de 8€)
- Tous les affichages, encarts et boutons de paiement mis à jour

#### 2. Inscription - Nouveaux champs
- **Date de naissance** (`birth_date`): Champ date avec icône Calendar
- **Statut** (`status`): Choix entre "Envie de bébé" ou "Enceinte"
  - Boutons interactifs avec icônes Heart/Baby
  - Animation de sélection avec checkmark

#### 3. Système de Contributions & Badges
- **Soumission de contributions**: Scan alimentaire, Sac maternité, Recettes bébé
- **Flux de validation**: Soumission → Statut "En attente" → Validation Admin → +1 Contribution
- **Paliers de badges**:
  - **Bronze**: 3 contributions validées
  - **Argent**: 1 parrainage + 2 contributions validées
  - **Or (Marraine)**: 3 parrainages + 5 contributions validées
- **Messages de félicitations**: Doux et encourageants pour Bronze/Argent
- **Effet WAOUH Badge Or**: Explosion de cœurs dorés + scintillements nacre (canvas-confetti)
- **Page Trophées** (`/trophies`): Jauge de progression, icône Trophée 3D sur l'accueil

#### 4. Parrainage & Cadeaux
- **2 parrainages** = Post-partum gratuit personnel
- **3+ parrainages** = Bouton "Offrir Post-partum 🎁"
- **5+ parrainages** = Bouton "Offrir Premium 🎁"

#### 5. Dashboard Admin Expert Comptable IA
- **Calculateur Réel**:
  - Taux URSSAF: 26%
  - Frais Stripe: 2,9% + 0,25€/transaction
  - CA Brut, Bénéfice Net calculés automatiquement
- **KPI Widgets**: CA Brut, Frais Stripe, URSSAF, Bénéfice Net
- **Cumul Annuel**: CA Total, Premium count, Post-partum count
- **Seuil TVA**: 36 800€ avec jauge de progression et alertes
- **Graphique Évolution**: 12 mois avec Recharts (CA Brut + Bénéfice Net)
- **Expert IA Chat (GPT-5.2)**:
  - Conseils sur paliers de CA
  - Aides disponibles (ACRE, etc.)
  - Analyse des tendances de croissance
  - Alertes stratégiques
- **Export PDF**: Bilan comptable mensuel style Nacre/Pro
- **Alertes Stratégiques**: Seuil TVA, croissance, échéances URSSAF

#### 6. Interface Validation Contributions Admin
- **Filtres**: En attente, Validées, Refusées, Toutes
- **Stats Cards**: Nombre par statut
- **Validation rapide**: Boutons Valider/Refuser avec notes admin
- **Notifications**: Push notification à l'utilisatrice lors de validation

#### 7. Intelligence Émotionnelle (Routes backend prêtes)
- **Watchdog cycle** (J+15): Détection retard de règles
- **Effet Waouh annonce grossesse**: Célébration spéciale
- **Messages spéciaux**: Anniversaire, Noël, Saint-Valentin, Fête des mères
- **Milestones grossesse**: Semaines 12, 20, 28, 37

#### Nouveaux Endpoints API
- `GET /api/admin/accounting/kpis` : KPIs comptables (CA, URSSAF 26%, Stripe, Bénéfice)
- `GET /api/admin/accounting/monthly-evolution` : Évolution sur 12 mois
- `GET /api/admin/accounting/alerts` : Alertes stratégiques
- `POST /api/admin/accounting/chat` : Chat avec Expert IA (GPT-5.2)
- `GET /api/admin/accounting/export-pdf` : Export PDF bilan mensuel
- `POST /api/contributions/submit` : Soumettre une contribution
- `GET /api/contributions/my` : Mes contributions
- `GET /api/contributions/badge-progress` : Progression badges
- `GET /api/contributions/gift-eligibility` : Éligibilité cadeaux
- `POST /api/contributions/claim-free-postpartum` : Réclamer post-partum gratuit
- `GET /api/admin/contributions/pending` : Contributions en attente
- `POST /api/admin/contributions/{id}/validate` : Valider/refuser contribution
- `GET /api/emotional/cycle-status` : Statut cycle menstruel
- `POST /api/emotional/pregnancy-announced` : Annoncer grossesse
- `GET /api/emotional/special-dates` : Vérifier dates spéciales

### Version 4.3.0 - Refonte Dashboard Admin & Inscription
- `GET /api/admin/city-stats` : Retourne statistiques par ville
- `DELETE /api/admin/messages` : Suppression en masse des messages

#### Fichiers créés/modifiés v4.3.0
- `RegisterForm.jsx` : Champ city avec MapPin + bouton btn-cloud-3d-blue
- `StatsKPIWidget.jsx` : Widget KPIs (nouveau)
- `CityMapWidget.jsx` : Widget carte Leaflet (nouveau)
- `EvolutionChart.jsx` : Graphique Recharts (nouveau)
- `MessagesTab.jsx` : Boutons 3D pour suppression
- `glossy.css` : Classes btn-cloud-3d-blue, btn-cloud-3d-coral, btn-cloud-3d-relief
- `admin.py` : Endpoints kpi-stats, city-stats, delete messages
- `schemas.py` : Champs city et gold_status dans User

---

### Version 4.2.0 - NETTOYAGE FINAL Hiérarchie Visuelle

#### Mode Sombre SUPPRIMÉ DÉFINITIVEMENT
- **ThemeContext.jsx** : Simplifié, retourne toujours `isDarkMode: false`
- **TopBar.jsx** : Toggle lune/soleil supprimé
- **SettingsPage.js** : Section "Apparence" (mode nuit douce + sélecteur couleur d'accent) supprimée
- **glossy.css** : Toutes les règles `.dark` / `html.dark` supprimées (passé de 1094 à ~600 lignes)
- **index.css** : Toutes les règles `html:not(.dark)` simplifiées, règle `html.dark body` supprimée

#### Couleurs de Texte - Précision Chirurgicale
- **Rose Corail #FF8C9F !important** : UNIQUEMENT le titre "MamanDouce" (`mamandouce-title`, `data-testid="mamandouce-logo"`) et le prénom utilisateur (`user-name-display`, `data-testid="user-name"`)
- **Gris Foncé Doux #4A4A4A** : TOUS les titres de sections, textes descriptifs, labels, et éléments text-slate-*/text-gray-*

#### Badges Pastels Spéciaux avec Dégradé Nuage 3D Glossy
- **Fête du jour** : Classe CSS `badge-fete-du-jour` - Jaune pastel vif dégradé (blanc→jaune miel→ambre) avec reflet nuage 3D glossy et neumorphism
- **Semaine X** : Classe CSS `badge-semaine-x` - Rose pastel vif dégradé (blanc→rose→fuchsia) avec reflet nuage 3D glossy et neumorphism

#### Éléments PRÉSERVÉS (NE PAS TOUCHER)
- Fond Aurora Nacre v3 (dégradé Bleu→Nacre→Rose en diagonale 135°)
- Cartes Chamallow 3D (neumorphism, blur, reflets)

### Version 4.1.0 - Style "Chamallow 3D" & Images Fœtus

#### Design Global FINAL (NE PLUS MODIFIER)
- **Fond Nacre Diagonal** : `linear-gradient(135deg, #AEDFF7 0%, #FFFFFF 45%, #FFFFFF 55%, #FFD1DC 100%) fixed`
  - Bleu Ciel (#AEDFF7) en haut-gauche
  - Nacre centrale (45%-55%) blanc
  - Rose Poudré (#FFD1DC) en bas-droite
  - **ZÉRO turquoise, ZÉRO gris sur fond**
  
- **Style Chamallow 3D EXACT** :
  - `background: rgba(255, 255, 255, 0.7) !important`
  - `backdrop-filter: blur(8px)`
  - `box-shadow: 10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF`
  - `border-radius: 20px`
  
- **Titres ROSE CORAIL** (#FF8C9F) :
  - Logo "MamanDouce" : Rose Corail (PAS GRIS!)
  - Prénom utilisateur : Rose Corail (PAS GRIS!)
  
- **Texte Global** : `#4A4A4A` (gris anthracite doux) - sauf titres

- **Couronne Premium** : Jaune Glossy 3D Lumineux
  - `linear-gradient(145deg, #FEF08A 0%, #FDE047 40%, #FACC15 100%)`
  - Effet glow et reflets internes
  
- **Bouton Info** : Vert dégradé nuage bombé glossy 3D
  - `linear-gradient(145deg, #A7F3D0 0%, #6EE7B7 40%, #34D399 100%)`

- **Pagination** : Centrée en bas avec style Chamallow

#### Fichiers modifiés v4.1.0
- `AppTitle.js` : Logo ROSE CORAIL #FF8C9F
- `HomePage.js` : Prénom utilisateur ROSE CORAIL #FF8C9F
- `glossy.css` : Style Chamallow 3D exact (blur 8px, shadow 10px)
- `TutorialPopup.jsx` : Bouton Info vert glossy 3D
- `NavigationSections.jsx` : PASTEL_STYLES avec blur(8px)
- `JourneyStepsPage.js` : Cartes semi-transparentes
- `HomeWidgets.jsx` : Bulle "Les étapes" sans fond blanc
- `HomePagination.jsx` : Pagination centrée en bas

#### Design Neumorphique Global
- **Double ombre diagonale** sur toutes les cartes et boutons :
  - Ombre claire (`-6px -6px 16px rgba(255,255,255,1)`) en haut-gauche = effet lumière
  - Ombre douce (`6px 6px 20px rgba(209,217,230,0.5)`) en bas-droite = effet profondeur
- **Reflet glossy** (pseudo-élément `::before`) sur le dessus des cartes = effet "perle de gel"
- **Inset shadows** pour l'effet bombé intérieur
- **Transition douce** au hover avec légère élévation

#### Composants mis à jour
- `glossy.css` : Variables CSS neumorphiques globales
- `NavigationSections.jsx` : PASTEL_STYLES avec ombres 3D
- `JourneyStepsPage.js` : getCardShadow() avec baseNeumorphShadow
- `HomeWidgets.jsx` : Cartes Semaine X et Journey Steps
- `NameOfTheDay.jsx` : Carte Fête du jour (jaune/ambre)

---

### Version 3.7.0 - Gamification Scanner IA Finalisée

#### Bouton "Envoyer pour analyse" (Aliments Inconnus)
- **Condition d'affichage**: Quand l'IA ne reconnaît pas l'aliment (`is_unknown: true`)
  - Confiance IA < 50%
  - Ou nom générique ("Aliment", "Inconnu", etc.)
- **Design pastel**: Bordure rose pointillée, gradient rose/violet
- **Bouton**: "Envoyer pour analyse" avec icône Send
- **Toast de félicitations**: "Merci pour ta contribution ! Tu aides toutes les mamans de la communauté."
- **Message post-soumission**: Carte verte "Un expert va analyser cet aliment. Ta jauge de badge progresse !"
- **API**: `POST /api/food/user-added-foods` avec `status: pending`

---

### Version 3.3.0 - Scanner IA Alimentaire & Gamification

#### 1. Scanner Alimentaire IA (GPT-4o Vision)
- **Bouton "Scanner mon produit"**: Accès caméra ou upload photo
- **Verdicts clairs**:
  - ✅ AUTORISÉ (Vert) - Sûr à consommer
  - ⚠️ LIMITÉ (Orange) - Avec modération
  - ❌ DÉCONSEILLÉ (Rouge) - À éviter
- **Explications personnalisées**: Ex: "Riche en vitamine B9, excellent pour le fœtus"
- **Alternatives suggérées**: Si aliment déconseillé
- **Nettoyage auto**: Photos supprimées après analyse (Memory Optimizer)
- **Limites**: 3 scans/semaine gratuits, illimité Premium

#### 2. Tirelire avec Jauge Visuelle
- **Jauge "X€ / 30€"**: Progression visuelle animée
- **Démarrage**: 3€ dès l'achat (30€ abonnement)
- **+3€ par parrainage**: Invitation Sérénité réussie
- **Déblocage à 30€**: "Offrir une Invitation Sérénité"
- **Design doux**: Icône cochon, animation confetti

#### 3. Badges d'Engagement (sans bonus €)
- **Bronze**: 3 contributions validées
- **Argent**: 5 contributions validées
- **Or**: 5 contributions + 3 parrainages
  - Récompense: 1 code Premium offert à redistribuer
- ❌ Supprimé: Bonus 1€/contribution (doublons)

#### 4. Encart Paiement Stripe Solidaire
- **Message exact**: "Un geste pour vous, un soutien pour une autre. 3€ de votre abonnement alimentent Le Relais Maman pour offrir une invitation sérénité."
- **Composant**: `StripeSolidarityBanner`

---

### Version 3.2.0 - Système de Solidarité

- Cagnotte Solidaire (Wallet)
- Clôture de Compte Solidaire (Modal donation)
- Interface Admin Solidarité
- Relais Maman (Pot commun)

### Version 3.1.0 - Optimisations DevOps

- Gardien v3.0 - Stratégie "Zéro Bruit"
- Journal de Bord Admin
- Memory Optimizer (Low RAM Profile)

---

## Endpoints API Scanner IA

### Food Scanner
- `POST /api/food/scan/image` - Analyser une image d'aliment
  - Input: `{ image_base64: string, context?: string }`
  - Output: `{ food_name, verdict, explanation, nutrients_info, alternatives }`
- `GET /api/food/scan/history` - Historique des scans

### Wallet (Tirelire)
- `GET /api/solidarity/wallet` - Solde et transactions
- `POST /api/solidarity/wallet/credit-referral` - Crédit +3€ parrainage

### Badges
- `GET /api/solidarity/badges` - Progression et badges
- `POST /api/solidarity/badges/claim-gold-reward` - Réclamer récompense Or

---

## Composants Frontend créés

### Scanner IA
- `/app/frontend/src/components/food/FoodScannerAI.jsx`

### Solidarité / Gamification
- `/app/frontend/src/components/solidarity/TirelireCard.jsx` - Jauge visuelle
- `/app/frontend/src/components/solidarity/BadgesCard.jsx` - Progression badges
- `/app/frontend/src/components/solidarity/StripeSolidarityBanner.jsx` - Encart paiement
- `/app/frontend/src/components/solidarity/AccountArchiveModal.jsx` - Modal clôture

---

## Backlog / Tâches futures

### P1 - Prioritaire
- [ ] Publication Google Play Store (APK via Android Studio) - BLOQUÉ (action utilisateur)
- [x] Intégrer TirelireCard dans le Dashboard principal ✅
- [x] Intégrer FoodScannerAI dans la page Alimentation ✅
- [x] Page Referral "Invitation Sérénité" avec code de parrainage unique ✅

### P3 - Améliorations
- [ ] Audio prononciation pour les prénoms (TTS)
- [ ] Comparateur de prénoms

---

## Nouveautés v3.4.0 - Page Invitation Sérénité (8 Avril 2026)

### Lien de Parrainage Unique
- **Nouveau endpoint**: `GET /api/referral/code` - Génère un code unique 8 caractères
- **Page dédiée**: `/referral` ("Invitation Sérénité")
- **Fonctionnalités**:
  - Affichage du code de parrainage unique (ex: P5CH4XPR)
  - Lien complet copiable: `https://mamandouce.fr/invitation/{CODE}`
  - Boutons "Copier le lien" et "Partager" (Web Share API)
  - Affichage de la tirelire avec solde et progression
  - Section "Comment ça marche ?" avec les 3 étapes
  - Affichage des badges (Bronze/Argent/Or)
  - Statistiques: parrainages réussis et total gagné

### Nouveaux Endpoints API
- `GET /api/referral/code` - Récupère ou génère le code unique
- `GET /api/referral/validate/{code}` - Valide un code de parrainage (public)
- `POST /api/referral/complete-via-code` - Complète un parrainage lors de l'inscription

### Notifications Push Parrainage (v3.4.1)
- **Nouveau parrainage** : "🎉 {Nom} s'est inscrit(e) grâce à vous. +3€ dans votre tirelire !"
- **Jalons tirelire** :
  - 10€ : "💰 10€ dans votre tirelire ! Continuez vos parrainages."
  - 20€ : "💰 20€ dans votre tirelire ! Continuez vos parrainages."
  - 30€ : "🎁 30€ atteints ! Vous pouvez offrir une Invitation Sérénité !"
- **Post-partum débloqué** : "🌟 Grâce à vos 2 parrainages, le suivi post-partum est GRATUIT !"

---

## Nouveautés v3.5.0 - Mode Nuit Douce (8 Avril 2026)

### Nouveau thème sombre "Nuit Douce"
- **Palette globale**: Mauve poudré foncé (#1e1a24) + Gris perle (#d4d0dc) + Glassmorphism
- **Texte crème** (#f5f0eb): Remplace le blanc pur pour un confort visuel optimal
- **Cartes glassmorphism**: Effet verre dépoli avec backdrop-filter blur(12px)
- **Fond dégradé**: Gradient mauve subtil sur toutes les pages

### Effet Veilleuse sur le Bébé 3D
- **Halo lumineux triple couche**: 
  - Couche externe (340px): Radial gradient rose/mauve doux avec animation pulse 4s
  - Couche interne (260px): Animation décalée 3s
  - Spot central (180px): Effet spotlight avec blur variable
- **Particules adaptatives**: Plus petites et lumineuses en mode sombre
- **Drop-shadow SVG**: Ombre rose/crème améliorée sur le bébé

### Fichiers modifiés
- `/app/frontend/src/styles/glossy.css` - Variables CSS et règles glassmorphism complètes
- `/app/frontend/src/index.css` - Nettoyage des conflits avec anciens overrides blanc pur
- `/app/frontend/src/components/pregnancy/Fetus3D.jsx` - Effet veilleuse complet avec animations

### Compatibilité
- Toggle dans Paramètres > Apparence
- Appliqué globalement sur toutes les pages
- Préserve les formes glossy 3D bombées existantes

---

## Version 4.2.0 - Images Hyperréalistes + Aurore Boréale Nacrée (8 Avril 2026)

### Dégradé "Aurore Boréale Nacrée"
- **Nouveau fond** : `linear-gradient(135deg, #7CD6FF 0%, #FFFFFF 35%, #FFFFFF 65%, #FFB7C5 100%)`
- **#7CD6FF** (Bleu Aurore) : Plus saturé, vibrant en haut-gauche
- **#FFFFFF** (Nacre Pure) : Zone élargie (35%-65%) = puits de lumière nacré
- **#FFB7C5** (Rose Vibrant) : Plus chaud, équilibre le bleu en bas-droite
- **Effet Soie Nacrée** : Grain SVG subtil (opacity 1.5%) pour texture "soie" non plastique
- **Sécurité** : Titre "MamanDouce" et prénom restent en #FF8C9F (Rose Corail)

### 20 images hyperréalistes générées par IA (Gemini Imagen-4)
- **Couverture complète**: Semaines 4 à 40 (tous les 2 semaines)
- **Style**: Hyper-réaliste 3D, lumière pastel douce, sac amniotique visible
- **Qualité**: 1024x1024 PNG haute qualité

### Images générées:
| Semaine | Description |
|---------|-------------|
| 4 | Embryon précoce - premières cellules |
| 5 | Embryon avec bourgeon cardiaque |
| 6 | Embryon - tube neural formé |
| 8 | Embryon - membres visibles |
| 10 | Transition embryon/fœtus |
| 12 | Fœtus - traits du visage |
| 14 | Fœtus - coordination des mouvements |
| 16 | Fœtus - mouvements actifs |
| 18 | Fœtus - vernix caseosa |
| 20 | Fœtus - mi-grossesse |
| 22 | Fœtus - lanugo visible |
| 24 | Fœtus - yeux peuvent s'ouvrir |
| 26 | Fœtus - pratique la respiration |
| 28 | Fœtus - graisse sous-cutanée |
| 30 | Fœtus - croissance rapide |
| 32 | Fœtus - peau lisse |
| 34 | Fœtus - poumons matures |
| 36 | Fœtus - position céphalique |
| 38 | Fœtus à terme précoce |
| 40 | Bébé prêt à naître |

### Fichiers modifiés:
- `/app/frontend/public/assets/fetus/` - 20 images PNG
- `/app/frontend/src/components/pregnancy/Baby3DContainer.jsx` - Mapping week→image amélioré

---


## Credentials de test
Voir `/app/memory/test_credentials.md`

---

## Documentation technique
- `/app/backend/docs/RAILWAY_OPTIMIZATION.md`
- `/app/backend/services/food_scanner_ai.py` - Service GPT-4o Vision
- `/app/frontend/src/pages/ReferralPage.js` - Page Invitation Sérénité

---

*Dernière mise à jour: Décembre 2025 - v4.5.1 Nettoyage Audio & Animations*

---

## Changelog Récent

### Décembre 2025 - v4.5.1 Grand Ménage
**SUPPRIMÉ:**
- Module TTS (prononciation audio des prénoms) - backend et frontend
- Comparateur de prénoms (NameComparator, NamePronunciationButton)
- Micro-animations complexes (animate-glow-pulse, animate-float, animate-shimmer, animate-heartbeat, animate-sparkle, animate-bounce-in)
- Éléments décoratifs flottants (Cloud/Feather sur AuthPage, HomePage, TrackingPage, ResetPasswordPage)

**CONSERVÉ:**
- Animations de base (animate-fade-in, animate-spin-slow)
- Modération Gold des prénoms
- Tout le reste de v4.5.0

### Décembre 2025 - Correction Déploiement Railway
- **Problème résolu** : Échec du build Railway causé par le package `emergentintegrations` introuvable sur PyPI public
- **Solution** : Ajout de `--extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/` dans `/app/backend/requirements.txt`
- **Statut** : ✅ Build Railway actif et fonctionnel
