# 🚀 Guide de Déploiement SaaS RecyTrack

## 📋 Prérequis (Comptes gratuits à créer)

1. **GitHub** : https://github.com/signup
2. **Vercel** : https://vercel.com/signup  
3. **Heroku** : https://signup.heroku.com/
4. **Nom de domaine** : Namecheap.com ou OVH.com (~12€/an)

## 🎯 Étape 1 : Préparer le code pour le SaaS

### 1.1 Créer les variables d'environnement

```bash
cd /home/kevin/Bureau/recytrack
```

**Frontend (.env.production)**
```bash
cat > frontend/.env.production << EOF
REACT_APP_API_URL=https://recytrack-api.herokuapp.com/api
REACT_APP_ENV=production
EOF
```

**Backend (.env)**
```bash
cat > backend-setup/.env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=votre-secret-jwt-super-securise-$(openssl rand -hex 32)
FRONTEND_URL=https://recytrack.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=recytrack.notifications@gmail.com
EMAIL_PASS=votre-mot-de-passe-app
EOF
```

### 1.2 Adapter le code pour Heroku

**Créer backend-setup/Procfile**
```bash
echo "web: node server.js" > backend-setup/Procfile
```

**Mettre à jour backend-setup/package.json**
```json
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  },
  "scripts": {
    "start": "node server.js",
    "postinstall": "npm run migrate",
    "migrate": "node scripts/migrate.js"
  }
}
```

## 🎯 Étape 2 : Créer un dépôt GitHub

```bash
# Initialiser Git
cd /home/kevin/Bureau/recytrack
git init
git add .
git commit -m "Initial commit - RecyTrack SaaS"

# Créer le repo sur GitHub (via navigateur)
# Puis :
git remote add origin https://github.com/VOTRE-USERNAME/recytrack.git
git push -u origin main
```

## 🎯 Étape 3 : Déployer le Frontend sur Vercel

### Option A : Via l'interface web

1. Aller sur https://vercel.com/new
2. Importer votre repo GitHub
3. Configurer :
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `build`
4. Variables d'environnement :
   ```
   REACT_APP_API_URL = https://recytrack-api.herokuapp.com/api
   ```
5. Cliquer "Deploy"

### Option B : Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Dans le dossier frontend
cd frontend
vercel

# Répondre aux questions :
# - Set up and deploy: Y
# - Which scope: Votre compte
# - Link to existing project: N
# - Project name: recytrack
# - Directory: ./
# - Build command: npm run build
# - Output directory: build
# - Development command: npm start
```

## 🎯 Étape 4 : Déployer le Backend sur Heroku

### 4.1 Installer Heroku CLI

```bash
# Sur Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh
```

### 4.2 Créer l'app Heroku

```bash
cd backend-setup

# Login
heroku login

# Créer l'app
heroku create recytrack-api

# Ajouter PostgreSQL (gratuit)
heroku addons:create heroku-postgresql:mini

# Voir les infos de connexion
heroku config
```

### 4.3 Configurer les variables

```bash
# JWT Secret
heroku config:set JWT_SECRET=$(openssl rand -hex 32)

# Frontend URL (mettre votre URL Vercel)
heroku config:set FRONTEND_URL=https://recytrack.vercel.app

# Email (optionnel)
heroku config:set EMAIL_HOST=smtp.gmail.com
heroku config:set EMAIL_PORT=587
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
```

### 4.4 Déployer

```bash
# Initialiser git dans backend-setup
git init
git add .
git commit -m "Backend ready for Heroku"

# Pousser vers Heroku
heroku git:remote -a recytrack-api
git push heroku main

# Voir les logs
heroku logs --tail
```

### 4.5 Initialiser la base de données

```bash
# Se connecter à la base
heroku pg:psql

# Ou exécuter le schema
heroku pg:psql < ../database/schema.sql
```

## 🎯 Étape 5 : Mettre à jour l'URL de l'API

1. Copier l'URL Heroku : `https://recytrack-api.herokuapp.com`
2. Dans Vercel, mettre à jour la variable :
   ```
   REACT_APP_API_URL = https://recytrack-api.herokuapp.com/api
   ```
3. Redéployer le frontend

## 🎯 Étape 6 : Configurer un domaine personnalisé

### 6.1 Acheter un domaine
- Namecheap : recytrack.com (~12€/an)
- OVH : recytrack.fr (~7€/an)

### 6.2 Configurer dans Vercel
1. Projet Vercel > Settings > Domains
2. Ajouter `recytrack.com` et `www.recytrack.com`
3. Suivre les instructions DNS

### 6.3 SSL automatique
Vercel configure automatiquement HTTPS ✅

## 🎯 Étape 7 : Services additionnels

### 7.1 Monitoring (Gratuit)
```bash
# UptimeRobot - Surveillance
# Créer un compte sur uptimerobot.com
# Ajouter :
# - https://recytrack.com
# - https://recytrack-api.herokuapp.com/api/health
```

### 7.2 Analytics
```javascript
// Dans frontend/public/index.html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 7.3 Support Client
- **Crisp.chat** : Chat en direct gratuit
- **EmailJS** : Formulaire de contact

## 📊 Tableau de bord admin

Créer une interface admin pour gérer vos clients SaaS :

```javascript
// frontend/src/pages/Admin.js
// - Liste des entreprises inscrites
// - Statistiques d'usage
// - Gestion des abonnements
// - Logs d'activité
```

## 💳 Intégrer les paiements (Stripe)

### 7.1 Créer un compte Stripe
https://dashboard.stripe.com/register

### 7.2 Installer Stripe
```bash
cd backend-setup
npm install stripe
```

### 7.3 Créer les routes de paiement
```javascript
// routes/subscription.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'RecyTrack Pro',
          description: 'Abonnement mensuel',
        },
        unit_amount: 4900, // 49€
        recurring: {
          interval: 'month',
        },
      },
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: 'https://recytrack.com/success',
    cancel_url: 'https://recytrack.com/pricing',
  });
  
  res.json({ url: session.url });
});
```

## 🚀 Check-list de lancement

- [ ] Frontend déployé sur Vercel
- [ ] Backend déployé sur Heroku  
- [ ] Base de données PostgreSQL configurée
- [ ] Variables d'environnement définies
- [ ] Domaine personnalisé configuré
- [ ] SSL/HTTPS actif
- [ ] Emails transactionnels testés
- [ ] Stripe configuré pour les paiements
- [ ] Monitoring actif
- [ ] Page de pricing créée
- [ ] CGV/CGU en ligne
- [ ] RGPD compliance

## 📈 Coûts mensuels

| Service | Gratuit | Payant |
|---------|---------|---------|
| Vercel | ✅ 100GB/mois | 20$/mois Pro |
| Heroku | ❌ | 5$/mois Eco |
| PostgreSQL | ❌ | 5$/mois Mini |
| Domaine | ❌ | 1€/mois |
| **Total** | **0€** | **~11€/mois** |

## 🆘 Dépannage

### Frontend ne se connecte pas au backend
- Vérifier CORS dans le backend
- Vérifier l'URL de l'API dans .env

### Erreur de build Vercel
```bash
# Nettoyer et rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Base de données non accessible
```bash
# Vérifier la connexion
heroku pg:info
heroku pg:credentials:url
```

---

🎉 **Félicitations !** Votre SaaS RecyTrack est maintenant en ligne et prêt à accueillir des clients payants !