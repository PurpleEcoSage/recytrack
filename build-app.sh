#!/bin/bash

echo "🏗️  Construction de RecyTrack..."

# Fonction pour afficher les messages
log() {
    echo "➤ $1"
}

error() {
    echo "❌ $1" >&2
    exit 1
}

success() {
    echo "✅ $1"
}

# Vérifier les prérequis
check_requirements() {
    log "Vérification des prérequis..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js n'est pas installé"
    fi
    
    # NPM
    if ! command -v npm &> /dev/null; then
        error "NPM n'est pas installé"
    fi
    
    success "Prérequis OK"
}

# Build du frontend
build_frontend() {
    log "Construction du frontend..."
    
    cd frontend || error "Dossier frontend introuvable"
    
    # Installer les dépendances
    npm ci || error "Erreur installation dépendances frontend"
    
    # Build de production
    npm run build || error "Erreur build frontend"
    
    cd ..
    success "Frontend construit"
}

# Build du backend
prepare_backend() {
    log "Préparation du backend..."
    
    cd backend || error "Dossier backend introuvable"
    
    # Installer les dépendances de production
    npm ci --only=production || error "Erreur installation dépendances backend"
    
    cd ..
    success "Backend préparé"
}

# Build Electron
build_electron() {
    log "Construction de l'application desktop..."
    
    cd electron || error "Dossier electron introuvable"
    
    # Copier le build frontend
    rm -rf build
    cp -r ../frontend/build . || error "Erreur copie build frontend"
    
    # Installer les dépendances
    npm install || error "Erreur installation dépendances Electron"
    
    # Build pour toutes les plateformes
    case "$1" in
        "win")
            log "Build pour Windows..."
            npm run dist:win || error "Erreur build Windows"
            ;;
        "mac")
            log "Build pour macOS..."
            npm run dist:mac || error "Erreur build macOS"
            ;;
        "linux")
            log "Build pour Linux..."
            npm run dist:linux || error "Erreur build Linux"
            ;;
        "all")
            log "Build pour toutes les plateformes..."
            npm run dist || error "Erreur build multi-plateforme"
            ;;
        *)
            log "Build pour la plateforme courante..."
            npm run build || error "Erreur build"
            ;;
    esac
    
    cd ..
    success "Application desktop construite"
}

# Build Docker
build_docker() {
    log "Construction des images Docker..."
    
    # Build avec docker-compose
    docker-compose build || error "Erreur build Docker"
    
    success "Images Docker construites"
}

# Menu principal
main() {
    echo "╔════════════════════════════════════════╗"
    echo "║       RecyTrack Build System           ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "Que voulez-vous construire ?"
    echo ""
    echo "1) Application Desktop (Electron)"
    echo "2) Application Web (Docker)"
    echo "3) Les deux"
    echo ""
    read -p "Votre choix [1-3]: " choice
    
    case $choice in
        1)
            check_requirements
            build_frontend
            prepare_backend
            
            echo ""
            echo "Pour quelle plateforme ?"
            echo "1) Windows"
            echo "2) macOS"
            echo "3) Linux"
            echo "4) Toutes"
            echo ""
            read -p "Votre choix [1-4]: " platform
            
            case $platform in
                1) build_electron "win" ;;
                2) build_electron "mac" ;;
                3) build_electron "linux" ;;
                4) build_electron "all" ;;
                *) build_electron ;;
            esac
            ;;
        2)
            check_requirements
            build_docker
            ;;
        3)
            check_requirements
            build_frontend
            prepare_backend
            build_electron "all"
            build_docker
            ;;
        *)
            error "Choix invalide"
            ;;
    esac
    
    echo ""
    success "Construction terminée !"
    echo ""
    echo "📦 Les fichiers sont disponibles dans :"
    
    if [ -d "electron/dist" ]; then
        echo "   - Desktop: electron/dist/"
    fi
    
    if [ -f "docker-compose.yml" ]; then
        echo "   - Docker: docker-compose up -d"
    fi
    
    echo ""
}

# Lancer le script
main