# 📱 Guide de Publication Google Play Store - MamanDouce

## ✅ Préparation terminée

Votre application est prête pour être publiée sur Google Play Store !

---

## 🚀 Étapes pour publier

### Étape 1 : Créer un compte Google Play Console
1. Allez sur [play.google.com/console](https://play.google.com/console)
2. Connectez-vous avec votre compte Google
3. Payez les frais d'inscription uniques de **25$**
4. Complétez la vérification d'identité

### Étape 2 : Générer l'APK/AAB avec PWABuilder (Méthode la plus simple)

1. Allez sur [www.pwabuilder.com](https://www.pwabuilder.com)
2. Entrez l'URL de votre app : `https://premium-ui-27.preview.emergentagent.com`
3. Cliquez sur **"Start"**
4. Attendez l'analyse (quelques secondes)
5. Cliquez sur **"Package for stores"**
6. Sélectionnez **"Android"**
7. Configurez les options :
   - Package ID : `com.mamandouce.app`
   - App name : `MamanDouce`
   - Version : `1.0.0`
8. Cliquez sur **"Generate"**
9. Téléchargez le fichier `.aab` (Android App Bundle)

### Étape 3 : Publier sur Google Play Console

1. Dans Google Play Console, cliquez sur **"Créer une application"**
2. Remplissez les informations :
   - **Nom** : MamanDouce - Compagnon de Grossesse
   - **Langue** : Français
   - **Type** : Application
   - **Gratuit/Payant** : Gratuit (avec achats in-app)

3. Dans **"Production"** → **"Créer une version"** :
   - Uploadez le fichier `.aab` généré
   
4. Complétez la **Fiche Play Store** :

---

## 📝 Informations pour la Fiche Play Store

### Titre (30 caractères max)
```
MamanDouce - Grossesse
```

### Description courte (80 caractères max)
```
Votre compagnon de grossesse : conseils, scanner d'aliments, suivi du bébé
```

### Description complète (4000 caractères max)
```
🤰 MamanDouce - L'application complète pour accompagner votre grossesse en toute sérénité !

✨ FONCTIONNALITÉS PRINCIPALES :

📅 CALCULATEUR DE GROSSESSE
• Calculez votre date d'accouchement prévue
• Suivez votre semaine de grossesse en temps réel
• Calendrier d'ovulation et de conception

🍎 SCANNER D'ALIMENTS
• Vérifiez si un aliment est sûr pendant la grossesse
• Recherche par nom ou code-barres
• Base de données complète des aliments

👶 SUIVI DE L'ÉVOLUTION DU BÉBÉ
• Images de développement semaine par semaine
• Taille et poids estimés du bébé
• Informations sur le développement des organes

📋 CONSEILS HEBDOMADAIRES
• 41 semaines de conseils personnalisés
• Démarches administratives à effectuer
• Rappels pour les rendez-vous médicaux

🩺 SUIVI MÉDICAL
• Calendrier des 20 rendez-vous de grossesse
• Notes personnelles (poids, tension, échographies)
• Rappels automatiques des examens à faire

❤️ ALIMENTS FAVORIS
• Sauvegardez vos aliments préférés
• Alertes personnalisées selon vos favoris
• Conseils nutritionnels adaptés au trimestre

🔗 SERVICES ADMINISTRATIFS
• Accès direct à la CAF
• Lien vers Ameli
• Recherche de mairie

🎡 DISQUE DE GROSSESSE
• Outil interactif de calcul
• Dates clés de votre grossesse

💎 VERSION PREMIUM (25€/an)
• Scanner illimité
• 41 semaines de conseils complets
• Images d'évolution du bébé
• Notifications email
• Sans publicité

🔒 CONFIDENTIALITÉ
• Vos données restent privées
• Conforme RGPD
• Aucune publicité ciblée

MamanDouce est conçue par des professionnels pour vous accompagner tout au long de votre grossesse. Téléchargez maintenant et vivez votre grossesse sereinement !
```

### Catégorie
- **Principale** : Santé et remise en forme
- **Secondaire** : Parentalité

### Classification du contenu
- **Âge** : Tous publics (3+)
- Pas de violence, pas de contenu sexuel, pas de langage inapproprié

### Coordonnées
- **Email** : contact@mamandouce.app
- **Site web** : https://premium-ui-27.preview.emergentagent.com
- **Politique de confidentialité** : https://premium-ui-27.preview.emergentagent.com/privacy

---

## 📸 Screenshots requis

Vous devez fournir au minimum :
- **2 screenshots** pour téléphones (1080x1920 pixels recommandé)
- Optionnel : screenshots pour tablettes (7" et 10")

### Comment créer les screenshots :
1. Ouvrez l'app sur votre téléphone
2. Prenez des captures d'écran des pages principales :
   - Page d'accueil
   - Scanner d'aliments
   - Conseils hebdomadaires
   - Rendez-vous médicaux
   - Évolution du bébé

---

## 🎨 Assets graphiques

### Icône de l'app (512x512)
✅ Déjà créée : `/app/frontend/resources/icon.png`

### Feature Graphic (1024x500)
À créer : bannière promotionnelle pour le Play Store

---

## ⚙️ Configuration technique

### Fichiers importants
- `capacitor.config.json` - Configuration Capacitor
- `android/` - Projet Android natif
- `resources/icon.png` - Icône de l'app

### App ID
```
com.mamandouce.app
```

### Version
```
1.0.0
```

---

## 🔑 Signature de l'app

Google Play gère automatiquement la signature si vous utilisez PWABuilder.
Si vous compilez manuellement, vous devrez créer un keystore.

---

## ❓ FAQ

**Q: Combien de temps pour la validation ?**
R: Généralement 1-3 jours ouvrés

**Q: L'app sera-t-elle gratuite ?**
R: Oui, avec achat in-app optionnel (Premium 25€/an)

**Q: Puis-je modifier l'app après publication ?**
R: Oui, vous pouvez publier des mises à jour à tout moment

---

## 📞 Support

Pour toute question, consultez :
- [Documentation Google Play](https://support.google.com/googleplay/android-developer)
- [Guide PWABuilder](https://docs.pwabuilder.com)
