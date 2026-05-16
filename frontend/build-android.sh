#!/bin/bash

# Script de build pour MamanDouce Android
# Usage: ./build-android.sh [debug|release]

set -e

BUILD_TYPE=${1:-debug}
FRONTEND_DIR="/app/frontend"
APK_OUTPUT_DIR="/app/builds"

echo "🚀 Build MamanDouce Android - $BUILD_TYPE"
echo "================================================"

# Aller dans le dossier frontend
cd $FRONTEND_DIR

# 1. Build React
echo "📦 Building React app..."
CI=false GENERATE_SOURCEMAP=false yarn build

# 2. Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# 3. Build Android
echo "🔨 Building Android $BUILD_TYPE..."
cd android

if [ "$BUILD_TYPE" = "release" ]; then
    ./gradlew assembleRelease
    APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
else
    ./gradlew assembleDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

# 4. Copier l'APK
mkdir -p $APK_OUTPUT_DIR
cp $APK_PATH $APK_OUTPUT_DIR/mamandouce-$BUILD_TYPE.apk

echo ""
echo "✅ Build terminé !"
echo "📱 APK disponible: $APK_OUTPUT_DIR/mamandouce-$BUILD_TYPE.apk"
echo ""
echo "Pour installer sur un appareil Android:"
echo "  adb install $APK_OUTPUT_DIR/mamandouce-$BUILD_TYPE.apk"
