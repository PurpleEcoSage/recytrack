module.exports = (sequelize, DataTypes) => {
  const WasteType = sequelize.define('WasteType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: '#1C7C54',
      validate: {
        is: /^#[0-9A-F]{6}$/i
      }
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: 'waste_types',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return WasteType;
};