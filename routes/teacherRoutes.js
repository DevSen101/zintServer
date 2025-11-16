const express = require('express');
const {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  departmentDetails
} = require('../controllers/teacherController.js');

const router = express.Router();

// Route for distinct departments should come first
router.route('/department')
.get(departmentDetails);

// Routes for collection
router.route('/')
.get(getTeachers)
.post(createTeacher);

// Routes for specific teacher by ID
router.route('/:id')
.get(getTeacherById)
.put(updateTeacher)
.delete(deleteTeacher);

module.exports = router;
