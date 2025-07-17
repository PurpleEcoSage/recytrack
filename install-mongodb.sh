#!/bin/bash

echo "📦 Installation de MongoDB 7.0 sur Ubuntu 24.04..."

# 1. Importer la clé publique GPG
echo "🔑 Ajout de la clé GPG MongoDB..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# 2. Créer le fichier de liste pour MongoDB
echo "📝 Configuration du dépôt MongoDB..."
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 3. Mettre à jour la base de données des paquets
echo "🔄 Mise à jour des paquets..."
sudo apt-get update

# 4. Installer MongoDB
echo "📥 Installation de MongoDB..."
sudo apt-get install -y mongodb-org

# 5. Démarrer MongoDB
echo "🚀 Démarrage de MongoDB..."
sudo systemctl start mongod

# 6. Activer MongoDB au démarrage
echo "⚙️  Configuration du démarrage automatique..."
sudo systemctl enable mongod

# 7. Vérifier le statut
echo "✅ Vérification du statut..."
sudo systemctl status mongod

echo ""
echo "✨ MongoDB est installé et démarré !"
echo "📍 MongoDB écoute sur: localhost:27017"
echo ""
echo "Commandes utiles:"
echo "  - Démarrer: sudo systemctl start mongod"
echo "  - Arrêter: sudo systemctl stop mongod"
echo "  - Statut: sudo systemctl status mongod"
echo "  - Logs: sudo journalctl -u mongod"
echo "  - Console MongoDB: mongosh"