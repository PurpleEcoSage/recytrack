#!/bin/bash

echo "🚀 Construction de RecyTrack Desktop pour Windows..."

# 1. Build du frontend
echo "📦 Construction du frontend..."
cd frontend
npm run build
cd ..

# 2. Copier le build dans electron
echo "📋 Copie des fichiers..."
rm -rf electron/build
cp -r frontend/build electron/

# 3. Installer les dépendances Electron
echo "📦 Installation des dépendances Electron..."
cd electron
npm install

# 4. Créer les icônes si nécessaire
if [ ! -f "icons/icon.ico" ]; then
    echo "🎨 Création de l'icône Windows..."
    mkdir -p icons
    # Copier l'icône depuis le frontend
    cp ../frontend/public/logo192.png icons/icon.png
    
    # Message pour la conversion
    echo "⚠️  Vous devez convertir icon.png en icon.ico pour Windows"
    echo "   Utilisez un outil en ligne ou ImageMagick:"
    echo "   convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico"
fi

# 5. Build pour Windows
echo "🔨 Construction de l'exécutable Windows..."
npm run dist:win

echo ""
echo "✅ Construction terminée !"
echo "📁 L'installateur Windows se trouve dans : electron/dist/"
echo ""
echo "📦 Fichiers générés :"
ls -la dist/*.exe 2>/dev/null || echo "   Aucun fichier .exe trouvé"
echo ""
echo "🚀 Pour installer : Double-cliquez sur le fichier .exe"