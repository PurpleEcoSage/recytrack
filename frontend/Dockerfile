# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build de production
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Production stage
FROM nginx:alpine

# Copier le build
COPY --from=builder /app/build /usr/share/nginx/html

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer les ports
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]