// routes/workshopRoutes.js
const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshopController');

// ✅ Order is CRITICAL: specific routes before dynamic ones

// Get all
router.get('/', workshopController.getAllWorkshops);

// Get by slug (MUST come before :id)
router.get('/slug/:_id', workshopController.getWorkshopBySlug);

// Create
router.post('/', workshopController.createWorkshop);

// Get by ID
router.get('/:id', workshopController.getWorkshopById);

// Update
router.put('/:id', workshopController.updateWorkshop);

// Delete
router.delete('/:id', workshopController.deleteWorkshop);
 
// ✅ Optional: Add global error handler for this router
router.use((err, req, res, next) => {
  console.error('Workshop route error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = router;