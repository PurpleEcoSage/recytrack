const { sequelize } = require('./models');

async function initDB() {
  try {
    console.log('🔄 Initialisation de la base de données...');
    await sequelize.sync({ alter: true });
    console.log('✅ Base de données prête !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

initDB();
