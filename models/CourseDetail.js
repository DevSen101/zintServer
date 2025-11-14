const mongoose = require("mongoose");

// Define the fee plan sub-schema for clarity and validation
const FeePlanSchema = new mongoose.Schema({
  planName: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  discountedPrice: { type: Number, required: true, min: 0 },
  features: [{ type: String, trim: true }]
}, { _id: false }); // Prevents Mongoose from adding _id to each plan

const CourseDetailSchema = new mongoose.Schema({
  courseId: { type: String, required: true, trim: true, unique: true },
  title: { type: String, required: true, trim: true },
  duration: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  nextBatch: { type: String, required: true, trim: true },
  images: {
    Background: String,
    poster: String,
    certificate: String,
    curriculumPdf: String
  },
  jobAssistance: [String],
  highlights: [{ title: String, value: String }],
  liveBatch: [
    {
      title: String,
      teacher: String,
      time: String,
      date:String,
      seats: { type: Number, min: 0 },
      joinLink: String,
      live: { type: Boolean, default: false }
    }
  ],
  faqs: [{ question: String, answer: String }],
  // 👇 ADD fees field
  fees: {
    type: [FeePlanSchema],
    default: []
  }
}, {
  timestamps: true // optional: adds createdAt & updatedAt
});

// Ensure courseId is unique (if not already handled elsewhere)
CourseDetailSchema.index({ courseId: 1 }, { unique: true });

module.exports = mongoose.model("CourseDetail", CourseDetailSchema); 