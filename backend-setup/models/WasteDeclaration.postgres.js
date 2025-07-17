module.exports = (sequelize, DataTypes) => {
  const WasteDeclaration = sequelize.define('WasteDeclaration', {
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    waste_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'waste_types',
        key: 'id'
      }
    },
    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'waste_providers',
        key: 'id'
      }
    },
    quantity_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    is_recycled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    declaration_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    site_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    proof_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    proof_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [['bon_pesee', 'photo', 'facture']]
      }
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'declared',
      validate: {
        isIn: [['declared', 'validated', 'cancelled']]
      }
    }
  }, {
    tableName: 'waste_declarations',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Virtual fields
  WasteDeclaration.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    // Convert decimal values to numbers
    if (values.quantity_kg) {
      values.quantity_kg = parseFloat(values.quantity_kg);
    }
    if (values.cost) {
      values.cost = parseFloat(values.cost);
    }
    
    return values;
  };

  return WasteDeclaration;
};