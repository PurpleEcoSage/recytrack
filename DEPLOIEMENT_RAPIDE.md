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

```bash
# Dans le terminal
cd /home/kevin/Bureau/recytrack
git init
git add .
git commit -m "RecyTrack SaaS"
```

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
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Variables d'environnement :
   - Nom: `REACT_APP_API_URL`
   - Valeur: `https://recytrack-api.herokuapp.com/api`

6. Cliquer "Deploy"

✅ **Votre frontend sera accessible sur : https://recytrack.vercel.app**

## 4️⃣ Déployer le Backend sur Heroku (3 min)

### Installer Heroku CLI
```bash
# Linux/Mac
curl https://cli-assets.heroku.com/install.sh | sh

# Windows
# Télécharger : https://devcenter.heroku.com/articles/heroku-cli
```

### Déployer
```bash
cd backend-setup

# Login
heroku login

# Créer l'app
heroku create recytrack-api

# Ajouter PostgreSQL gratuit
heroku addons:create heroku-postgresql:mini

# Variables d'environnement
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
heroku config:set FRONTEND_URL=https://recytrack.vercel.app
heroku config:set NODE_ENV=production

# Déployer
git init
git add .
git commit -m "Backend ready"
heroku git:remote -a recytrack-api
git push heroku main
```

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
