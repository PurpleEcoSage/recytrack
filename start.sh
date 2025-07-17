#!/bin/bash

# Script de démarrage RecyTrack
echo "🚀 Démarrage de RecyTrack..."

# Vérifier si MongoDB est en cours d'exécution
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB n'est pas démarré. Tentative de démarrage..."
    
    # Essayer de démarrer MongoDB
    if command -v systemctl &> /dev/null; then
        sudo systemctl start mongod
    elif command -v brew &> /dev/null; then
        brew services start mongodb-community
    else
        echo "❌ Impossible de démarrer MongoDB automatiquement."
        echo "Veuillez démarrer MongoDB manuellement et relancer ce script."
        exit 1
    fi
    
    sleep 2
fi

echo "✅ MongoDB est actif"

# Fonction pour démarrer un service
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    
    echo "📦 Démarrage de $service_name..."
    
    cd "$service_path" || exit 1
    
    # Installer les dépendances si node_modules n'existe pas
    if [ ! -d "node_modules" ]; then
        echo "Installation des dépendances pour $service_name..."
        npm install
    fi
    
    # Démarrer le service en arrière-plan
    if [ "$service_name" = "Backend" ]; then
        npm start > "../logs/${service_name}.log" 2>&1 &
    else
        npm start > "../logs/${service_name}.log" 2>&1 &
    fi
    
    local pid=$!
    echo $pid > "../logs/${service_name}.pid"
    
    # Attendre que le service démarre
    echo "En attente du démarrage de $service_name sur le port $port..."
    local count=0
    while ! nc -z localhost $port 2>/dev/null; do
        sleep 1
        count=$((count + 1))
        if [ $count -gt 30 ]; then
            echo "❌ Timeout: $service_name n'a pas démarré après 30 secondes"
            exit 1
        fi
    done
    
    echo "✅ $service_name démarré (PID: $pid)"
}

# Créer le dossier de logs
mkdir -p logs

# Arrêter les services existants
if [ -f "logs/Backend.pid" ]; then
    old_pid=$(cat logs/Backend.pid)
    if ps -p $old_pid > /dev/null 2>&1; then
        echo "Arrêt du backend existant (PID: $old_pid)..."
        kill $old_pid 2>/dev/null
        sleep 2
    fi
fi

if [ -f "logs/Frontend.pid" ]; then
    old_pid=$(cat logs/Frontend.pid)
    if ps -p $old_pid > /dev/null 2>&1; then
        echo "Arrêt du frontend existant (PID: $old_pid)..."
        kill $old_pid 2>/dev/null
        sleep 2
    fi
fi

# Démarrer le backend
if [ -d "backend" ]; then
    start_service "Backend" "backend" 5000
elif [ -d "backend-setup" ]; then
    start_service "Backend" "backend-setup" 5000
else
    echo "❌ Dossier backend introuvable"
    exit 1
fi

# Démarrer le frontend
if [ -d "frontend" ]; then
    start_service "Frontend" "frontend" 3000
else
    echo "❌ Dossier frontend introuvable"
    exit 1
fi

echo ""
echo "🎉 RecyTrack est maintenant opérationnel !"
echo ""
echo "📍 Accès:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000/api"
echo "   - Santé API: http://localhost:5000/api/health"
echo ""
echo "📋 Logs:"
echo "   - Backend: tail -f logs/Backend.log"
echo "   - Frontend: tail -f logs/Frontend.log"
echo ""
echo "🛑 Pour arrêter RecyTrack: ./stop.sh"
echo ""

# Optionnel : Ouvrir le navigateur
if command -v xdg-open &> /dev/null; then
    sleep 3
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    sleep 3
    open http://localhost:3000
fi