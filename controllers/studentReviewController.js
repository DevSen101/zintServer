// controllers/studentReviewController.js
const StudentReview = require('../models/StudentReview');
const cloudinary = require('../config/cloudinary');

// Helper: Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (err) {
    console.warn('Cloudinary delete warning:', err.message);
  }
};

// Helper: Extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return null;
    const publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/');
    return publicIdWithExt.split('.')[0];
  } catch (err) {
    console.warn('Failed to extract public_id from URL:', url);
    return null;
  }
};

// ✅ CREATE Review
const createReview = async (req, res) => {
  try {
    const {
      name,
      course,
      placementDetails,
      review,           // ✅ renamed from 'description'
      achievements = [],
      ratings,
      photoUrl
    } = req.body;

    // Validation
    if (!name || !course || !placementDetails || !review) {
      return res.status(400).json({
        message: 'Name, course, placement details, and review are required'
      });
    }

    // Validate ratings (optional but recommended)
    if (ratings != null) {
      const numRating = Number(ratings);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({ message: 'Ratings must be a number between 1 and 5' });
      }
    }

    const newReview = new StudentReview({
      name,
      course,
      placementDetails,
      review,
      achievements: Array.isArray(achievements) ? achievements : [],
      ratings: ratings != null ? Number(ratings) : null,
      photoUrl
    });

    // Optional: extract and store public_id for easier deletion later
    if (photoUrl) {
      newReview.photoPublicId = extractPublicIdFromUrl(photoUrl);
    }

    const saved = await newReview.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(400).json({ message: error.message || 'Failed to create review' });
  }
};

// ✅ UPDATE Review
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      course,
      placementDetails,
      review,
      achievements,
      ratings,
      photoUrl
    } = req.body;

    const existingReview = await StudentReview.findById(id);
    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Handle photo update
    const isPhotoUpdated = photoUrl !== undefined && photoUrl !== existingReview.photoUrl;
    if (isPhotoUpdated) {
      // Delete old image
      const oldPublicId = existingReview.photoPublicId || extractPublicIdFromUrl(existingReview.photoUrl);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }

      // Set new photo
      existingReview.photoUrl = photoUrl;
      existingReview.photoPublicId = photoUrl ? extractPublicIdFromUrl(photoUrl) : null;
    }

    // Update other fields (only if provided)
    if (name !== undefined) existingReview.name = name;
    if (course !== undefined) existingReview.course = course;
    if (placementDetails !== undefined) existingReview.placementDetails = placementDetails;
    if (review !== undefined) existingReview.review = review;
    if (achievements !== undefined) {
      existingReview.achievements = Array.isArray(achievements) ? achievements : [];
    }
    if (ratings !== undefined) {
      if (ratings === null || ratings === '') {
        existingReview.ratings = null;
      } else {
        const numRating = Number(ratings);
        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
          return res.status(400).json({ message: 'Ratings must be between 1 and 5' });
        }
        existingReview.ratings = numRating;
      }
    }

    const updatedReview = await existingReview.save();
    res.json(updatedReview);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(400).json({ message: error.message || 'Failed to update review' });
  }
};

// ✅ DELETE Review
const deleteReview = async (req, res) => {
  try {
    const review = await StudentReview.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Delete image from Cloudinary (if exists)
    const publicId = review.photoPublicId || extractPublicIdFromUrl(review.photoUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    await StudentReview.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};

// ✅ GET all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await StudentReview.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// ✅ GET review by ID
const getReviewById = async (req, res) => {
  try {
    const review = await StudentReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch review' });
  }
};

module.exports = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};