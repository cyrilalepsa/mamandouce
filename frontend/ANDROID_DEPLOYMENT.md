# Guide de déploiement Android - MamanDouce

## Prérequis

Pour générer l'APK, vous aurez besoin de :

1. **Java JDK 17+** 
   - Télécharger: https://adoptium.net/
   - Définir `JAVA_HOME`

2. **Android Studio** (ou Android SDK)
   - Télécharger: https://developer.android.com/studio
   - SDK Android API 33+
   - Build Tools

## Structure du projet

```
/app/frontend/
├── android/                 # Projet Android natif (généré par Capacitor)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── assets/     # Build web (copié automatiquement)
│   │   │   ├── res/        # Ressources Android (icônes, etc.)
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   └── build.gradle
├── build/                   # Build React (source pour Capacitor)
├── capacitor.config.json    # Configuration Capacitor
└── build-android.sh         # Script de build automatisé
```

## Commandes de build

### 1. Build complet (React + Android)

```bash
cd /app/frontend

# Build React
CI=false GENERATE_SOURCEMAP=false yarn build

# Sync avec Capacitor
npx cap sync android

# Ouvrir dans Android Studio
npx cap open android
```

### 2. Build APK en ligne de commande

```bash
cd /app/frontend/android

# APK Debug (pour test)
./gradlew assembleDebug
# Résultat: app/build/outputs/apk/debug/app-debug.apk

# APK Release (pour production)
./gradlew assembleRelease
# Résultat: app/build/outputs/apk/release/app-release-unsigned.apk
```

### 3. Build AAB pour Play Store

```bash
cd /app/frontend/android

./gradlew bundleRelease
# Résultat: app/build/outputs/bundle/release/app-release.aab
```

## Signature de l'APK (Production)

Pour publier sur le Play Store, vous devez signer l'APK :

### 1. Créer un keystore

```bash
keytool -genkey -v -keystore mamandouce-release.keystore \
  -alias mamandouce -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configurer la signature

Ajouter dans `android/app/build.gradle` :

```gradle
android {
    signingConfigs {
        release {
            storeFile file('mamandouce-release.keystore')
            storePassword 'VOTRE_MOT_DE_PASSE'
            keyAlias 'mamandouce'
            keyPassword 'VOTRE_MOT_DE_PASSE'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## Configuration Play Store

### Informations requises

- **Nom de l'app**: MamanDouce
- **Package**: com.mamandouce.app
- **Version**: 1.0.0
- **SDK minimum**: 22 (Android 5.1)
- **SDK cible**: 34 (Android 14)

### Assets requis

1. **Icône de l'app** (512x512 PNG)
2. **Feature graphic** (1024x500 PNG)
3. **Screenshots** (min 2, format téléphone)
4. **Description courte** (max 80 caractères)
5. **Description longue** (max 4000 caractères)

### Catégorie suggérée

- **Catégorie principale**: Santé et remise en forme
- **Sous-catégorie**: Santé féminine / Grossesse

## Mise à jour de l'application

Après chaque modification du code React :

```bash
cd /app/frontend

# 1. Rebuild React
yarn build

# 2. Sync Capacitor
npx cap sync android

# 3. Incrémenter la version dans android/app/build.gradle
#    versionCode: +1
#    versionName: "1.0.1"

# 4. Rebuild APK/AAB
cd android && ./gradlew bundleRelease
```

## Troubleshooting

### Erreur "JAVA_HOME not set"
```bash
export JAVA_HOME=/path/to/java
export PATH=$JAVA_HOME/bin:$PATH
```

### Erreur "SDK location not found"
Créer `android/local.properties` :
```
sdk.dir=/path/to/android/sdk
```

### Erreur de build Gradle
```bash
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

## Contact

Pour toute question sur le déploiement, consultez :
- Documentation Capacitor: https://capacitorjs.com/docs
- Console Play Store: https://play.google.com/console
