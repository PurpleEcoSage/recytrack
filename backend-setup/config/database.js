const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuration de la base de données PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'recytrack',
  process.env.DB_USER || 'recytrack',
  process.env.DB_PASSWORD || 'recytrack2024',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

// Tester la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL établie avec succès.');
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };