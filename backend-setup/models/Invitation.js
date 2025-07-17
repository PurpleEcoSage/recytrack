module.exports = (sequelize, DataTypes) => {
  const Invitation = sequelize.define('Invitation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    role: {
      type: DataTypes.STRING(50),
      defaultValue: 'member',
      validate: {
        isIn: [['admin', 'member']]
      }
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    invited_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    accepted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'invitations',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  // Instance methods
  Invitation.prototype.isExpired = function() {
    return new Date() > new Date(this.expires_at);
  };

  Invitation.prototype.isAccepted = function() {
    return this.accepted_at !== null;
  };

  return Invitation;
};