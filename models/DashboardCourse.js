// models/DashboardCourse.ts (or .js)
const { Schema, model } = require('mongoose');

const ImageSchema = new Schema({
  Background: String,
  poster: String,
  certificate: String,
  curriculumPdf: String,
});

const LiveBatchSchema = new Schema({
  title: String,
  teacher: String,
  time: String,
  seats: Number,
  joinLink: String,
  live: Boolean,
});

const DashboardCourseSchema = new Schema({
  images: ImageSchema,
  _id: String,
  courseId: String,
  description: String,
  duration: String,
  faqs: [Schema.Types.Mixed],
  highlights: [Schema.Types.Mixed],
  jobAssistance: [Schema.Types.Mixed],
  liveBatch: [LiveBatchSchema],
  nextBatch: String,
  title: String,
}, { _id: false })

module.exports = model('DashboardCourse', DashboardCourseSchema);