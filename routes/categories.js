// backend/routes/categories.js
const express = require('express');
const { getCategories, saveCategories } = require('../controllers/categoryController');
const router = express.Router();

router.get('/', getCategories);
router.post('/', saveCategories);

module.exports = router; 