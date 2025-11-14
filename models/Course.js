const mongoose = require('mongoose');

const courseItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  }
  // Mongoose automatically adds _id to subdocuments
});

const subheadingSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: '',
  },
  courses: [courseItemSchema],
  redirect: {
    type: Boolean,
    default: false,
  },
});

const courseSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
    trim: true,
  },
  subheadings: [subheadingSchema],
  redirect: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true, 
});

module.exports = mongoose.model('Course', courseSchema);
