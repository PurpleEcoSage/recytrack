# Script d'installation RecyTrack pour Windows
# Nécessite PowerShell en mode Administrateur

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    RecyTrack - Installation Windows    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier les droits admin
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Ce script nécessite des droits administrateur !" -ForegroundColor Red
    Write-Host "Faites clic droit > 'Exécuter en tant qu'administrateur'" -ForegroundColor Yellow
    pause
    exit
}

# Menu
Write-Host "Choisissez votre type d'installation :" -ForegroundColor Green
Write-Host ""
Write-Host "1) Installation avec Chocolatey (Recommandé)" -ForegroundColor White
Write-Host "2) Installation avec Docker Desktop" -ForegroundColor White
Write-Host "3) Installation manuelle complète" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Votre choix [1-3]"

switch ($choice) {
    "1" {
        Write-Host "`n📦 Installation avec Chocolatey..." -ForegroundColor Yellow
        
        # Installer Chocolatey si nécessaire
        if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
            Write-Host "Installation de Chocolatey..." -ForegroundColor Cyan
            Set-ExecutionPolicy Bypass -Scope Process -Force
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        }
        
        # Installer les dépendances
        Write-Host "`nInstallation des dépendances..." -ForegroundColor Cyan
        choco install -y nodejs mongodb git
        
        # Cloner le projet
        Write-Host "`nClonage du projet..." -ForegroundColor Cyan
        cd $env:USERPROFILE\Documents
        git clone https://github.com/recytrack/recytrack.git
        cd recytrack
        
        # Installer les modules
        Write-Host "`nInstallation des modules Node.js..." -ForegroundColor Cyan
        cd backend
        npm install
        cd ..\frontend
        npm install
        cd ..
        
        # Créer les raccourcis
        Write-Host "`nCréation des raccourcis..." -ForegroundColor Cyan
        $WshShell = New-Object -comObject WScript.Shell
        
        # Raccourci Bureau
        $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\RecyTrack.lnk")
        $Shortcut.TargetPath = "$env:USERPROFILE\Documents\recytrack\start-windows.bat"
        $Shortcut.WorkingDirectory = "$env:USERPROFILE\Documents\recytrack"
        $Shortcut.IconLocation = "$env:USERPROFILE\Documents\recytrack\frontend\public\favicon.ico"
        $Shortcut.Save()
        
        # Raccourci Menu Démarrer
        $StartMenu = [Environment]::GetFolderPath("StartMenu")
        $Shortcut = $WshShell.CreateShortcut("$StartMenu\Programs\RecyTrack.lnk")
        $Shortcut.TargetPath = "$env:USERPROFILE\Documents\recytrack\start-windows.bat"
        $Shortcut.WorkingDirectory = "$env:USERPROFILE\Documents\recytrack"
        $Shortcut.Save()
        
        Write-Host "`n✅ Installation terminée !" -ForegroundColor Green
        Write-Host "RecyTrack a été installé dans : $env:USERPROFILE\Documents\recytrack" -ForegroundColor Cyan
        Write-Host "Un raccourci a été créé sur le Bureau" -ForegroundColor Cyan
    }
    
    "2" {
        Write-Host "`n🐳 Installation avec Docker Desktop..." -ForegroundColor Yellow
        
        # Vérifier Docker
        if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
            Write-Host "Docker Desktop n'est pas installé." -ForegroundColor Red
            Write-Host "Téléchargement en cours..." -ForegroundColor Cyan
            Start-Process "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
            Write-Host "Installez Docker Desktop et relancez ce script." -ForegroundColor Yellow
            pause
            exit
        }
        
        # Cloner le projet
        Write-Host "`nClonage du projet..." -ForegroundColor Cyan
        cd $env:USERPROFILE\Documents
        git clone https://github.com/recytrack/recytrack.git
        cd recytrack
        
        # Créer le fichier .env
        Write-Host "`nCréation de la configuration..." -ForegroundColor Cyan
        @"
MONGO_PASSWORD=recytrack2024
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost
API_URL=http://localhost:5000/api
"@ | Out-File -FilePath .env -Encoding UTF8
        
        # Lancer avec Docker
        Write-Host "`nDémarrage avec Docker..." -ForegroundColor Cyan
        docker-compose up -d
        
        Write-Host "`n✅ RecyTrack est lancé avec Docker !" -ForegroundColor Green
        Write-Host "Accès : http://localhost" -ForegroundColor Cyan
    }
    
    "3" {
        Write-Host "`n🔧 Installation manuelle complète..." -ForegroundColor Yellow
        
        # Créer la structure
        Write-Host "Création des dossiers..." -ForegroundColor Cyan
        New-Item -ItemType Directory -Force -Path "C:\RecyTrack"
        New-Item -ItemType Directory -Force -Path "C:\RecyTrack\data"
        New-Item -ItemType Directory -Force -Path "C:\RecyTrack\logs"
        
        # Télécharger MongoDB
        if (!(Test-Path "C:\Program Files\MongoDB")) {
            Write-Host "`nTéléchargement de MongoDB..." -ForegroundColor Cyan
            $mongoUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-6.0.3-signed.msi"
            $mongoInstaller = "$env:TEMP\mongodb-installer.msi"
            Invoke-WebRequest -Uri $mongoUrl -OutFile $mongoInstaller
            
            Write-Host "Installation de MongoDB..." -ForegroundColor Cyan
            Start-Process msiexec.exe -Wait -ArgumentList "/i $mongoInstaller /quiet"
        }
        
        # Configurer MongoDB comme service
        Write-Host "`nConfiguration de MongoDB..." -ForegroundColor Cyan
        New-Item -ItemType Directory -Force -Path "C:\RecyTrack\data\db"
        
        # Créer le service MongoDB
        & "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --install --dbpath "C:\RecyTrack\data\db" --logpath "C:\RecyTrack\logs\mongodb.log"
        Start-Service MongoDB
        
        # Installer Node.js si nécessaire
        if (!(Get-Command node -ErrorAction SilentlyContinue)) {
            Write-Host "`nTéléchargement de Node.js..." -ForegroundColor Cyan
            $nodeUrl = "https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi"
            $nodeInstaller = "$env:TEMP\node-installer.msi"
            Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller
            
            Write-Host "Installation de Node.js..." -ForegroundColor Cyan
            Start-Process msiexec.exe -Wait -ArgumentList "/i $nodeInstaller /quiet"
            
            # Rafraîchir le PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        }
        
        # Cloner et installer
        Write-Host "`nInstallation de RecyTrack..." -ForegroundColor Cyan
        cd C:\RecyTrack
        git clone https://github.com/recytrack/recytrack.git .
        
        cd backend
        npm install --production
        cd ..\frontend
        npm install
        npm run build
        cd ..
        
        # Créer le service Windows pour le backend
        Write-Host "`nCréation du service RecyTrack..." -ForegroundColor Cyan
        $serviceName = "RecyTrackBackend"
        $nodePath = (Get-Command node).Path
        $scriptPath = "C:\RecyTrack\backend\server.js"
        
        New-Service -Name $serviceName `
                    -BinaryPathName "$nodePath $scriptPath" `
                    -DisplayName "RecyTrack Backend Service" `
                    -StartupType Automatic `
                    -Description "RecyTrack Waste Management Backend Service"
        
        Start-Service $serviceName
        
        Write-Host "`n✅ Installation complète terminée !" -ForegroundColor Green
    }
}

Write-Host "`n" -ForegroundColor White
Write-Host "Pour lancer RecyTrack :" -ForegroundColor Yellow
Write-Host "- Double-cliquez sur le raccourci RecyTrack sur le Bureau" -ForegroundColor White
Write-Host "- Ou lancez start-windows.bat" -ForegroundColor White
Write-Host "`n" -ForegroundColor White
pause