#!/bin/bash

echo "🚀 Lancement de RecyTrack sur Linux"
echo "=================================="
echo ""
echo "Choisissez votre méthode de lancement :"
echo ""
echo "1) Mode Développement (Node.js)"
echo "2) Docker Compose (Production)"
echo "3) Application Desktop (AppImage)"
echo "4) Installation système complète"
echo ""
read -p "Votre choix [1-4]: " choice

case $choice in
    1)
        echo ""
        echo "📦 Lancement en mode développement..."
        
        # Vérifier MongoDB
        if ! pgrep -x "mongod" > /dev/null; then
            echo "⚠️  MongoDB n'est pas démarré."
            read -p "Voulez-vous l'installer et le démarrer ? [O/n] " install_mongo
            
            if [[ $install_mongo != "n" ]]; then
                # Installer MongoDB
                echo "Installation de MongoDB..."
                wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
                echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
                sudo apt update
                sudo apt install -y mongodb-org
                sudo systemctl start mongod
                sudo systemctl enable mongod
            fi
        fi
        
        # Lancer l'application
        ./start.sh
        ;;
        
    2)
        echo ""
        echo "🐳 Lancement avec Docker..."
        
        # Vérifier Docker
        if ! command -v docker &> /dev/null; then
            echo "Docker n'est pas installé."
            read -p "Voulez-vous l'installer ? [O/n] " install_docker
            
            if [[ $install_docker != "n" ]]; then
                echo "Installation de Docker..."
                curl -fsSL https://get.docker.com -o get-docker.sh
                sudo sh get-docker.sh
                sudo usermod -aG docker $USER
                echo "⚠️  Veuillez vous déconnecter et reconnecter pour que les changements prennent effet."
                echo "Puis relancez ce script."
                exit 0
            fi
        fi
        
        # Configuration
        if [ ! -f .env ]; then
            echo "Création du fichier .env..."
            cat > .env << EOF
MONGO_PASSWORD=recytrack2024
JWT_SECRET=$(openssl rand -base64 32)
FRONTEND_URL=http://localhost
API_URL=http://localhost:5000/api
EOF
        fi
        
        # Lancer
        docker-compose up -d
        
        echo ""
        echo "✅ RecyTrack est lancé !"
        echo "   - Frontend: http://localhost"
        echo "   - Backend API: http://localhost:5000/api"
        echo ""
        echo "Commandes utiles :"
        echo "   - Logs: docker-compose logs -f"
        echo "   - Arrêter: docker-compose down"
        ;;
        
    3)
        echo ""
        echo "🖥️  Lancement de l'application Desktop..."
        
        # Vérifier si l'AppImage existe
        APPIMAGE="electron/dist/RecyTrack-1.0.0.AppImage"
        
        if [ ! -f "$APPIMAGE" ]; then
            echo "L'AppImage n'existe pas encore."
            echo "Construction en cours..."
            
            # Installer les dépendances Electron
            cd electron
            npm install
            
            # Copier le build frontend si nécessaire
            if [ ! -d "build" ]; then
                cd ../frontend
                npm install
                npm run build
                cd ../electron
                cp -r ../frontend/build .
            fi
            
            # Builder l'AppImage
            npm run dist:linux
            cd ..
        fi
        
        # Rendre exécutable et lancer
        chmod +x "$APPIMAGE"
        "$APPIMAGE"
        ;;
        
    4)
        echo ""
        echo "🔧 Installation système complète..."
        
        # Créer les dossiers système
        sudo mkdir -p /opt/recytrack
        sudo mkdir -p /etc/recytrack
        sudo mkdir -p /var/log/recytrack
        sudo mkdir -p /var/lib/recytrack
        
        # Copier les fichiers
        sudo cp -r backend /opt/recytrack/
        sudo cp -r frontend/build /opt/recytrack/frontend
        
        # Créer le service systemd
        sudo tee /etc/systemd/system/recytrack.service > /dev/null << EOF
[Unit]
Description=RecyTrack Waste Management System
After=network.target mongodb.service

[Service]
Type=simple
User=recytrack
WorkingDirectory=/opt/recytrack/backend
Environment="NODE_ENV=production"
Environment="PORT=5000"
Environment="MONGODB_URI=mongodb://localhost:27017/recytrack"
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

        # Créer l'utilisateur système
        sudo useradd -r -s /bin/false recytrack || true
        sudo chown -R recytrack:recytrack /opt/recytrack
        sudo chown -R recytrack:recytrack /var/log/recytrack
        sudo chown -R recytrack:recytrack /var/lib/recytrack
        
        # Configuration Nginx
        sudo tee /etc/nginx/sites-available/recytrack > /dev/null << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    root /opt/recytrack/frontend;
    index index.html;
    
    location / {
        try_files $uri /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
        
        # Activer le site
        sudo ln -sf /etc/nginx/sites-available/recytrack /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        
        # Démarrer les services
        sudo systemctl daemon-reload
        sudo systemctl enable recytrack
        sudo systemctl start recytrack
        
        echo ""
        echo "✅ Installation terminée !"
        echo "   RecyTrack est accessible sur http://localhost"
        echo ""
        echo "Commandes de gestion :"
        echo "   - Status: sudo systemctl status recytrack"
        echo "   - Logs: sudo journalctl -u recytrack -f"
        echo "   - Redémarrer: sudo systemctl restart recytrack"
        ;;
esac

# Ouvrir le navigateur si en mode graphique
if [[ -n $DISPLAY ]] && [[ $choice != "4" ]]; then
    sleep 3
    xdg-open http://localhost:3000 2>/dev/null || true
fi