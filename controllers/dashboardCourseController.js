// controllers/dashboardCourseController.js
const DashboardCourse = require('../models/DashboardCourse');
const saveDashboardCourses = async (req, res) => {
  try {
    const courses = req.body;

    if (!Array.isArray(courses)) {
      return res.status(400).json({ error: 'Expected an array of courses' });
    }

    // Optional: Clear existing dashboard courses if you want to replace them
    await DashboardCourse.deleteMany({});

    // Insert new courses
    const savedCourses = await DashboardCourse.insertMany(courses);

    return res.status(200).json({
      message: 'Dashboard courses saved successfully',
      count: savedCourses.length,
    });
  } catch (error) {
    console.error('Error saving dashboard courses:', error);
    return res.status(500).json({ error: 'Failed to save dashboard courses' });
  }
};

const getDashboardCourses = async (req, res) => {
  try {
    const courses = await DashboardCourse.find();
    return res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching dashboard courses:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard courses' });
  }
};


module.exports = { saveDashboardCourses, getDashboardCourses };
