// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: {}
  }
}, {
  timestamps: true,
  strict: false,
  minimize: false
});

// Add a pre-save hook for debugging
categorySchema.pre('save', function(next) {
  console.log('📝 About to save category data:', JSON.stringify(this.data, null, 2));
  next();
});

// Add a post-save hook for confirmation
categorySchema.post('save', function(doc) {
  console.log('✅ Category saved successfully with ID:', doc._id);
});

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema); 