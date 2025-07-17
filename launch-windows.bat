@echo off
chcp 65001 > nul
title RecyTrack Launcher

echo.
echo ╔════════════════════════════════════════╗
echo ║      RecyTrack - Lancement Windows     ║
echo ╚════════════════════════════════════════╝
echo.
echo Choisissez votre méthode de lancement :
echo.
echo 1) Mode Développement (Node.js)
echo 2) Docker Desktop
echo 3) Application Desktop (.exe)
echo 4) Installation complète
echo.
set /p choice="Votre choix [1-4]: "

if "%choice%"=="1" goto development
if "%choice%"=="2" goto docker
if "%choice%"=="3" goto desktop
if "%choice%"=="4" goto install
goto end

:development
echo.
echo 📦 Lancement en mode développement...

:: Vérifier Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé !
    echo Téléchargez-le depuis : https://nodejs.org/
    pause
    exit /b
)

:: Vérifier MongoDB
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  MongoDB n'est pas démarré.
    echo.
    echo Options :
    echo 1) Démarrer MongoDB manuellement
    echo 2) Utiliser MongoDB Atlas (cloud)
    echo 3) Installer MongoDB
    echo.
    set /p mongo_choice="Votre choix [1-3]: "
    
    if "%mongo_choice%"=="3" (
        echo.
        echo Téléchargez MongoDB depuis :
        echo https://www.mongodb.com/try/download/community
        start https://www.mongodb.com/try/download/community
        pause
        exit /b
    )
)

:: Lancer le backend
echo.
echo Démarrage du backend...
cd backend
start cmd /k "npm start"

:: Attendre un peu
timeout /t 3 /nobreak > nul

:: Lancer le frontend
echo Démarrage du frontend...
cd ..\frontend
start cmd /k "npm start"

:: Attendre et ouvrir le navigateur
timeout /t 5 /nobreak > nul
start http://localhost:3000

echo.
echo ✅ RecyTrack est lancé !
echo    - Frontend: http://localhost:3000
echo    - Backend: http://localhost:5000
goto end

:docker
echo.
echo 🐳 Lancement avec Docker Desktop...

:: Vérifier Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Desktop n'est pas installé !
    echo Téléchargez-le depuis : https://www.docker.com/products/docker-desktop
    start https://www.docker.com/products/docker-desktop
    pause
    exit /b
)

:: Vérifier que Docker est démarré
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Docker Desktop n'est pas démarré.
    echo Veuillez démarrer Docker Desktop et réessayer.
    pause
    exit /b
)

:: Créer .env si nécessaire
if not exist .env (
    echo Création du fichier .env...
    (
        echo MONGO_PASSWORD=recytrack2024
        echo JWT_SECRET=your-super-secret-jwt-key-change-in-production
        echo FRONTEND_URL=http://localhost
        echo API_URL=http://localhost:5000/api
    ) > .env
)

:: Lancer avec docker-compose
echo Démarrage des conteneurs...
docker-compose up -d

echo.
echo ✅ RecyTrack est lancé avec Docker !
echo    - Frontend: http://localhost
echo    - Backend API: http://localhost:5000/api
echo.
echo Commandes utiles :
echo    - Voir les logs: docker-compose logs -f
echo    - Arrêter: docker-compose down

timeout /t 3 /nobreak > nul
start http://localhost
goto end

:desktop
echo.
echo 🖥️  Lancement de l'application Desktop...

:: Vérifier si l'exe existe
if exist "electron\dist\RecyTrack Setup 1.0.0.exe" (
    echo Installation de RecyTrack...
    start "" "electron\dist\RecyTrack Setup 1.0.0.exe"
) else if exist "%LOCALAPPDATA%\Programs\recytrack\RecyTrack.exe" (
    echo Lancement de RecyTrack...
    start "" "%LOCALAPPDATA%\Programs\recytrack\RecyTrack.exe"
) else (
    echo.
    echo ❌ L'application n'est pas encore construite.
    echo.
    echo Pour la construire :
    echo 1) Installez Node.js
    echo 2) Lancez : build-app.bat
    echo 3) Choisissez option 1 (Desktop) puis 1 (Windows)
    echo.
    pause
)
goto end

:install
echo.
echo 🔧 Installation complète sur Windows...
echo.

:: Créer les dossiers
echo Création des dossiers...
mkdir "%ProgramFiles%\RecyTrack" 2>nul
mkdir "%ProgramFiles%\RecyTrack\backend" 2>nul
mkdir "%ProgramFiles%\RecyTrack\frontend" 2>nul
mkdir "%ProgramData%\RecyTrack" 2>nul
mkdir "%ProgramData%\RecyTrack\logs" 2>nul
mkdir "%ProgramData%\RecyTrack\data" 2>nul

:: Copier les fichiers (nécessite des droits admin)
echo.
echo ⚠️  Cette installation nécessite des droits administrateur.
echo.
pause

:: Créer un service Windows
echo Création du service Windows...
sc create RecyTrackBackend binPath= "%ProgramFiles%\RecyTrack\backend\node.exe server.js" start= auto DisplayName= "RecyTrack Backend Service"

:: Créer les raccourcis
echo Création des raccourcis...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\RecyTrack.lnk'); $Shortcut.TargetPath = 'http://localhost:3000'; $Shortcut.IconLocation = '%ProgramFiles%\RecyTrack\icon.ico'; $Shortcut.Save()"

echo.
echo ✅ Installation terminée !
goto end

:end
echo.
pause