const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app = express();

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RecyTrack API fonctionne !' });
});

// Route de connexion
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Pour la démo, on accepte n'importe quel email/password
  if (email && password) {
    const token = jwt.sign(
      { userId: 1, email: email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token: token,
      user: {
        id: 1,
        email: email,
        firstName: 'Kevin',
        lastName: 'Martin',
        role: 'admin',
        company: {
          name: 'EcoEntreprise SAS',
          subscriptionPlan: 'premium'
        }
      }
    });
  } else {
    res.status(400).json({ error: 'Email et mot de passe requis' });
  }
});

// Route pour récupérer les types de déchets
app.get('/api/waste/types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM waste_types ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ RecyTrack API lancée sur http://localhost:${PORT}`);
  console.log(`📡 Test de l'API : http://localhost:${PORT}/api/health`);
});