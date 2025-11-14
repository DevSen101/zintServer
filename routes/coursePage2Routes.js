// routes/coursePage2Routes.js
const express = require('express');
const { createCoursePage2, getAllCoursePage2 } = require('../controllers/coursePage2Controller');

const router = express.Router();

// Matches your frontend endpoint exactly
router.post('/courses_page_second', createCoursePage2);
router.get('/courses_page_second', getAllCoursePage2);

module.exports = router; 