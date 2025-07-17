#!/bin/bash

cd backend-setup
git remote add origin https://github.com/PurpleEcoSage/recytrack-backend.git
git branch -M main
git push -u origin main

echo "✅ Backend poussé sur GitHub !"
echo ""
echo "🚀 Maintenant, allez déployer sur Heroku :"
echo "1. Créez un compte sur https://signup.heroku.com/"
echo "2. Une fois connecté, allez sur https://dashboard.heroku.com/new-app"
echo "3. Nom de l'app : recytrack-api"
echo "4. Région : Europe"
echo "5. Create app"
echo ""
echo "Puis connectez GitHub :"
echo "- Deploy > GitHub > Connect to GitHub"
echo "- Cherchez 'recytrack-backend'"
echo "- Connect"
echo "- Enable Automatic Deploys"
echo "- Deploy Branch"