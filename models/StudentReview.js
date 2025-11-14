// server/models/StudentReview.js
const mongoose = require('mongoose');

const studentReviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  course: { type: String, required: true },                // ✅ new
  placementDetails: { type: String, required: true },       // ✅ new
  review: { type: String, required: true },                // ✅ renamed from 'description'
  achievements: [String],
  ratings: { type: Number, min: 1, max: 5, default: null }, // ✅ new (nullable)
  photoUrl: String,        // Cloudinary secure_url
  photoPublicId: String,   // Cloudinary public_id (for deletion)
}, { timestamps: true });

// Optional: Index for performance (if needed)
// studentReviewSchema.index({ name: 1 });

module.exports =
  mongoose.models.StudentReview ||
  mongoose.model('StudentReview', studentReviewSchema);