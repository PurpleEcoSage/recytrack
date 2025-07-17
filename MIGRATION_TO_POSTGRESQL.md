# Migration de MongoDB vers PostgreSQL

## Vue d'ensemble

Le backend RecyTrack a été modifié pour utiliser PostgreSQL au lieu de MongoDB. Cette migration apporte plusieurs avantages :

- Meilleure intégrité des données avec les contraintes relationnelles
- Support des transactions ACID
- Requêtes SQL complexes pour les rapports
- Meilleure compatibilité avec les outils d'analyse

## Changements effectués

### 1. Dépendances NPM
- **Supprimé** : `mongoose` (MongoDB ORM)
- **Ajouté** : 
  - `sequelize` (PostgreSQL ORM)
  - `pg` (driver PostgreSQL)
  - `pg-hstore` (sérialisation pour Sequelize)

### 2. Structure des modèles
Les modèles ont été convertis de Mongoose vers Sequelize :

- `/models/User.postgres.js` - Modèle utilisateur
- `/models/Company.postgres.js` - Modèle entreprise
- `/models/WasteType.js` - Types de déchets
- `/models/Provider.postgres.js` - Prestataires
- `/models/WasteDeclaration.postgres.js` - Déclarations
- `/models/Report.js` - Rapports
- `/models/Invitation.js` - Invitations
- `/models/index.js` - Centralise tous les modèles et associations

### 3. Configuration
- `/config/database.js` - Configuration de connexion PostgreSQL
- `.env.example` - Variables d'environnement pour PostgreSQL

### 4. Docker Compose
- Service `mongodb` remplacé par `postgres`
- Service de backup adapté pour PostgreSQL
- Health checks PostgreSQL ajoutés

## Installation

### 1. Installation locale

```bash
# Installer PostgreSQL
chmod +x install-postgresql.sh
./install-postgresql.sh

# Installer les dépendances NPM
cd backend-setup
npm install

# Copier et configurer le fichier .env
cp .env.example .env
# Éditer .env avec vos paramètres

# Démarrer le serveur
npm run dev
```

### 2. Installation avec Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f backend
```

## Migration des données

Si vous avez des données existantes dans MongoDB, vous devrez les migrer vers PostgreSQL :

1. Exporter les données MongoDB
2. Transformer le format des données
3. Importer dans PostgreSQL

Un script de migration peut être créé si nécessaire.

## Variables d'environnement

Nouvelles variables requises :

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=recytrack
DB_USER=recytrack
DB_PASSWORD=recytrack2024
DB_SSL=false
```

## Modifications des routes

Les routes API restent identiques, seule l'implémentation backend change. Les contrôleurs devront être mis à jour pour utiliser Sequelize au lieu de Mongoose.

## Prochaines étapes

1. Mettre à jour les contrôleurs pour utiliser les nouveaux modèles Sequelize
2. Tester toutes les fonctionnalités
3. Créer des migrations Sequelize pour la production
4. Mettre à jour la documentation API si nécessaire

## Commandes utiles

```bash
# Se connecter à PostgreSQL
psql -h localhost -U recytrack -d recytrack

# Voir les tables
\dt

# Exécuter le schéma manuellement
psql -h localhost -U recytrack -d recytrack -f database/schema.sql

# Logs Docker
docker-compose logs postgres
docker-compose logs backend
```