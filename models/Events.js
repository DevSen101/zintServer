// models/Event.js
const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  address: String,
  city: String,
  state: String,
  country: String,
  zipCode: String,
}, { _id: false });

const instructorSchema = new mongoose.Schema({
  name: String,
  role: String,
  avatar: String,
}, { _id: false });

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    eventType: {
      type: String,
      enum: ['Workshop', 'Conference', 'Webinar', 'Hackathon'],
      default: 'Workshop',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    locationType: {
      type: String,
      enum: ['online', 'venue', 'hybrid'],
      default: 'venue',
    },
    venue: venueSchema,
    onlineLink: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
      default: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: 0,
    },
    ticketsSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    instructor: instructorSchema,
    thumbnailImage: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    tags: [String],
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ slug: 1 });
eventSchema.index({ 'venue.city': 1 });

// Auto-generate slug from title if not provided
eventSchema.pre('save', function (next) {
  if (!this.slug && this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Add timestamp to ensure uniqueness
    this.slug += `-${Date.now()}`;
  }
  next();
});

// Validate that online events have a link
eventSchema.pre('save', function(next) {
  if ((this.locationType === 'online' || this.locationType === 'hybrid') && !this.onlineLink) {
    next(new Error('Online link is required for online/hybrid events'));
  }
  next();
});

// Validate that venue events have venue details
eventSchema.pre('save', function(next) {
  if ((this.locationType === 'venue' || this.locationType === 'hybrid') && !this.venue) {
    next(new Error('Venue details are required for venue/hybrid events'));
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);