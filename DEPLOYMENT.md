# 📦 Guide de Déploiement RecyTrack

## 🖥️ Application Desktop (Windows, Mac, Linux)

### Installation Simple

1. **Télécharger l'installateur** pour votre système :
   - Windows : `RecyTrack-Setup-1.0.0.exe`
   - macOS : `RecyTrack-1.0.0.dmg`
   - Linux : `RecyTrack-1.0.0.AppImage`

2. **Installer** :
   - **Windows** : Double-cliquer sur le .exe et suivre l'assistant
   - **macOS** : Ouvrir le .dmg et glisser RecyTrack dans Applications
   - **Linux** : Rendre le .AppImage exécutable et lancer

3. **Première utilisation** :
   - L'application démarre automatiquement MongoDB et le backend
   - Créez votre compte entreprise
   - Commencez à utiliser RecyTrack !

### Construire depuis les sources

```bash
# Cloner le projet
git clone https://github.com/recytrack/recytrack.git
cd recytrack

# Lancer le build
./build-app.sh

# Choisir option 1 (Desktop) puis votre plateforme
```

## 🐳 Déploiement Docker (Serveur)

### Installation Rapide

```bash
# Cloner le projet
git clone https://github.com/recytrack/recytrack.git
cd recytrack

# Configurer l'environnement
cp .env.example .env
nano .env  # Modifier les variables

# Lancer avec Docker Compose
docker-compose up -d

# L'application est disponible sur http://localhost
```

### Configuration Production

1. **Variables d'environnement** (.env) :
```env
# MongoDB
MONGO_PASSWORD=mot-de-passe-securise

# JWT
JWT_SECRET=cle-tres-longue-et-aleatoire

# URLs
FRONTEND_URL=https://recytrack.votre-domaine.com
API_URL=https://api.recytrack.votre-domaine.com
```

2. **SSL/HTTPS** :
   - Placer les certificats dans `nginx/ssl/`
   - Modifier `nginx/nginx.conf` pour HTTPS

3. **Backups automatiques** :
   - Les backups sont dans `./backups`
   - Planification : quotidienne par défaut

### Commandes Utiles

```bash
# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Mettre à jour
git pull
docker-compose build
docker-compose up -d

# Backup manuel
docker-compose exec mongodb mongodump --out /backup

# Restaurer
docker-compose exec mongodb mongorestore /backup
```

## ☁️ Déploiement Cloud

### AWS EC2

1. **Lancer une instance** :
   - Ubuntu 22.04 LTS
   - t3.medium minimum
   - 30GB SSD

2. **Installer Docker** :
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

3. **Déployer RecyTrack** :
```bash
git clone https://github.com/recytrack/recytrack.git
cd recytrack
docker-compose up -d
```

### Heroku

```bash
# Installer Heroku CLI
# Créer l'app
heroku create recytrack-monentreprise

# Ajouter MongoDB
heroku addons:create mongolab

# Déployer
git push heroku main
```

### DigitalOcean

Utiliser l'App Platform ou un Droplet avec Docker.

## 📱 Application Mobile (PWA)

RecyTrack fonctionne comme une Progressive Web App :

1. **Sur mobile** : Ouvrir https://recytrack.com dans Chrome/Safari
2. **Installer** : Menu → "Ajouter à l'écran d'accueil"
3. **Utiliser** : L'app fonctionne hors ligne avec synchronisation

## 🏢 Déploiement Entreprise

### Architecture Recommandée

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│   Backend   │────▶│  MongoDB    │
│  (Reverse   │     │   (API)     │     │ (Database)  │
│   Proxy)    │     │   Port 5000 │     │  Port 27017 │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│  Frontend   │
│  (React)    │
│   Port 80   │
└─────────────┘
```

### Haute Disponibilité

Pour une installation hautement disponible :

1. **Load Balancer** : HAProxy ou AWS ELB
2. **Backend** : 2+ instances en cluster
3. **MongoDB** : Replica Set (3 nœuds)
4. **Cache** : Redis pour les sessions
5. **CDN** : CloudFlare pour les assets

### Monitoring

```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## 🔒 Sécurité Production

### Checklist

- [ ] Changer tous les mots de passe par défaut
- [ ] Activer HTTPS avec certificat valide
- [ ] Configurer un firewall (ufw, iptables)
- [ ] Limiter l'accès MongoDB (bind_ip)
- [ ] Activer les logs d'audit
- [ ] Configurer fail2ban
- [ ] Sauvegardes chiffrées externes

### Exemple Configuration Nginx Sécurisée

```nginx
server {
    listen 443 ssl http2;
    server_name recytrack.com;

    # SSL
    ssl_certificate /etc/letsencrypt/live/recytrack.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/recytrack.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Sécurité
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:5000;
    }
}
```

## 🚀 Mise en Production

### Étapes Finales

1. **Tests** :
   ```bash
   npm test
   npm run test:e2e
   ```

2. **Build de production** :
   ```bash
   ./build-app.sh
   ```

3. **Déploiement** :
   - Desktop : Uploader sur GitHub Releases
   - Web : `docker-compose up -d`

4. **Vérification** :
   - Tester toutes les fonctionnalités
   - Vérifier les logs
   - Tester les backups

## 📞 Support Déploiement

- Documentation : https://docs.recytrack.com/deployment
- Support : deployment@recytrack.com
- Urgences : +33 1 23 45 67 89