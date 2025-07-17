const mongoose = require('mongoose');

const wasteDeclarationSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  declaredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wasteType: {
    name: { type: String, required: true },
    code: { type: String, required: true },
    category: {
      type: String,
      enum: ['Dangereux', 'Non-dangereux', 'Inerte', 'DEEE', 'Organique'],
      required: true
    }
  },
  quantity: {
    value: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ['kg', 't', 'm3'], default: 'kg' }
  },
  declarationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  collectionDate: {
    type: Date,
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  destination: {
    type: String,
    enum: ['Recyclage', 'Valorisation énergétique', 'Enfouissement', 'Incinération', 'Compostage'],
    required: true
  },
  isRecycled: {
    type: Boolean,
    default: false
  },
  recyclingRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  cost: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'EUR' }
  },
  documents: [{
    type: {
      type: String,
      enum: ['BSD', 'Facture', 'Certificat', 'Photo', 'Autre']
    },
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  site: {
    name: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ['Brouillon', 'Déclaré', 'Collecté', 'Traité', 'Annulé'],
    default: 'Déclaré'
  },
  bsdNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  comments: String,
  validatedBy: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: Date
  },
  environmentalImpact: {
    co2Saved: { type: Number, default: 0 },
    waterSaved: { type: Number, default: 0 },
    energySaved: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index composés pour les requêtes fréquentes
wasteDeclarationSchema.index({ company: 1, declarationDate: -1 });
wasteDeclarationSchema.index({ company: 1, status: 1 });
wasteDeclarationSchema.index({ provider: 1, collectionDate: -1 });
wasteDeclarationSchema.index({ bsdNumber: 1 });

// Middleware
wasteDeclarationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculer automatiquement si c'est recyclé selon la destination
  if (['Recyclage', 'Valorisation énergétique', 'Compostage'].includes(this.destination)) {
    this.isRecycled = true;
  }
  
  // Calculer l'impact environnemental (formules simplifiées)
  if (this.isRecycled && this.quantity.value) {
    const qtyInKg = this.quantity.unit === 't' ? this.quantity.value * 1000 : this.quantity.value;
    
    // Estimations basiques (à affiner selon le type de déchet)
    this.environmentalImpact.co2Saved = qtyInKg * 0.5; // 0.5 kg CO2 par kg recyclé
    this.environmentalImpact.waterSaved = qtyInKg * 10; // 10L d'eau par kg
    this.environmentalImpact.energySaved = qtyInKg * 2; // 2 kWh par kg
  }
  
  next();
});

// Méthodes
wasteDeclarationSchema.methods.canBeEdited = function() {
  return ['Brouillon', 'Déclaré'].includes(this.status);
};

wasteDeclarationSchema.methods.generateBSD = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  this.bsdNumber = `BSD-${year}${month}-${random}`;
  return this.bsdNumber;
};

// Virtuals
wasteDeclarationSchema.virtual('quantityInKg').get(function() {
  if (this.quantity.unit === 't') {
    return this.quantity.value * 1000;
  } else if (this.quantity.unit === 'm3') {
    // Estimation pour conversion m3 -> kg (dépend du type de déchet)
    return this.quantity.value * 500; // Moyenne approximative
  }
  return this.quantity.value;
});

// Statics
wasteDeclarationSchema.statics.getMonthlyStats = async function(companyId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return this.aggregate([
    {
      $match: {
        company: mongoose.Types.ObjectId(companyId),
        declarationDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: '$quantityInKg' },
        totalRecycled: {
          $sum: {
            $cond: ['$isRecycled', '$quantityInKg', 0]
          }
        },
        totalCost: { $sum: '$cost.amount' },
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('WasteDeclaration', wasteDeclarationSchema);