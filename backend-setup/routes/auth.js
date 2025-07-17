const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Company = require('../models/Company');
const { sendTokenResponse } = require('../middleware/auth');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Validation des entrées
const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('company.name').notEmpty().trim(),
  body('company.siret').matches(/^[0-9]{14}$/).withMessage('SIRET invalide')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// @route   POST /api/auth/register
// @desc    Inscription d'un nouvel utilisateur et entreprise
// @access  Public
router.post('/register', validateRegister, async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, firstName, lastName, company: companyData } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Vérifier si l'entreprise existe déjà
    let company = await Company.findOne({ siret: companyData.siret });
    if (company) {
      return res.status(400).json({
        success: false,
        message: 'Cette entreprise est déjà enregistrée'
      });
    }

    // Créer l'entreprise
    company = await Company.create({
      name: companyData.name,
      siret: companyData.siret,
      address: companyData.address,
      contact: {
        email: companyData.contact?.email || email,
        phone: companyData.contact?.phone,
        website: companyData.contact?.website
      },
      sector: companyData.sector,
      size: companyData.size,
      settings: {
        wasteCategories: [
          { name: 'Papier/Carton', code: 'PAP', color: '#2563eb', icon: '📄' },
          { name: 'Plastique', code: 'PLA', color: '#ef4444', icon: '🥤' },
          { name: 'Verre', code: 'VER', color: '#10b981', icon: '🍾' },
          { name: 'Métal', code: 'MET', color: '#6b7280', icon: '🔧' },
          { name: 'Bois', code: 'BOI', color: '#92400e', icon: '🪵' },
          { name: 'Déchets organiques', code: 'ORG', color: '#84cc16', icon: '🌱' },
          { name: 'DEEE', code: 'DEE', color: '#8b5cf6', icon: '💻' },
          { name: 'Déchets dangereux', code: 'DAN', color: '#dc2626', icon: '☢️' }
        ]
      }
    });

    // Créer l'utilisateur
    user = await User.create({
      email,
      password,
      firstName,
      lastName,
      company: company._id,
      role: 'admin' // Le premier utilisateur d'une entreprise est admin
    });

    // Envoyer email de bienvenue
    try {
      await sendEmail({
        email: user.email,
        subject: 'Bienvenue sur RecyTrack',
        message: `Bonjour ${user.firstName},\n\nBienvenue sur RecyTrack ! Votre compte a été créé avec succès.\n\nVous pouvez maintenant vous connecter et commencer à gérer vos déchets de manière efficace.\n\nCordialement,\nL'équipe RecyTrack`
      });
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
    }

    // Envoyer la réponse avec le token
    sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Connexion utilisateur
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).select('+password').populate('company');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }

    // Vérifier si l'abonnement de l'entreprise est actif
    if (!user.company.isSubscriptionActive()) {
      return res.status(403).json({
        success: false,
        message: 'L\'abonnement de votre entreprise a expiré'
      });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = Date.now();
    await user.save();

    // Envoyer la réponse avec le token
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion',
      error: error.message
    });
  }
});

// @route   GET /api/auth/logout
// @desc    Déconnexion
// @access  Private
router.get('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// @route   POST /api/auth/forgotpassword
// @desc    Mot de passe oublié
// @access  Public
router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun utilisateur trouvé avec cet email'
      });
    }

    // Générer le token de réinitialisation
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Créer l'URL de réinitialisation
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `Vous avez demandé une réinitialisation de mot de passe.\n\nCliquez sur ce lien pour réinitialiser votre mot de passe:\n${resetUrl}\n\nCe lien expirera dans 30 minutes.\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Réinitialisation de mot de passe RecyTrack',
        message
      });

      res.status(200).json({
        success: true,
        message: 'Email envoyé'
      });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/resetpassword/:resettoken
// @desc    Réinitialiser le mot de passe
// @access  Public
router.put('/resetpassword/:resettoken', async (req, res) => {
  // Hash du token reçu
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    // Définir le nouveau mot de passe
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

module.exports = router;