# Architecture de déploiement RecyTrack

## 🚀 Déploiement SaaS (Recommandé)

### Infrastructure Cloud
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Clients PC    │────▶│   RecyTrack.com  │────▶│  PostgreSQL     │
│   Navigateur    │     │   (Frontend)     │     │  AWS RDS        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   Backend API    │
                        │   (Heroku/AWS)   │
                        └──────────────────┘
```

### Coûts mensuels estimés
- Hébergement Frontend (Vercel) : 0€ (gratuit)
- Backend (Heroku) : 7€/mois
- PostgreSQL (Heroku Postgres) : 9€/mois
- Nom de domaine : 1€/mois
**Total : ~17€/mois pour démarrer**

### Mise en place rapide
```bash
# 1. Déployer le frontend sur Vercel
vercel --prod

# 2. Déployer le backend sur Heroku
heroku create recytrack-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main

# 3. Configurer le domaine
# Acheter recytrack.com et pointer vers Vercel
```

## 🏢 Version Entreprise Auto-Hébergée

### Pour les entreprises qui veulent garder leurs données

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────┐
│  PC Employés │────▶│  Serveur Entreprise │────▶│  PostgreSQL  │
│  Navigateur  │     │  192.168.1.100      │     │  Local       │
└──────────────┘     └─────────────────────┘     └──────────────┘
```

### Installation simple avec Docker
```yaml
# docker-compose.yml fourni
version: '3.8'
services:
  postgres:
    image: postgres:15
  backend:
    image: recytrack/backend:latest
  frontend:
    image: recytrack/frontend:latest
    ports:
      - "80:80"
```

### Commande d'installation
```bash
# Sur le serveur de l'entreprise
curl -sSL https://get.recytrack.com | bash
```

## 💻 Version Desktop Standalone

### Pour petites entreprises (1-5 utilisateurs)

Modifier l'application pour utiliser **SQLite** au lieu de PostgreSQL :

```javascript
// config/database.js
const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(app.getPath('userData'), 'recytrack.db'),
  logging: false
});
```

### Avantages SQLite
- ✅ Pas d'installation de base de données
- ✅ Fichier unique (.db)
- ✅ Parfait pour mono-utilisateur
- ✅ Sauvegarde = copier un fichier

## 📊 Tableau comparatif pour vos clients

| Critère | SaaS Cloud | On-Premise | Desktop |
|---------|------------|------------|---------|
| **Installation** | Aucune | Docker/Serveur | 1 clic |
| **Utilisateurs** | Illimités | Illimités | 1-5 |
| **Prix** | 49€/mois | 2000€ (unique) | 199€ (unique) |
| **Données** | Cloud sécurisé | Vos serveurs | PC local |
| **Mises à jour** | Automatiques | Manuelles | Auto-update |
| **Support** | Inclus | En option | Email |
| **Backup** | Automatique | À configurer | Manuel |

## 🎯 Script de vente adapté

### Pour PME classique
"Avec RecyTrack Cloud, vos 10 employés peuvent déclarer leurs déchets depuis n'importe où, sans rien installer. 49€/mois tout compris."

### Pour entreprise avec DSI
"RecyTrack On-Premise s'installe sur vos serveurs en 10 minutes avec Docker. Vos données restent chez vous, conformité RGPD garantie."

### Pour artisan/TPE
"RecyTrack Desktop s'installe comme Word. 199€ une seule fois, vous êtes autonome et conforme à la loi AGEC."

## 🔧 Modifications techniques nécessaires

### 1. Créer une version SQLite
```bash
# Nouveau package.json
"dependencies": {
  "sequelize": "^6.32.1",
  "sqlite3": "^5.1.6"  // Au lieu de pg
}
```

### 2. Détection automatique
```javascript
// Auto-détection du mode
const dbConfig = {
  cloud: process.env.DATABASE_URL,        // Heroku/Cloud
  server: process.env.POSTGRES_HOST,      // On-premise  
  desktop: 'sqlite://recytrack.db'        // Local
};
```

### 3. Build différencié
```json
{
  "scripts": {
    "build:saas": "REACT_APP_MODE=saas npm run build",
    "build:desktop": "REACT_APP_MODE=desktop npm run build",
    "build:server": "REACT_APP_MODE=server npm run build"
  }
}
```

## 💰 Stratégie de monétisation

1. **Freemium SaaS**
   - Gratuit : 10 déclarations/mois
   - Pro : 49€/mois illimité
   - Enterprise : Sur devis

2. **Licences**
   - Desktop : 199€ perpetuel
   - Serveur : 2000€ + 20% maintenance/an
   - Formation : 500€/jour

3. **Services**
   - Installation : 500€
   - Personnalisation : 150€/heure
   - Support premium : 99€/mois

---

**Conseil** : Commencez par le SaaS, c'est plus simple à maintenir et génère des revenus récurrents !