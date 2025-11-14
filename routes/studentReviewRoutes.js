const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentReviewController');

// Use single file upload for photo
router.route('/')
  .get(controller.getAllReviews)
  .post(controller.createReview);

router.route('/:id')
  .get(controller.getReviewById)
  .put(controller.updateReview)
  .delete(controller.deleteReview);

module.exports = router; 