@echo off
title RecyTrack - Démarrage Rapide

echo.
echo 🚀 Démarrage rapide de RecyTrack...
echo.

:: Vérifier les prérequis
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé !
    echo.
    echo 1. Téléchargez Node.js : https://nodejs.org/
    echo 2. Installez-le
    echo 3. Relancez ce script
    echo.
    pause
    exit /b
)

:: Vérifier MongoDB (optionnel en dev)
echo Vérification de MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  MongoDB n'est pas démarré.
    echo.
    choice /C ON /M "Continuer sans MongoDB local (O) ou Quitter (N)"
    if errorlevel 2 exit /b
)

:: Installer les dépendances si nécessaire
if not exist "backend\node_modules" (
    echo.
    echo Installation des dépendances backend...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo.
    echo Installation des dépendances frontend...
    cd frontend
    call npm install
    cd ..
)

:: Démarrer le backend
echo.
echo 📦 Démarrage du backend...
cd backend
start "RecyTrack Backend" cmd /k npm start
cd ..

:: Attendre que le backend démarre
echo Attente du backend...
timeout /t 5 /nobreak > nul

:: Démarrer le frontend
echo 📦 Démarrage du frontend...
cd frontend
start "RecyTrack Frontend" cmd /k npm start
cd ..

:: Attendre et ouvrir le navigateur
echo.
echo Ouverture du navigateur...
timeout /t 8 /nobreak > nul
start http://localhost:3000

echo.
echo ✅ RecyTrack est maintenant accessible sur http://localhost:3000
echo.
echo Pour arrêter RecyTrack, fermez les fenêtres "RecyTrack Backend" et "RecyTrack Frontend"
echo.
pause