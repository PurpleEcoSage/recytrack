const express = require('express');
const router = express.Router();

// Placeholder routes for providers
router.get('/', (req, res) => {
  res.json({ message: 'Providers route - GET /' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Provider route - GET /${req.params.id}` });
});

router.post('/', (req, res) => {
  res.json({ message: 'Providers route - POST /' });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Provider route - PUT /${req.params.id}` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Provider route - DELETE /${req.params.id}` });
});

module.exports = router;