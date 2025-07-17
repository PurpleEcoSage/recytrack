const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protéger les routes
exports.protect = async (req, res, next) => {
  let token;

  // Vérifier le header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé - Aucun token fourni'
    });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur
    req.user = await User.findById(decoded.id)
      .select('-password')
      .populate('company');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - Utilisateur introuvable'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - Compte désactivé'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé - Token invalide'
    });
  }
};

// Autoriser seulement certains rôles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé - Rôle ${req.user.role} non autorisé`
      });
    }
    next();
  };
};

// Vérifier si l'utilisateur appartient à la même entreprise
exports.checkCompany = (req, res, next) => {
  const requestedCompanyId = req.params.companyId || req.body.companyId || req.query.companyId;

  if (requestedCompanyId && req.user.company._id.toString() !== requestedCompanyId) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé - Entreprise non autorisée'
    });
  }

  next();
};

// Vérifier si l'utilisateur peut accéder à une ressource
exports.checkResourceOwnership = (Model) => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Ressource introuvable'
        });
      }

      // Vérifier si la ressource appartient à l'entreprise de l'utilisateur
      if (resource.company && resource.company.toString() !== req.user.company._id.toString()) {
        // Sauf si l'utilisateur est admin global
        if (req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Accès refusé - Ressource non autorisée'
          });
        }
      }

      req.resource = resource;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  };
};

// Générer un token JWT
exports.generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Envoyer le token dans un cookie
exports.sendTokenResponse = (user, statusCode, res) => {
  const token = exports.generateToken(user._id);

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company
      }
    });
};