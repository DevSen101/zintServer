const express = require('express');
const router = express.Router();
const filterController = require('../controllers/FilterController');

// Route to get redirect values
router.get('/redirect-values', filterController.getRedirectValues);

module.exports = router;