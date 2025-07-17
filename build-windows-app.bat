@echo off
chcp 65001 > nul
title RecyTrack - Création Application Windows

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         RecyTrack - Création de l'Application Windows          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: Vérifier Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé !
    echo.
    echo Téléchargez et installez Node.js depuis : https://nodejs.org/
    echo.
    pause
    exit /b
)

:: Étape 1 : Créer les icônes
echo 📸 Étape 1/5 : Création des icônes...
echo.

if not exist "electron\icons\icon.ico" (
    echo Génération de l'icône RecyTrack...
    
    :: Vérifier Python
    where python >nul 2>&1
    if %errorlevel% eq 0 (
        python create-icon.py
    ) else (
        echo.
        echo ⚠️  Python n'est pas installé. Utilisation de l'icône par défaut.
        echo Pour une icône personnalisée, installez Python et lancez : python create-icon.py
        
        :: Créer une icône simple avec PowerShell
        mkdir electron\icons 2>nul
        powershell -Command "Add-Type -AssemblyName System.Drawing; $bmp = New-Object System.Drawing.Bitmap 256,256; $g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::FromArgb(34,197,94)); $g.DrawString('R', (New-Object System.Drawing.Font('Arial',120,'Bold')), [System.Drawing.Brushes]::White, 50, 50); $bmp.Save('electron\icons\icon.png'); $icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon()); $stream = [System.IO.File]::Create('electron\icons\icon.ico'); $icon.Save($stream); $stream.Close()"
    )
)

:: Étape 2 : Build du Frontend
echo.
echo 📦 Étape 2/5 : Construction du frontend...
cd frontend

if not exist "node_modules" (
    echo Installation des dépendances frontend...
    call npm install
)

echo Construction de l'interface...
call npm run build

:: Copier le build dans electron
cd ..
echo Copie des fichiers...
xcopy /E /I /Y frontend\build electron\build > nul

:: Étape 3 : Préparation Electron
echo.
echo ⚡ Étape 3/5 : Préparation d'Electron...
cd electron

if not exist "node_modules" (
    echo Installation des dépendances Electron...
    call npm install
)

:: Étape 4 : Build de l'application
echo.
echo 🔨 Étape 4/5 : Construction de l'application Windows...
echo Cela peut prendre quelques minutes...
echo.

:: Nettoyer les anciennes builds
if exist "dist" rmdir /S /Q dist

:: Builder pour Windows
call npm run dist:win

:: Étape 5 : Finalisation
echo.
echo 🎉 Étape 5/5 : Finalisation...

if exist "dist\RecyTrack Setup *.exe" (
    echo.
    echo ✅ APPLICATION CRÉÉE AVEC SUCCÈS !
    echo.
    echo 📁 Fichiers créés :
    echo.
    
    :: Lister les fichiers créés
    for %%f in (dist\*.exe) do (
        echo    - %%f
        set INSTALLER_PATH=%%f
    )
    
    echo.
    echo 📌 Pour installer RecyTrack :
    echo    1. Double-cliquez sur l'installateur .exe
    echo    2. Suivez l'assistant d'installation
    echo    3. RecyTrack sera ajouté au menu Démarrer et au Bureau
    echo.
    echo 🚀 L'application inclut :
    echo    ✓ Logo personnalisé RecyTrack
    echo    ✓ Base de données intégrée
    echo    ✓ Démarrage automatique du serveur
    echo    ✓ Interface moderne
    echo    ✓ Mises à jour automatiques
    echo.
    
    choice /C OI /M "Voulez-vous (O)uvrir le dossier ou (I)nstaller maintenant ?"
    if errorlevel 2 (
        echo.
        echo Lancement de l'installation...
        start "" "%INSTALLER_PATH%"
    ) else (
        explorer dist
    )
) else (
    echo.
    echo ❌ Erreur lors de la création de l'application.
    echo.
    echo Vérifiez les logs dans electron\node_modules\electron-builder\out\
    echo.
)

cd ..
echo.
pause