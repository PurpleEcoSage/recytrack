#!/bin/bash

echo "📦 Installation de PostgreSQL sur Ubuntu 24.04..."

# 1. Installer PostgreSQL
echo "📥 Installation de PostgreSQL..."
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# 2. Démarrer PostgreSQL
echo "🚀 Démarrage de PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 3. Créer la base de données et l'utilisateur
echo "🗄️ Configuration de la base de données RecyTrack..."
sudo -u postgres psql << EOF
-- Créer l'utilisateur recytrack
CREATE USER recytrack WITH PASSWORD 'recytrack2024';

-- Créer la base de données
CREATE DATABASE recytrack OWNER recytrack;

-- Donner tous les privilèges
GRANT ALL PRIVILEGES ON DATABASE recytrack TO recytrack;

-- Afficher les bases de données
\l
EOF

# 4. Exécuter le schéma
echo "📋 Création des tables..."
PGPASSWORD=recytrack2024 psql -h localhost -U recytrack -d recytrack -f database/schema.sql

# 5. Vérifier le statut
echo "✅ Vérification du statut..."
sudo systemctl status postgresql

echo ""
echo "✨ PostgreSQL est installé et configuré !"
echo "📍 PostgreSQL écoute sur: localhost:5432"
echo "🔑 Base de données: recytrack"
echo "👤 Utilisateur: recytrack"
echo "🔐 Mot de passe: recytrack2024"
echo ""
echo "Commandes utiles:"
echo "  - Se connecter: psql -h localhost -U recytrack -d recytrack"
echo "  - Statut: sudo systemctl status postgresql"
echo "  - Logs: sudo journalctl -u postgresql"