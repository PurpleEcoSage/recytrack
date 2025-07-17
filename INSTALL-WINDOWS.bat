@echo off
chcp 65001 > nul
color 0A
title RecyTrack - Installation Windows

cls
echo.
echo     ╔═══════════════════════════════════════════════════════════════╗
echo     ║                                                               ║
echo     ║                    🌿 RecyTrack 🌿                           ║
echo     ║                                                               ║
echo     ║            Solution de Gestion des Déchets                    ║
echo     ║                  pour Entreprises                             ║
echo     ║                                                               ║
echo     ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.
echo     Ce script va créer une application Windows avec icône cliquable
echo.
echo     📋 Prérequis :
echo        - Windows 10/11
echo        - Connexion Internet
echo        - 500 MB d'espace disque
echo.
echo.
pause

:: Vérifier et installer Node.js si nécessaire
echo.
echo 🔍 Vérification de Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Node.js n'est pas installé
    echo.
    echo 📥 Téléchargement de Node.js...
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%TEMP%\node-installer.msi'"
    
    echo 📦 Installation de Node.js...
    msiexec /i "%TEMP%\node-installer.msi" /qn /norestart
    
    :: Rafraîchir le PATH
    set "PATH=%PATH%;%ProgramFiles%\nodejs\"
    
    echo ✅ Node.js installé
) else (
    echo ✅ Node.js est déjà installé
)

:: Créer la structure du projet
echo.
echo 📁 Création de la structure du projet...
if not exist "RecyTrack-App" (
    mkdir RecyTrack-App
    cd RecyTrack-App
    
    :: Télécharger le projet
    echo 📥 Téléchargement de RecyTrack...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/recytrack/recytrack/archive/refs/heads/main.zip' -OutFile 'recytrack.zip'"
    
    :: Extraire
    echo 📦 Extraction des fichiers...
    powershell -Command "Expand-Archive -Path 'recytrack.zip' -DestinationPath '.'"
    del recytrack.zip
    
    :: Renommer le dossier
    move recytrack-main\* . >nul 2>&1
    rmdir /S /Q recytrack-main
)

:: Lancer la construction
echo.
echo 🏗️  Construction de l'application Windows...
echo.
call build-windows-app.bat

echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo     ✅ Installation terminée !
echo.
echo     📌 RecyTrack est maintenant disponible :
echo        - Menu Démarrer → RecyTrack
echo        - Bureau → Icône RecyTrack
echo.
echo     🚀 Double-cliquez sur l'icône pour lancer l'application
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
pause