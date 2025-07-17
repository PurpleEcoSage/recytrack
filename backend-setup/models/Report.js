module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
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
    generated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    report_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['monthly', 'annual', 'custom']]
      }
    },
    period_start: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    period_end: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    total_weight_kg: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    recycling_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    total_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'completed', 'failed']]
      }
    }
  }, {
    tableName: 'reports',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  // Virtual fields
  Report.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    // Convert decimal values to numbers
    if (values.total_weight_kg) {
      values.total_weight_kg = parseFloat(values.total_weight_kg);
    }
    if (values.recycling_rate) {
      values.recycling_rate = parseFloat(values.recycling_rate);
    }
    if (values.total_cost) {
      values.total_cost = parseFloat(values.total_cost);
    }
    
    return values;
  };

  return Report;
};