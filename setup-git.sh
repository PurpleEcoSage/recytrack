#!/bin/bash

echo "🔧 Configuration Git pour RecyTrack"
echo "=================================="

# Demander les informations
read -p "📧 Email GitHub : " email
read -p "👤 Nom d'utilisateur GitHub : " username

# Configurer Git
git config --global user.email "$email"
git config --global user.name "$username"

echo "✅ Git configuré !"

# Initialiser le repo
git init
git add .
git commit -m "Initial commit - RecyTrack SaaS"

echo ""
echo "✅ Repository local prêt !"
echo ""
echo "📋 Prochaine étape :"
echo "1. Aller sur https://github.com/new"
echo "2. Créer un nouveau repository nommé 'recytrack'"
echo "3. Puis exécuter :"
echo ""
echo "git remote add origin https://github.com/$username/recytrack.git"
echo "git branch -M main"
echo "git push -u origin main"