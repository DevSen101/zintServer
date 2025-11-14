// models/CoursePage2.js
const mongoose = require('mongoose');

const coursePage2Schema = new mongoose.Schema({
  mainCategory: { type: String, required: true },
  subCategory: { type: String, required: true },
  childCategory: { type: String, required: true },
  course: {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    duration: String,
    level: String,
    nextBatch: String,
    description: String,
    topics: [String],
    icon: String,
  }
}, {
  timestamps: true,
  collection: 'course_page_2'
});

module.exports = mongoose.model('CoursePage2', coursePage2Schema);