module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
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
      unique: true,
      allowNull: true,
      validate: {
        len: [14, 14]
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    postal_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    primary_color: {
      type: DataTypes.STRING(7),
      defaultValue: '#1C7C54',
      validate: {
        is: /^#[0-9A-F]{6}$/i
      }
    },
    subscription_plan: {
      type: DataTypes.STRING(50),
      defaultValue: 'basic',
      validate: {
        isIn: [['basic', 'premium', 'enterprise']]
      }
    },
    subscription_expires_at: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    tableName: 'companies',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Instance methods
  Company.prototype.isSubscriptionActive = function() {
    if (!this.subscription_expires_at) return true;
    return new Date(this.subscription_expires_at) > new Date();
  };

  Company.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values.isSubscriptionActive = this.isSubscriptionActive();
    return values;
  };

  return Company;
};