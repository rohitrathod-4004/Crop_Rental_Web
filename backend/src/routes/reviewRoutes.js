const express = require('express');
const {
  submitReview,
  getEquipmentReviews,
  getOwnerReviews,
  getMyReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Public routes
router.get('/equipment/:id', asyncHandler(getEquipmentReviews));
router.get('/owner/:id', asyncHandler(getOwnerReviews));

// Farmer routes
router.post(
  '/',
  protect,
  restrictTo('FARMER'),
  asyncHandler(submitReview)
);

router.get(
  '/my',
  protect,
  restrictTo('FARMER'),
  asyncHandler(getMyReviews)
);

router.put(
  '/:id',
  protect,
  restrictTo('FARMER'),
  asyncHandler(updateReview)
);

router.delete(
  '/:id',
  protect,
  restrictTo('FARMER'),
  asyncHandler(deleteReview)
);

module.exports = router;
