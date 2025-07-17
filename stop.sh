#!/bin/bash

# Script d'arrêt RecyTrack
echo "🛑 Arrêt de RecyTrack..."

# Fonction pour arrêter un service
stop_service() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "Arrêt de $service_name (PID: $pid)..."
            kill $pid 2>/dev/null
            
            # Attendre que le processus se termine
            local count=0
            while ps -p $pid > /dev/null 2>&1; do
                sleep 1
                count=$((count + 1))
                if [ $count -gt 10 ]; then
                    echo "Force l'arrêt de $service_name..."
                    kill -9 $pid 2>/dev/null
                    break
                fi
            done
            
            echo "✅ $service_name arrêté"
        else
            echo "⚠️  $service_name n'est pas en cours d'exécution"
        fi
        rm -f "$pid_file"
    else
        echo "⚠️  Fichier PID pour $service_name introuvable"
    fi
}

# Arrêter les services
stop_service "Frontend"
stop_service "Backend"

# Nettoyer les ports si nécessaire
if command -v lsof &> /dev/null; then
    # Tuer les processus sur les ports 3000 et 5000 s'ils existent encore
    for port in 3000 5000; do
        pid=$(lsof -ti:$port)
        if [ ! -z "$pid" ]; then
            echo "Nettoyage du port $port (PID: $pid)..."
            kill -9 $pid 2>/dev/null
        fi
    done
fi

echo ""
echo "✅ RecyTrack est arrêté"
echo ""