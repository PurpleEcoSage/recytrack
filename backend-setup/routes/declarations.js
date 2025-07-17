const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const WasteDeclaration = require('../models/WasteDeclaration');
const Company = require('../models/Company');
const { protect, authorize, checkResourceOwnership } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Validation des déclarations
const validateDeclaration = [
  body('wasteType.name').notEmpty(),
  body('wasteType.code').notEmpty(),
  body('wasteType.category').isIn(['Dangereux', 'Non-dangereux', 'Inerte', 'DEEE', 'Organique']),
  body('quantity.value').isNumeric().isFloat({ min: 0 }),
  body('quantity.unit').isIn(['kg', 't', 'm3']),
  body('collectionDate').isISO8601(),
  body('provider').isMongoId(),
  body('destination').isIn(['Recyclage', 'Valorisation énergétique', 'Enfouissement', 'Incinération', 'Compostage'])
];

// @route   GET /api/declarations
// @desc    Obtenir toutes les déclarations de l'entreprise
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      wasteType,
      startDate,
      endDate,
      provider,
      sort = '-declarationDate'
    } = req.query;

    // Construire la requête
    const query = { company: req.user.company._id };

    if (status) query.status = status;
    if (wasteType) query['wasteType.name'] = new RegExp(wasteType, 'i');
    if (provider) query.provider = provider;
    if (startDate || endDate) {
      query.declarationDate = {};
      if (startDate) query.declarationDate.$gte = new Date(startDate);
      if (endDate) query.declarationDate.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Exécuter la requête
    const declarations = await WasteDeclaration.find(query)
      .populate('declaredBy', 'firstName lastName email')
      .populate('provider', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip(skip);

    // Compter le total
    const total = await WasteDeclaration.countDocuments(query);

    // Calculer les statistiques
    const stats = await WasteDeclaration.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity.value' },
          totalCost: { $sum: '$cost.amount' },
          avgRecyclingRate: { $avg: '$recyclingRate' },
          totalCO2Saved: { $sum: '$environmentalImpact.co2Saved' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: declarations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      stats: stats[0] || {},
      data: declarations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des déclarations',
      error: error.message
    });
  }
});

// @route   GET /api/declarations/:id
// @desc    Obtenir une déclaration par ID
// @access  Private
router.get('/:id', protect, checkResourceOwnership(WasteDeclaration), async (req, res) => {
  try {
    const declaration = await WasteDeclaration.findById(req.params.id)
      .populate('declaredBy', 'firstName lastName email')
      .populate('provider')
      .populate('validatedBy.user', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: declaration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la déclaration',
      error: error.message
    });
  }
});

// @route   POST /api/declarations
// @desc    Créer une nouvelle déclaration
// @access  Private
router.post('/', protect, validateDeclaration, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Ajouter les informations de l'utilisateur et de l'entreprise
    req.body.company = req.user.company._id;
    req.body.declaredBy = req.user._id;

    // Générer un numéro BSD si nécessaire
    const declaration = await WasteDeclaration.create(req.body);
    
    if (req.body.wasteType.category === 'Dangereux' && !declaration.bsdNumber) {
      declaration.generateBSD();
      await declaration.save();
    }

    // Mettre à jour les statistiques de l'entreprise
    await updateCompanyStats(req.user.company._id);

    res.status(201).json({
      success: true,
      data: declaration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la déclaration',
      error: error.message
    });
  }
});

// @route   PUT /api/declarations/:id
// @desc    Mettre à jour une déclaration
// @access  Private
router.put('/:id', protect, checkResourceOwnership(WasteDeclaration), async (req, res) => {
  try {
    const declaration = req.resource;

    // Vérifier si la déclaration peut être modifiée
    if (!declaration.canBeEdited()) {
      return res.status(400).json({
        success: false,
        message: 'Cette déclaration ne peut plus être modifiée'
      });
    }

    // Mettre à jour
    Object.assign(declaration, req.body);
    await declaration.save();

    // Mettre à jour les statistiques
    await updateCompanyStats(req.user.company._id);

    res.status(200).json({
      success: true,
      data: declaration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la déclaration',
      error: error.message
    });
  }
});

// @route   DELETE /api/declarations/:id
// @desc    Supprimer une déclaration
// @access  Private (Admin/Manager)
router.delete('/:id', protect, authorize('admin', 'manager'), checkResourceOwnership(WasteDeclaration), async (req, res) => {
  try {
    const declaration = req.resource;

    // Seules les déclarations en brouillon peuvent être supprimées
    if (declaration.status !== 'Brouillon') {
      return res.status(400).json({
        success: false,
        message: 'Seules les déclarations en brouillon peuvent être supprimées'
      });
    }

    await declaration.deleteOne();

    // Mettre à jour les statistiques
    await updateCompanyStats(req.user.company._id);

    res.status(200).json({
      success: true,
      message: 'Déclaration supprimée'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la déclaration',
      error: error.message
    });
  }
});

// @route   POST /api/declarations/:id/documents
// @desc    Ajouter un document à une déclaration
// @access  Private
router.post('/:id/documents', protect, checkResourceOwnership(WasteDeclaration), upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const declaration = req.resource;
    
    const document = {
      type: req.body.type || 'Autre',
      name: req.file.originalname,
      url: req.file.path,
      uploadedAt: Date.now()
    };

    declaration.documents.push(document);
    await declaration.save();

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du document',
      error: error.message
    });
  }
});

// @route   PUT /api/declarations/:id/status
// @desc    Changer le statut d'une déclaration
// @access  Private (Admin/Manager)
router.put('/:id/status', protect, authorize('admin', 'manager'), checkResourceOwnership(WasteDeclaration), async (req, res) => {
  try {
    const { status } = req.body;
    const declaration = req.resource;

    // Vérifier la cohérence du changement de statut
    const validTransitions = {
      'Brouillon': ['Déclaré', 'Annulé'],
      'Déclaré': ['Collecté', 'Annulé'],
      'Collecté': ['Traité'],
      'Traité': [],
      'Annulé': []
    };

    if (!validTransitions[declaration.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Transition invalide de ${declaration.status} vers ${status}`
      });
    }

    declaration.status = status;
    
    // Si validé, enregistrer qui a validé
    if (status === 'Traité') {
      declaration.validatedBy = {
        user: req.user._id,
        date: Date.now()
      };
    }

    await declaration.save();

    res.status(200).json({
      success: true,
      data: declaration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de statut',
      error: error.message
    });
  }
});

// @route   GET /api/declarations/stats/monthly
// @desc    Obtenir les statistiques mensuelles
// @access  Private
router.get('/stats/monthly', protect, async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;

    const stats = await WasteDeclaration.getMonthlyStats(
      req.user.company._id,
      parseInt(year),
      parseInt(month)
    );

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalQuantity: 0,
        totalRecycled: 0,
        totalCost: 0,
        count: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

// Fonction helper pour mettre à jour les stats de l'entreprise
async function updateCompanyStats(companyId) {
  try {
    const stats = await WasteDeclaration.aggregate([
      { $match: { company: companyId, status: { $ne: 'Annulé' } } },
      {
        $group: {
          _id: null,
          totalWaste: { $sum: '$quantity.value' },
          totalRecycled: {
            $sum: {
              $cond: ['$isRecycled', '$quantity.value', 0]
            }
          },
          totalCost: { $sum: '$cost.amount' },
          co2Saved: { $sum: '$environmentalImpact.co2Saved' }
        }
      }
    ]);

    if (stats.length > 0) {
      await Company.findByIdAndUpdate(companyId, {
        'stats.totalWaste': stats[0].totalWaste,
        'stats.totalRecycled': stats[0].totalRecycled,
        'stats.totalCost': stats[0].totalCost,
        'stats.co2Saved': stats[0].co2Saved,
        'stats.lastDeclaration': Date.now()
      });
    }
  } catch (error) {
    console.error('Erreur mise à jour stats entreprise:', error);
  }
}

module.exports = router;