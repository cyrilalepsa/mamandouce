# 📋 MamanDouce - Liste des Services & Intégrations

**Document généré le : Mars 2025**
**Application : MamanDouce - Votre compagnon de grossesse**
**URL Production : https://mamandouce.cycafamily.com**

---

## 🛠️ 1. DÉVELOPPEMENT & HÉBERGEMENT

### Emergent (emergentagent.com)
- **Utilisation** : Plateforme de développement IA pour la création de l'application
- **Type** : Développement full-stack (React + FastAPI + MongoDB)
- **Coût** : Selon votre plan Emergent

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
- **Domaine** : cycafamily.com
- **Coût** : Gratuit (plan DNS)

---

## 🗄️ 2. BASE DE DONNÉES

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

## 💳 3. PAIEMENTS

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

## 📧 4. EMAILS

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

## 🤖 5. INTELLIGENCE ARTIFICIELLE

### OpenAI GPT-5.2 (via Emergent Universal Key)
- **Utilisation** :
  - Chatbot IA disponible 24/7
  - Traduction automatique du contenu dynamique
- **Modèle** : GPT-5.2
- **Accès** : Via Emergent Universal Key (emergentintegrations)
- **Coût** : Selon utilisation (via Emergent)

---

## 📱 6. PUBLICATION MOBILE

### Google Play Console (play.google.com/console)
- **Utilisation** : Publication de l'app Android
- **Coût** : $25 (paiement unique, à vie)
- **Statut** : En attente de publication

### Apple Developer Program (developer.apple.com) - Optionnel
- **Utilisation** : Publication sur l'App Store (iPhone/iPad)
- **Coût** : $99/an
- **Statut** : Non configuré

---

## 🌐 7. DOMAINE & DNS

### Domaine : cycafamily.com
- **Sous-domaine app** : mamandouce.cycafamily.com
- **Registrar** : [Votre fournisseur de domaine]
- **DNS géré par** : Cloudflare

---

## 💰 RÉCAPITULATIF DES COÛTS

### Coûts mensuels fixes
| Service | Coût mensuel |
|---------|--------------|
| Railway (Hobby) | ~$5 |
| Resend | Gratuit |
| Cloudflare DNS | Gratuit |
| **Total fixe** | **~$5/mois** |

### Coûts variables
| Service | Coût |
|---------|------|
| Stripe | 2.9% + 0.30€ / transaction |
| Emergent Universal Key | Selon utilisation |

### Coûts uniques
| Service | Coût |
|---------|------|
| Google Play Console | $25 (une fois) |
| Apple Developer (optionnel) | $99/an |

---

## 🔐 CHECKLIST SÉCURITÉ

- [ ] Sauvegarder toutes les clés API dans un gestionnaire de mots de passe
- [ ] Ne jamais partager les clés de production publiquement
- [ ] Activer l'authentification 2FA sur tous les services
- [ ] Conserver le fichier keystore Android (.jks) en lieu sûr
- [ ] Documenter les mots de passe du keystore

---

## 📞 CONTACTS SUPPORT

- **Emergent** : support@emergentagent.com
- **Railway** : help.railway.app
- **Stripe** : support.stripe.com
- **Resend** : resend.com/docs

---

## 📝 NOTES

Ce document contient des informations sensibles. 
Conservez-le en lieu sûr et ne le partagez pas publiquement.

---

*Document créé avec ❤️ pour MamanDouce*
