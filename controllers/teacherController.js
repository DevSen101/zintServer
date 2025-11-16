const asyncHandler = require('../utils/asyncHandler');
const Teacher = require('../models/Teacher');

const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find().select('-__v');
  res.status(200).json(teachers);
});

const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).select('-__v');
  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' }); // return JSON instead of throw
  }
  res.status(200).json(teacher);
});

const createTeacher = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    department,
    jobProfile,
    coursesTaught,
    bio,
    yearsOfExperience,
    keyAchievements,
    photo,
    socialLinks,
  } = req.body;

  // Check if email already exists
  const existingTeacher = await Teacher.findOne({ email });
  
  if (existingTeacher) {
    return res.status(400).json({ message: 'Teacher with this email already exists' }); // return JSON
  }

  const teacher = await Teacher.create({
    firstName,
    lastName,
    email,
    phoneNumber,
    department,
    jobProfile,
    coursesTaught,
    bio,
    yearsOfExperience,
    keyAchievements,
    photo,
    socialLinks,
  });

  res.status(201).json(teacher);
});

const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' }); // return JSON
  }

  // Prevent duplicate email (unless it's the same teacher)
  const emailExists = await Teacher.findOne({
    email: req.body.email,
    _id: { $ne: req.params.id },
  });
  if (emailExists) {
    return res.status(400).json({ message: 'Another teacher already uses this email' }); // return JSON
  }

  Object.assign(teacher, req.body);
  const updatedTeacher = await teacher.save();

  res.status(200).json(updatedTeacher);
});  

const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' }); // return JSON
  }

  await teacher.deleteOne();
  res.status(200).json({ message: 'Teacher removed successfully' });
});

const departmentDetails = asyncHandler(async (req, res) => {
  const departments = await Teacher.distinct('department');
  res.status(200).json(departments || []); // return empty array if none
});   

module.exports = {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  departmentDetails
};
