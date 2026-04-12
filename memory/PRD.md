# MamanDouce - Application de suivi grossesse et maternité

## Description
Application mobile PWA (encapsulée via Capacitor) de suivi de grossesse et maternité avec UI/UX soignée style "Nacre & Contraste", personnalisation Premium et navigation fluide.

## Stack technique
- **Frontend**: React + Tailwind CSS + Capacitor (Android) + Leaflet.js + Recharts + canvas-confetti
- **Backend**: FastAPI + MongoDB + reportlab (PDF)
- **Hosting**: Railway
- **Intégrations**: OpenAI GPT-5.2 (Expert IA), GPT-4o Vision (scanner IA), Stripe (paiements), Resend (emails)

---

## Version actuelle: v4.6.0 (Avril 2026)

### Nouveautés v4.6.0 - Sécurité Paiement & Premium Avatar Final

#### 1. PremiumSunAvatar - Effet Diamant Final
- **30 sparkles** dispersés aléatoirement sur toute la surface du halo jaune (positions -12% à 115%)
- **Animation floating-avatar** : mouvement vertical 5px, cycle 10s, pour un effet d'apesanteur
- **Sparkles diamant** : triple box-shadow blanc, z-index 10000, animation sparkle-magic
- **Refactorisé** : Les 30 sparkles sont maintenant générés via `.map()` au lieu de divs hardcodés

#### 2. Sécurité Paiement (Double Vérification Sous-Marin)
- **Côté Client** : Le bouton "Acheter" envoie uniquement `price_id` et `promo_code` (optionnel). AUCUN montant n'est transmis par le client
- **Côté Serveur** : Le serveur calcule le prix final depuis `SUBSCRIPTION_PACKAGES`, vérifie le coupon auprès de Stripe (`PromotionCode.list`), et crée la session avec ses propres valeurs
- **Compatibilité Legacy** : Le champ `package_id` est toujours accepté en plus de `price_id`
- **Metadata sécurisé** : Le montant attendu (`server_expected_amount`) est stocké dans les métadonnées de la session Stripe

#### 3. Monitoring "Le Garagiste"
- **Alerte ROUGE** : Si le webhook reçoit un paiement dont le montant ne correspond pas au calcul serveur, le voyant du dashboard admin passe au ROUGE immédiatement
- **Voyant VERT** : "Tunnel d'achat OK — Aucun écart de facturation" quand tout est normal
- **Logs** : Chaque écart est enregistré dans `billing_alerts.log` + collection MongoDB `billing_alerts`
- **Résolution** : Bouton "Résoudre" pour marquer les alertes comme traitées

#### Nouveaux Endpoints API - Sécurité Paiement
- `POST /api/payments/checkout/session` : Accepte `price_id` (ou `package_id` legacy) + `promo_code` optionnel. Prix calculé côté serveur
- `GET /api/payments/billing-alerts` : Liste des alertes de facturation (admin only)
- `POST /api/payments/billing-alerts/{index}/resolve` : Résoudre une alerte

---

## Packages Stripe
| Package | Price ID | Montant |
|---------|----------|---------|
| Premium 9 mois | annual | 30€ |
| Post-partum 6 mois | postpartum | 10€ |

---

## Backlog / Tâches futures

### P1 - Prioritaire
- [ ] Appliquer le design "Nacre" à toutes les pages restantes (couleurs pastel, bordures arrondies, ombres douces)
- [ ] Publication Google Play Store (APK via Android Studio) - BLOQUÉ (action utilisateur)

### P2 - Améliorations
- [ ] Support complet des codes promo Stripe dans le tunnel d'achat (UI champ promo)

---

## Credentials de test
Voir `/app/memory/test_credentials.md`

## Documentation technique
- `/app/backend/docs/RAILWAY_OPTIMIZATION.md`
- `/app/backend/RAILWAY_DEPLOY.md`

---

*Dernière mise à jour: Avril 2026 - v4.6.0 Sécurité Paiement & Premium Avatar*
