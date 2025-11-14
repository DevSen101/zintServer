// routes/dashboardCourseRoutes.js
const { Router } = require('express');
const { saveDashboardCourses, getDashboardCourses } = require('../controllers/dashboardCourseController.js');

const router = Router();

router.post('/save-dashboard-courses', saveDashboardCourses);
router.get('/get-dashboard-courses', getDashboardCourses);

module.exports = router;