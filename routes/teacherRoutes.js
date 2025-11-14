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
 
router.route('/')
  .get(getTeachers)
  .post(createTeacher);

router.route('/:id')
  .get(getTeacherById)
  .put(updateTeacher)
  .delete(deleteTeacher) 

router.route('/department')
  .get(departmentDetails)

module.exports = router; 