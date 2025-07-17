const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
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
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'France' }
  },
  contact: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    website: String
  },
  logo: {
    type: String,
    default: null
  },
  sector: {
    type: String,
    enum: ['BTP', 'Industrie', 'Commerce', 'Services', 'Santé', 'Education', 'Autre'],
    required: true
  },
  size: {
    type: String,
    enum: ['TPE', 'PME', 'ETI', 'GE'], // Très Petite, Petite/Moyenne, Intermédiaire, Grande Entreprise
    required: true
  },
  subscriptionPlan: {
    type: String,
    enum: ['basic', 'professional', 'enterprise'],
    default: 'basic'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'suspended', 'cancelled'],
    default: 'active'
  },
  subscriptionEndDate: Date,
  settings: {
    currency: { type: String, default: 'EUR' },
    language: { type: String, default: 'fr' },
    timezone: { type: String, default: 'Europe/Paris' },
    wasteCategories: [{
      name: String,
      code: String,
      color: String,
      icon: String
    }],
    emailNotifications: { type: Boolean, default: true },
    monthlyReportAuto: { type: Boolean, default: true }
  },
  stats: {
    totalWaste: { type: Number, default: 0 },
    totalRecycled: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    co2Saved: { type: Number, default: 0 },
    lastDeclaration: Date
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

// Index pour les performances
companySchema.index({ siret: 1 });
companySchema.index({ 'contact.email': 1 });

// Middleware
companySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthodes
companySchema.methods.isSubscriptionActive = function() {
  return this.subscriptionStatus === 'active' && 
         (!this.subscriptionEndDate || this.subscriptionEndDate > new Date());
};

companySchema.methods.getDaysUntilExpiration = function() {
  if (!this.subscriptionEndDate) return null;
  const days = Math.ceil((this.subscriptionEndDate - new Date()) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

// Virtuals
companySchema.virtual('recyclingRate').get(function() {
  if (this.stats.totalWaste === 0) return 0;
  return Math.round((this.stats.totalRecycled / this.stats.totalWaste) * 100);
});

module.exports = mongoose.model('Company', companySchema);