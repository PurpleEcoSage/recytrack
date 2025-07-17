#!/bin/bash

# Script de déploiement automatisé RecyTrack SaaS

echo "🚀 Déploiement RecyTrack SaaS"
echo "=============================="

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier les prérequis
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 n'est pas installé${NC}"
        echo "Installation : $2"
        exit 1
    else
        echo -e "${GREEN}✅ $1 est installé${NC}"
    fi
}

echo -e "\n${YELLOW}📋 Vérification des prérequis...${NC}"
check_command "git" "sudo apt install git"
check_command "node" "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install nodejs"
check_command "npm" "Installé avec Node.js"

# Étape 1 : Configuration
echo -e "\n${YELLOW}⚙️  Configuration...${NC}"

read -p "Avez-vous un compte GitHub ? (o/n) : " has_github
if [ "$has_github" != "o" ]; then
    echo "👉 Créez un compte sur https://github.com/signup"
    exit 1
fi

read -p "Nom d'utilisateur GitHub : " github_username
read -p "Nom du repository (ex: recytrack) : " repo_name

# Étape 2 : Préparer le frontend
echo -e "\n${YELLOW}📦 Préparation du frontend...${NC}"

cd frontend

# Créer le fichier de production
cat > .env.production << EOF
REACT_APP_API_URL=https://${repo_name}-api.herokuapp.com/api
REACT_APP_ENV=production
EOF

# Build de test
echo "Test du build..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build frontend réussi${NC}"
else
    echo -e "${RED}❌ Erreur lors du build${NC}"
    exit 1
fi

cd ..

# Étape 3 : Préparer le backend
echo -e "\n${YELLOW}📦 Préparation du backend...${NC}"

cd backend-setup

# Créer Procfile pour Heroku
echo "web: node server.js" > Procfile

# Ajouter script de migration
mkdir -p scripts
cat > scripts/migrate.js << 'EOF'
const { sequelize } = require('../models');

async function migrate() {
  try {
    await sequelize.sync({ force: false });
    console.log('✅ Base de données synchronisée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    process.exit(1);
  }
}

migrate();
EOF

# Mettre à jour package.json
node -e "
const pkg = require('./package.json');
pkg.engines = { node: '18.x', npm: '9.x' };
pkg.scripts.postinstall = 'npm run migrate';
pkg.scripts.migrate = 'node scripts/migrate.js';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"

cd ..

# Étape 4 : Initialiser Git
echo -e "\n${YELLOW}🐙 Initialisation Git...${NC}"

if [ ! -d .git ]; then
    git init
    git add .
    git commit -m "Initial commit - RecyTrack SaaS"
fi

# Étape 5 : Instructions manuelles
echo -e "\n${GREEN}✅ Préparation terminée !${NC}"
echo -e "\n${YELLOW}📋 Prochaines étapes :${NC}"

echo "
1. ${YELLOW}Créer le repository GitHub :${NC}
   - Aller sur https://github.com/new
   - Nom : $repo_name
   - Public
   - Sans README
   
2. ${YELLOW}Pousser le code :${NC}
   git remote add origin https://github.com/$github_username/$repo_name.git
   git push -u origin main

3. ${YELLOW}Déployer sur Vercel :${NC}
   - Aller sur https://vercel.com/new
   - Importer le repo GitHub
   - Root directory : frontend
   - Variables : REACT_APP_API_URL = https://$repo_name-api.herokuapp.com/api

4. ${YELLOW}Déployer sur Heroku :${NC}
   cd backend-setup
   heroku create $repo_name-api
   heroku addons:create heroku-postgresql:mini
   heroku config:set JWT_SECRET=\$(openssl rand -hex 32)
   git push heroku main

5. ${YELLOW}Finaliser :${NC}
   - Mettre à jour l'URL Vercel dans Heroku
   - Tester l'application
   - Configurer un domaine
"

# Créer un aide-mémoire
cat > DEPLOYMENT_CHECKLIST.md << EOF
# ✅ Checklist Déploiement RecyTrack

## Comptes créés
- [ ] GitHub : $github_username
- [ ] Vercel : 
- [ ] Heroku : 
- [ ] Stripe : 

## URLs de production
- Frontend : https://$repo_name.vercel.app
- Backend : https://$repo_name-api.herokuapp.com
- API Health : https://$repo_name-api.herokuapp.com/api/health

## Variables d'environnement

### Vercel (Frontend)
\`\`\`
REACT_APP_API_URL = https://$repo_name-api.herokuapp.com/api
\`\`\`

### Heroku (Backend)
\`\`\`
DATABASE_URL = (automatique)
JWT_SECRET = $(openssl rand -hex 32)
FRONTEND_URL = https://$repo_name.vercel.app
\`\`\`

## Commandes utiles
\`\`\`bash
# Logs Heroku
heroku logs --tail -a $repo_name-api

# Console base de données
heroku pg:psql -a $repo_name-api

# Redéployer
git push heroku main
\`\`\`
EOF

echo -e "\n${GREEN}📄 Checklist créée : DEPLOYMENT_CHECKLIST.md${NC}"
echo -e "${YELLOW}🚀 Bonne chance pour votre déploiement !${NC}"