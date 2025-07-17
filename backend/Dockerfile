FROM node:18-alpine

# Installer les dépendances système
RUN apk add --no-cache python3 make g++

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p uploads logs

# Exposer le port
EXPOSE 5000

# Définir l'utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Commande de démarrage
CMD ["node", "server.js"]