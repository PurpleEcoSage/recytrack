# Guide d'Installation RecyTrack

## 🚀 Installation Rapide

### Prérequis
- Node.js (v14 ou supérieur)
- MongoDB (v4.4 ou supérieur)
- NPM ou Yarn

### 1. Cloner le projet
```bash
git clone https://github.com/votre-repo/recytrack.git
cd recytrack
```

### 2. Installation du Backend

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Copier le fichier de configuration
cp .env.example .env

# Configurer les variables d'environnement
nano .env
```

#### Configuration minimale (.env)
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/recytrack
JWT_SECRET=votre-cle-secrete-tres-longue-et-complexe
FRONTEND_URL=http://localhost:3000
```

### 3. Installation du Frontend

```bash
# Aller dans le dossier frontend
cd ../frontend

# Installer les dépendances
npm install

# Créer le fichier de configuration
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### 4. Démarrage de l'application

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm start
```

L'application sera accessible à : http://localhost:3000

## 🔧 Configuration Avancée

### Base de données MongoDB

#### Avec Docker
```bash
docker run -d \
  --name mongodb-recytrack \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -v mongodb_data:/data/db \
  mongo:latest
```

#### Configuration de production
```
MONGODB_URI=mongodb://username:password@host:port/recytrack?authSource=admin
```

### Configuration Email

Pour activer les notifications par email :

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-application
```

### Configuration HTTPS (Production)

1. Installer un reverse proxy (Nginx)
2. Obtenir un certificat SSL (Let's Encrypt)
3. Configurer Nginx :

```nginx
server {
    listen 443 ssl http2;
    server_name recytrack.votredomaine.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

## 📱 Configuration Mobile

Pour accéder à RecyTrack depuis des appareils mobiles sur le même réseau :

1. Trouver votre IP locale :
   ```bash
   # Linux/Mac
   ifconfig | grep inet
   
   # Windows
   ipconfig
   ```

2. Configurer le frontend :
   ```env
   REACT_APP_API_URL=http://VOTRE-IP:5000/api
   ```

3. Configurer le backend CORS :
   ```env
   FRONTEND_URL=http://VOTRE-IP:3000
   ```

## 🏢 Configuration Multi-Entreprises

RecyTrack supporte nativement plusieurs entreprises. Chaque entreprise dispose de :

- Ses propres utilisateurs
- Ses propres données
- Ses propres paramètres
- Son propre abonnement

### Création de la première entreprise

Lors de l'inscription du premier utilisateur, une entreprise est automatiquement créée avec le rôle d'administrateur.

### Plans d'abonnement

- **Basic** : Jusqu'à 5 utilisateurs, fonctionnalités de base
- **Professional** : Jusqu'à 20 utilisateurs, rapports avancés
- **Enterprise** : Utilisateurs illimités, API, support prioritaire

## 🔒 Sécurité

### Checklist de sécurité

- [ ] Changer le JWT_SECRET par défaut
- [ ] Activer HTTPS en production
- [ ] Configurer les CORS correctement
- [ ] Activer le rate limiting
- [ ] Sauvegarder régulièrement la base de données
- [ ] Mettre à jour les dépendances régulièrement

### Sauvegarde automatique

Script de sauvegarde MongoDB :

```bash
#!/bin/bash
# backup-recytrack.sh

BACKUP_DIR="/backup/recytrack"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="recytrack"

# Créer le dossier si nécessaire
mkdir -p $BACKUP_DIR

# Faire la sauvegarde
mongodump --db $DB_NAME --out $BACKUP_DIR/backup_$DATE

# Compresser
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/backup_$DATE

# Supprimer le dossier non compressé
rm -rf $BACKUP_DIR/backup_$DATE

# Garder seulement les 30 dernières sauvegardes
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

Ajouter au crontab :
```bash
0 2 * * * /path/to/backup-recytrack.sh
```

## 🚀 Déploiement avec PM2

### Installation
```bash
npm install -g pm2
```

### Configuration Backend
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'recytrack-backend',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

### Démarrage
```bash
cd backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Build Frontend pour production
```bash
cd frontend
npm run build
```

Servir avec Nginx ou un serveur statique.

## 📊 Monitoring

### Avec PM2
```bash
pm2 monit
pm2 logs recytrack-backend
```

### Logs personnalisés
Les logs sont stockés dans :
- Backend : `backend/logs/`
- Uploads : `backend/uploads/`

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifier que MongoDB est lancé
- Vérifier les variables d'environnement
- Vérifier les logs : `pm2 logs`

### Erreurs CORS
- Vérifier FRONTEND_URL dans .env
- Vérifier que les ports sont corrects

### Problèmes d'upload
- Vérifier les permissions du dossier uploads
- Vérifier MAX_FILE_SIZE dans .env

## 📞 Support

- Documentation : https://docs.recytrack.com
- Email : support@recytrack.com
- Issues : https://github.com/recytrack/issues