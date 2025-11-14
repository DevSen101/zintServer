// controllers/coursePage2Controller.js
const CoursePage2 = require('../models/CoursePage2');

const createCoursePage2 = async (req, res) => {
  try {
    const { mainCategory, subCategory, childCategory, course } = req.body;

    if (!mainCategory || !subCategory || !childCategory || !course?.title) {
      return res.status(400).json({ message: 'Missing required fields for Course Page 2' });
    }

    // Ensure course.id is unique
    const existing = await CoursePage2.findOne({ 'course.id': course.id });
    if (existing) {
      return res.status(409).json({ message: 'A course with this ID already exists' });
    }

    const newEntry = new CoursePage2({
      mainCategory,
      subCategory,
      childCategory,
      course,
    });

    await newEntry.save();

    res.status(201).json({
      message: '✅ Course Page 2 data saved successfully!',
      data: newEntry
    });
  } catch (error) {
    console.error('Error saving Course Page 2:', error);
    res.status(500).json({ message: 'Failed to save Course Page 2 data' });
  }
};

const getAllCoursePage2 = async (req, res) => {
  try {
    const coursePage2 = await CoursePage2.find();
    res.status(200).json(coursePage2);
  } catch (error) {
    console.error('Error fetching Course Page 2:', error);
    res.status(500).json({ message: 'Failed to fetch Course Page 2 data' });
  }
};

module.exports = { createCoursePage2, getAllCoursePage2 }; 