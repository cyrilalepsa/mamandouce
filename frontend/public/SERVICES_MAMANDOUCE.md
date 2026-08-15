# 📋 MamanDouce - Liste des Services & Intégrations

**Document généré le : Mars 2025**
**Application : MamanDouce - Votre compagnon de grossesse**
**URL Production :** https://mamandouce.neriacorp.com (écosystème NeriaCorp)

---

## 🛠️ 1. DÉVELOPPEMENT & HÉBERGEMENT

### Repository autonome (GitHub / local)
- **Utilisation** : Build & run 100 % indépendants (NeriaCorp / Railway / local)
- **Frontend** : `npm install && npm run build` (Vite)
- **Backend** : `pip install -r requirements.txt` puis `uvicorn server:app`

### Railway (railway.app)
- **Utilisation** : Hébergement de l'application en production
- **Services hébergés** :
  - Frontend React
  - Backend FastAPI
  - Base de données MongoDB
- **Plan recommandé** : Hobby ($5/mois)
- **URL du projet** : https://railway.app/project/[votre-projet]

### Cloudflare (cloudflare.com)
- **Utilisation** : Gestion DNS pour le domaine personnalisé
- **Coût** : Gratuit (plan DNS)

---

## 🌐 2. DOMAINE

### mamandouce.neriacorp.com (écosystème NeriaCorp — zone B2C)
- **Domaine produit** : mamandouce.neriacorp.com
- **Zone portail** : **B2C** (consommatrices)
- **Emails** : `noreply@neriacorp.com` / `contact@neriacorp.com` (ou `SENDER_EMAIL` / `CONTACT_EMAIL`)
- **DNS géré par** : Cloudflare (recommandé)
- **API** : via `VITE_BACKEND_URL` / Worker NeriaCorp (`api.neriacorp.com`)
- **Catalogue portail** : `GET /api/neriacorp/catalog` · manifeste `/neriacorp-app.json`

---

## 🗄️ 3. BASE DE DONNÉES

### MongoDB
- **Utilisation** : Stockage de toutes les données de l'application
- **Données stockées** :
  - Comptes utilisateurs
  - Profils de grossesse
  - Historique des conversations IA
  - Préférences et paramètres
  - Cache des traductions
- **Hébergement** : Inclus dans Railway

---

## 💳 4. PAIEMENTS

### Stripe (stripe.com)
- **Utilisation** : Gestion des abonnements Premium
- **Fonctionnalités** :
  - Paiement par carte bancaire
  - Gestion des abonnements récurrents
  - Webhooks pour les notifications
- **Coût** : ~2.9% + 0.30€ par transaction
- **Dashboard** : https://dashboard.stripe.com

#### Clés Stripe à conserver :
- `STRIPE_SECRET_KEY` : sk_live_xxxx (production)
- `STRIPE_PUBLISHABLE_KEY` : pk_live_xxxx (production)
- `STRIPE_WEBHOOK_SECRET` : whsec_xxxx

---

## 📧 5. EMAILS

### Resend (resend.com)
- **Utilisation** : Envoi d'emails transactionnels
- **Types d'emails** :
  - Réinitialisation de mot de passe
  - Confirmation d'inscription
  - Notifications importantes
- **Coût** : Gratuit jusqu'à 3000 emails/mois
- **Dashboard** : https://resend.com/emails

#### Clé Resend à conserver :
- `RESEND_API_KEY` : re_xxxx

---

## 🤖 6. INTELLIGENCE ARTIFICIELLE

### OpenAI (API officielle)
- **Utilisation** :
  - Chatbot IA disponible 24/7
  - Scanner alimentaire vision
  - Traduction automatique du contenu dynamique
  - Expert comptable admin
- **Modèles** : `gpt-4o-mini` (chat) / `gpt-4o` (vision) — configurables via env
- **Accès** : `OPENAI_API_KEY` (SDK `openai` PyPI)
- **Coût** : Selon utilisation OpenAI

---

## 📱 7. PUBLICATION MOBILE

### Google Play Console (play.google.com/console)
- **Utilisation** : Publication de l'app Android
- **Coût** : $25 (paiement unique, à vie)
- **Statut** : En attente de publication

### Apple Developer Program (developer.apple.com) - Optionnel
- **Utilisation** : Publication sur l'App Store (iPhone/iPad)
- **Coût** : $99/an
- **Statut** : Non configuré

---

## 💰 RÉCAPITULATIF DES COÛTS

### Coûts mensuels fixes
| Service | Coût mensuel |
|---------|--------------|
| Railway (Hobby) | ~$5 |
| Resend | Gratuit |
| Cloudflare DNS | Gratuit |
| **TOTAL MENSUEL** | **~$5/mois** |

### Coûts annuels
| Service | Coût annuel |
|---------|-------------|
| Domaine mamandouce.neriacorp.com (NeriaCorp) | Selon registrar |
| Railway (Hobby x 12 mois) | ~$60 |
| **TOTAL ANNUEL** | **~$70.46/an** |

### Coûts uniques (une seule fois)
| Service | Coût |
|---------|------|
| Google Play Console | $25 |
| Apple Developer (optionnel) | $99/an |

### Coûts variables
| Service | Coût |
|---------|------|
| Stripe | 2.9% + 0.30€ / transaction |
| OpenAI API | Selon utilisation |

---

## 🔐 CHECKLIST SÉCURITÉ

- [ ] Sauvegarder toutes les clés API dans un gestionnaire de mots de passe
- [ ] Ne jamais partager les clés de production publiquement
- [ ] Activer l'authentification 2FA sur tous les services
- [ ] Conserver le fichier keystore Android (.jks) en lieu sûr
- [ ] Documenter les mots de passe du keystore

---

## 📞 CONTACTS SUPPORT

- **OpenAI** : platform.openai.com
- **Railway** : help.railway.app
- **Stripe** : support.stripe.com
- **Resend** : resend.com/docs

---

## 📝 NOTES

Ce document contient des informations sensibles. 
Conservez-le en lieu sûr et ne le partagez pas publiquement.

---

*Document créé avec ❤️ pour MamanDouce*
