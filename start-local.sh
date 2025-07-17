#!/bin/bash

# Script de démarrage RecyTrack sans MongoDB local
echo "🚀 Démarrage de RecyTrack (mode développement)..."

# Créer le dossier de logs
mkdir -p logs

# Fonction pour démarrer un service
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    
    echo "📦 Démarrage de $service_name..."
    
    cd "$service_path" || exit 1
    
    # Démarrer le service en arrière-plan
    npm start > "../logs/${service_name}.log" 2>&1 &
    
    local pid=$!
    echo $pid > "../logs/${service_name}.pid"
    
    echo "✅ $service_name démarré (PID: $pid)"
}

# Démarrer le backend
if [ -d "backend-setup" ]; then
    echo "⚠️  Note: Le backend nécessite MongoDB pour fonctionner correctement."
    echo "   Vous pouvez installer MongoDB localement ou utiliser Docker Compose."
    start_service "Backend" "backend-setup" 5000
else
    echo "❌ Dossier backend-setup introuvable"
    exit 1
fi

# Démarrer le frontend
if [ -d "frontend" ]; then
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo "Installation des dépendances frontend..."
        npm install
    fi
    cd ..
    start_service "Frontend" "frontend" 3000
else
    echo "❌ Dossier frontend introuvable"
    exit 1
fi

echo ""
echo "🎉 RecyTrack est lancé !"
echo ""
echo "📍 Accès:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000/api"
echo ""
echo "⚠️  IMPORTANT: MongoDB doit être installé et démarré pour que le backend fonctionne."
echo "   Options:"
echo "   1. Installer MongoDB localement: https://www.mongodb.com/docs/manual/installation/"
echo "   2. Utiliser Docker: docker-compose up -d"
echo ""
echo "📋 Logs:"
echo "   - Backend: tail -f logs/Backend.log"
echo "   - Frontend: tail -f logs/Frontend.log"
echo ""
echo "🛑 Pour arrêter RecyTrack: ./stop.sh"