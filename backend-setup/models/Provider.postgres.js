module.exports = (sequelize, DataTypes) => {
  const WasteProvider = sequelize.define('WasteProvider', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    siret: {
      type: DataTypes.STRING(14),
      allowNull: true,
      validate: {
        len: [14, 14]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'waste_providers',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return WasteProvider;
};