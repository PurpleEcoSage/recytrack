const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import des modèles
const User = require('./User.postgres')(sequelize, DataTypes);
const Company = require('./Company.postgres')(sequelize, DataTypes);
const WasteType = require('./WasteType')(sequelize, DataTypes);
const WasteProvider = require('./Provider.postgres')(sequelize, DataTypes);
const WasteDeclaration = require('./WasteDeclaration.postgres')(sequelize, DataTypes);
const Report = require('./Report')(sequelize, DataTypes);
const Invitation = require('./Invitation')(sequelize, DataTypes);

// Définir les associations
// Company associations
Company.hasMany(User, { foreignKey: 'company_id', as: 'users' });
Company.hasMany(WasteDeclaration, { foreignKey: 'company_id', as: 'declarations' });
Company.hasMany(Report, { foreignKey: 'company_id', as: 'reports' });
Company.hasMany(Invitation, { foreignKey: 'company_id', as: 'invitations' });

// User associations
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
User.hasMany(WasteDeclaration, { foreignKey: 'user_id', as: 'declarations' });
User.hasMany(Report, { foreignKey: 'generated_by', as: 'generatedReports' });
User.hasMany(Invitation, { foreignKey: 'invited_by', as: 'sentInvitations' });

// WasteDeclaration associations
WasteDeclaration.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
WasteDeclaration.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
WasteDeclaration.belongsTo(WasteType, { foreignKey: 'waste_type_id', as: 'wasteType' });
WasteDeclaration.belongsTo(WasteProvider, { foreignKey: 'provider_id', as: 'provider' });

// WasteProvider associations
WasteProvider.hasMany(WasteDeclaration, { foreignKey: 'provider_id', as: 'declarations' });

// WasteType associations
WasteType.hasMany(WasteDeclaration, { foreignKey: 'waste_type_id', as: 'declarations' });

// Report associations
Report.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Report.belongsTo(User, { foreignKey: 'generated_by', as: 'generatedBy' });

// Invitation associations
Invitation.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Invitation.belongsTo(User, { foreignKey: 'invited_by', as: 'invitedBy' });

module.exports = {
  sequelize,
  User,
  Company,
  WasteType,
  WasteProvider,
  WasteDeclaration,
  Report,
  Invitation
};