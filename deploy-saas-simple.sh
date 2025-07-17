#!/bin/bash

echo "🚀 Déploiement RecyTrack SaaS (Version Gratuite)"
echo "==============================================="

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration automatique
APP_NAME="recytrack"
VERCEL_URL="${APP_NAME}.vercel.app"
HEROKU_URL="${APP_NAME}-api.herokuapp.com"

echo -e "\n${BLUE}📋 Configuration :${NC}"
echo "  Frontend : https://${VERCEL_URL}"
echo "  Backend  : https://${HEROKU_URL}"
echo "  Coût     : 0€ (gratuit)"

# Étape 1 : Préparer le frontend
echo -e "\n${YELLOW}1️⃣ Préparation du frontend...${NC}"

cd frontend

# Créer les variables d'environnement
cat > .env.production << EOF
REACT_APP_API_URL=https://${HEROKU_URL}/api
REACT_APP_ENV=production
EOF

echo -e "${GREEN}✅ Frontend configuré${NC}"

cd ..

# Étape 2 : Préparer le backend
echo -e "\n${YELLOW}2️⃣ Préparation du backend...${NC}"

cd backend-setup

# Créer Procfile pour Heroku
echo "web: node server.js" > Procfile

# Créer le script de base de données
cat > init-db.js << 'EOF'
const { sequelize } = require('./models');

async function initDB() {
  try {
    console.log('🔄 Initialisation de la base de données...');
    await sequelize.sync({ alter: true });
    console.log('✅ Base de données prête !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

initDB();
EOF

# Mettre à jour package.json pour Heroku
cat > package.json.tmp << 'EOF'
{
  "name": "recytrack-backend",
  "version": "1.0.0",
  "description": "RecyTrack Backend API",
  "main": "server.js",
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "postinstall": "node init-db.js"
  },
EOF

# Ajouter les dépendances existantes
tail -n +12 package.json >> package.json.tmp
mv package.json.tmp package.json

echo -e "${GREEN}✅ Backend configuré${NC}"

cd ..

# Étape 3 : Créer le guide de déploiement simple
cat > DEPLOIEMENT_RAPIDE.md << EOF
# 🚀 Déploiement RecyTrack en 10 minutes

## 1️⃣ Créer les comptes (2 min)

### GitHub
1. Aller sur https://github.com/signup
2. Créer un compte gratuit
3. Vérifier votre email

### Vercel (avec GitHub)
1. Aller sur https://vercel.com/signup
2. Cliquer "Continue with GitHub"
3. Autoriser Vercel

### Heroku
1. Aller sur https://signup.heroku.com/
2. Créer un compte gratuit
3. Vérifier votre email

## 2️⃣ Créer le repository GitHub (2 min)

\`\`\`bash
# Dans le terminal
cd /home/kevin/Bureau/recytrack
git init
git add .
git commit -m "RecyTrack SaaS"
\`\`\`

1. Aller sur https://github.com/new
2. Repository name: **recytrack**
3. Public
4. Cliquer "Create repository"
5. Copier les commandes affichées

## 3️⃣ Déployer le Frontend sur Vercel (3 min)

1. Aller sur https://vercel.com/new
2. "Import Git Repository"
3. Chercher **recytrack**
4. Configurer :
   - **Root Directory**: \`frontend\`
   - **Framework Preset**: Create React App
   - **Build Command**: \`npm run build\`
   - **Output Directory**: \`build\`

5. Variables d'environnement :
   - Nom: \`REACT_APP_API_URL\`
   - Valeur: \`https://recytrack-api.herokuapp.com/api\`

6. Cliquer "Deploy"

✅ **Votre frontend sera accessible sur : https://recytrack.vercel.app**

## 4️⃣ Déployer le Backend sur Heroku (3 min)

### Installer Heroku CLI
\`\`\`bash
# Linux/Mac
curl https://cli-assets.heroku.com/install.sh | sh

# Windows
# Télécharger : https://devcenter.heroku.com/articles/heroku-cli
\`\`\`

### Déployer
\`\`\`bash
cd backend-setup

# Login
heroku login

# Créer l'app
heroku create recytrack-api

# Ajouter PostgreSQL gratuit
heroku addons:create heroku-postgresql:mini

# Variables d'environnement
heroku config:set JWT_SECRET=\$(openssl rand -hex 32)
heroku config:set FRONTEND_URL=https://recytrack.vercel.app
heroku config:set NODE_ENV=production

# Déployer
git init
git add .
git commit -m "Backend ready"
heroku git:remote -a recytrack-api
git push heroku main
\`\`\`

## 5️⃣ Vérifier que tout fonctionne

1. Frontend : https://recytrack.vercel.app
2. API Health : https://recytrack-api.herokuapp.com/api/health

## 🎉 C'est fait !

Votre SaaS RecyTrack est en ligne et prêt à recevoir des clients !

### URLs de production
- **Application** : https://recytrack.vercel.app
- **API** : https://recytrack-api.herokuapp.com/api

### Prochaines étapes
1. Créer un compte admin
2. Configurer Stripe pour les paiements
3. Personnaliser le design
4. Commencer à vendre !
EOF

echo -e "\n${GREEN}✅ Préparation terminée !${NC}"
echo -e "\n${BLUE}📘 Guide créé : DEPLOIEMENT_RAPIDE.md${NC}"
echo -e "${YELLOW}👉 Suivez les étapes dans le guide pour déployer en 10 minutes${NC}"

# Ouvrir le guide
if command -v xdg-open &> /dev/null; then
    xdg-open DEPLOIEMENT_RAPIDE.md
fi