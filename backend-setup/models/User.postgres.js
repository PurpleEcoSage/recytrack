const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
      unique: true,
      validate: {
        isEmail: true
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase().trim());
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    role: {
      type: DataTypes.STRING(50),
      defaultValue: 'member',
      validate: {
        isIn: [['admin', 'member']]
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reset_token_expires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash && !user.password_hash.startsWith('$2')) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash') && !user.password_hash.startsWith('$2')) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      }
    }
  });

  // Instance methods
  User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password_hash);
  };

  User.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`.trim();
  };

  User.prototype.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    this.reset_token = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    this.reset_token_expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    
    return resetToken;
  };

  // Virtual fields
  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    delete values.reset_token;
    delete values.reset_token_expires;
    values.fullName = this.getFullName();
    return values;
  };

  return User;
};