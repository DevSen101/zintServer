const asyncHandler = require('../utils/asyncHandler');
const Teacher = require('../models/Teacher');

const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find().select('-__v');
  res.status(200).json(teachers);
});

const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).select('-__v');
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
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

  console.log("coursesTaught",coursesTaught);

  // Check if email already exists
  const existingTeacher = await Teacher.findOne({ email });
  
  if (existingTeacher) {
    res.status(400);
    throw new Error('Teacher with this email already exists');
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
    res.status(404);
    throw new Error('Teacher not found');
  }

  // Prevent duplicate email (unless it's the same teacher)
  const emailExists = await Teacher.findOne({
    email: req.body.email,
    _id: { $ne: req.params.id },
  });
  if (emailExists) {
    res.status(400);
    throw new Error('Another teacher already uses this email');
  }

  Object.assign(teacher, req.body);
  const updatedTeacher = await teacher.save();

  res.status(200).json(updatedTeacher);
});  

const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  await teacher.deleteOne();
  res.status(200).json({ message: 'Teacher removed successfully' });
});

const departmentDetails = asyncHandler(async (req, res) => {
   const department = await Teacher.distinct('department');
   res.status(200).json(department);
});   

module.exports = {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  departmentDetails
};