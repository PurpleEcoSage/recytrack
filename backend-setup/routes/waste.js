const express = require('express');
const router = express.Router();

// Placeholder routes for waste
router.get('/', (req, res) => {
  res.json({ message: 'Waste route - GET /' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Waste route - GET /${req.params.id}` });
});

router.post('/', (req, res) => {
  res.json({ message: 'Waste route - POST /' });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Waste route - PUT /${req.params.id}` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Waste route - DELETE /${req.params.id}` });
});

module.exports = router;