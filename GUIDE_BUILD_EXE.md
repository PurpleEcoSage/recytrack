# Guide de création de l'exécutable RecyTrack (.exe)

## 📋 Prérequis

### Sur Windows (Recommandé)
1. **Node.js** (v18 ou supérieur)
2. **npm** ou **yarn**
3. **Visual Studio Build Tools** (pour certaines dépendances natives)

### Sur Linux (Cross-compilation)
1. **Wine** pour tester l'exe
2. **Node.js** et **npm**
3. **Docker** (optionnel, pour un build isolé)

## 🚀 Étapes de création

### 1. Préparer le projet

```bash
# Cloner le projet si nécessaire
git clone <votre-repo>
cd recytrack

# Installer les dépendances du frontend
cd frontend
npm install
npm run build
cd ..

# Copier le build dans electron
cp -r frontend/build electron/

# Aller dans le dossier electron
cd electron
```

### 2. Configurer les icônes

Créez une icône Windows (.ico) à partir du logo :

```bash
# Sur Windows (avec ImageMagick)
magick convert icons/icon.png -define icon:auto-resize=256,128,64,48,32,16 icons/icon.ico

# Ou utilisez un outil en ligne :
# https://convertio.co/png-ico/
# https://www.icoconverter.com/
```

### 3. Installer les dépendances Electron

```bash
cd electron
npm install
```

### 4. Remplacer main.js

```bash
# Utiliser la version PostgreSQL
mv main.js main-mongo.js
mv main-postgres.js main.js
```

### 5. Créer l'exécutable

#### Option A : Build simple (plus rapide)
```bash
npm run dist:win
```

#### Option B : Build avec toutes les architectures
```bash
npm run dist
```

### 6. Localiser les fichiers générés

Les fichiers seront dans `electron/dist/` :
- **RecyTrack Setup 1.0.0.exe** - Installateur Windows
- **RecyTrack-1.0.0-win.zip** - Version portable

## 🐧 Cross-compilation depuis Linux

### Utiliser Docker (Recommandé)

```bash
# Créer un Dockerfile pour le build
cat > Dockerfile.build << EOF
FROM electronuserland/builder:wine

WORKDIR /app
COPY . .

RUN cd frontend && npm install && npm run build
RUN cp -r frontend/build electron/
RUN cd electron && npm install
RUN cd electron && npm run dist:win

CMD ["echo", "Build complete!"]
EOF

# Lancer le build
docker build -f Dockerfile.build -t recytrack-builder .
docker run -v $(pwd)/electron/dist:/app/electron/dist recytrack-builder
```

### Sans Docker

```bash
# Installer wine et les dépendances
sudo apt-get install wine wine32 wine64

# Lancer le build
cd electron
npm run dist:win
```

## 📦 Distribution

### 1. Signature du code (Optionnel mais recommandé)

Pour éviter les avertissements Windows :
- Achetez un certificat de signature de code
- Configurez electron-builder pour signer automatiquement

### 2. Auto-mise à jour

Configurez un serveur de mise à jour :
```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "votre-username",
      "repo": "recytrack"
    }
  }
}
```

### 3. Installation silencieuse

Pour les déploiements entreprise :
```bash
RecyTrack-Setup.exe /S /D=C:\Program Files\RecyTrack
```

## 🛠️ Personnalisation avancée

### Modifier l'installateur NSIS

Créez `electron/build/installer.nsh` :
```nsh
!macro customHeader
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customHeader"
!macroend

!macro customInit
  ; Code d'initialisation personnalisé
!macroend

!macro customInstall
  ; Créer les raccourcis supplémentaires
  CreateShortcut "$DESKTOP\RecyTrack.lnk" "$INSTDIR\RecyTrack.exe"
!macroend
```

### Embarquer PostgreSQL

Pour une version totalement autonome :

1. Télécharger PostgreSQL portable
2. L'ajouter dans `extraResources`
3. Modifier `main.js` pour démarrer PostgreSQL embarqué

## 🐛 Dépannage

### Erreur "cannot find module"
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### L'exe ne se lance pas
- Vérifier les logs : `%APPDATA%\RecyTrack\logs`
- Lancer avec la console : `RecyTrack.exe --enable-logging`
- Désactiver l'antivirus temporairement

### Build échoue sur Linux
```bash
# Installer les dépendances manquantes
sudo apt-get install build-essential
sudo apt-get install libgtk-3-dev libwebkitgtk-3.0-dev
```

## 📱 Versions futures

- **Version Mac** : `npm run dist:mac`
- **Version Linux** : `npm run dist:linux`
- **Version Microsoft Store** : Utiliser `electron-windows-store`

---

💡 **Astuce** : Testez toujours l'exe sur une machine Windows vierge avant distribution !