const mongoose = require('mongoose');

const FilterSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Course', FilterSchema);