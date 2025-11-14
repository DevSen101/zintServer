// models/CourseModel.js
const { connectDB } = require('../config/db');

let courseCollection;

async function getCollection() {
  if (!courseCollection) {
    const db = await connectDB();
    courseCollection = db.collection('courses');
  }
  return courseCollection;
}

module.exports = { getCollection };