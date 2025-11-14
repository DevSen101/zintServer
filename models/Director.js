// models/Director.js
const mongoose = require('mongoose');

const directorSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true },          // schema still calls it `image`
    bio:   { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    socialMedia: {
      linkedin:  { type: String, default: '' },
      twitter:   { type: String, default: '' },
      facebook:  { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Director', directorSchema);