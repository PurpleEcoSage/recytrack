const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  siret: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{14}$/.test(v);
      },
      message: 'Le SIRET doit contenir exactement 14 chiffres'
    }
  },
  contact: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    mobile: String
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'France' }
  },
  services: [{
    type: String,
    enum: [
      'Collecte',
      'Transport',
      'Tri',
      'Recyclage',
      'Valorisation',
      'Elimination',
      'Location bennes',
      'Conseil'
    ]
  }],
  wasteTypes: [{
    name: String,
    code: String,
    price: {
      amount: Number,
      unit: String // '€/kg', '€/t', '€/m3'
    }
  }],
  certifications: [{
    name: String,
    number: String,
    validUntil: Date,
    document: String
  }],
  coverage: {
    national: { type: Boolean, default: false },
    regions: [String],
    departments: [String]
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  contractedCompanies: [{
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    contractStart: Date,
    contractEnd: Date,
    status: {
      type: String,
      enum: ['active', 'suspended', 'terminated'],
      default: 'active'
    }
  }],
  performance: {
    totalCollections: { type: Number, default: 0 },
    onTimeRate: { type: Number, default: 100 },
    recyclingRate: { type: Number, default: 0 },
    lastCollection: Date
  },
  bankDetails: {
    iban: String,
    bic: String,
    accountName: String
  },
  insurance: {
    company: String,
    policyNumber: String,
    validUntil: Date
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index
providerSchema.index({ siret: 1 });
providerSchema.index({ 'contact.email': 1 });
providerSchema.index({ isActive: 1 });
providerSchema.index({ 'coverage.departments': 1 });

// Middleware
providerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthodes
providerSchema.methods.isContractActive = function(companyId) {
  const contract = this.contractedCompanies.find(
    c => c.company.toString() === companyId.toString()
  );
  
  if (!contract) return false;
  
  return contract.status === 'active' && 
         (!contract.contractEnd || contract.contractEnd > new Date());
};

providerSchema.methods.addRating = function(rating) {
  const newCount = this.rating.count + 1;
  const newAverage = ((this.rating.average * this.rating.count) + rating) / newCount;
  
  this.rating.average = Math.round(newAverage * 10) / 10;
  this.rating.count = newCount;
};

providerSchema.methods.coversLocation = function(postalCode) {
  if (this.coverage.national) return true;
  
  const department = postalCode.substring(0, 2);
  return this.coverage.departments.includes(department);
};

// Statics
providerSchema.statics.findByLocation = async function(postalCode) {
  const department = postalCode.substring(0, 2);
  
  return this.find({
    isActive: true,
    $or: [
      { 'coverage.national': true },
      { 'coverage.departments': department }
    ]
  }).sort({ 'rating.average': -1 });
};

module.exports = mongoose.model('Provider', providerSchema);