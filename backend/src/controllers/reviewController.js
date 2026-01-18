const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const { sendSuccess } = require('../utils/responseUtils');
const AppError = require('../utils/AppError');
const { BOOKING_STATUS } = require('../config/constants');

/**
 * Submit review
 * @route POST /api/reviews
 * @access Private/Farmer
 */
const submitReview = async (req, res, next) => {
  const { bookingId, rating, comment } = req.body;

  // Validate required fields
  if (!bookingId || !rating) {
    return next(new AppError('Booking ID and rating are required', 400));
  }

  // Validate rating range
  if (rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }

  // Get booking
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if farmer owns this booking
  if (!booking.farmerId.equals(req.user._id)) {
    return next(new AppError('Only the farmer can review this booking', 403));
  }

  // Check if booking is completed
  if (booking.status !== BOOKING_STATUS.COMPLETED) {
    return next(new AppError('Reviews can only be submitted for completed bookings', 400));
  }

  // Check if review already exists
  const existingReview = await Review.findOne({ bookingId });
  if (existingReview) {
    return next(new AppError('You have already reviewed this booking', 400));
  }

  // Create review
  const review = await Review.create({
    bookingId,
    farmerId: req.user._id,
    ownerId: booking.ownerId,
    equipmentId: booking.equipmentId,
    rating,
    comment: comment || ''
  });

  // Populate for response
  await review.populate([
    { path: 'farmerId', select: 'name' },
    { path: 'equipmentId', select: 'name type' }
  ]);

  sendSuccess(res, 201, 'Review submitted successfully', { review });
};

/**
 * Get reviews for equipment
 * @route GET /api/reviews/equipment/:id
 * @access Public
 */
const getEquipmentReviews = async (req, res, next) => {
  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  const reviews = await Review.find({ equipmentId: req.params.id })
    .populate('farmerId', 'name')
    .sort({ createdAt: -1 });

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

  // Rating distribution
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  sendSuccess(res, 200, 'Equipment reviews fetched successfully', {
    equipment: {
      id: equipment._id,
      name: equipment.name,
      type: equipment.type
    },
    summary: {
      totalReviews: reviews.length,
      averageRating: parseFloat(averageRating),
      ratingDistribution
    },
    reviews
  });
};

/**
 * Get reviews for owner
 * @route GET /api/reviews/owner/:id
 * @access Public
 */
const getOwnerReviews = async (req, res) => {
  const reviews = await Review.find({ ownerId: req.params.id })
    .populate('farmerId', 'name')
    .populate('equipmentId', 'name type')
    .sort({ createdAt: -1 });

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

  sendSuccess(res, 200, 'Owner reviews fetched successfully', {
    summary: {
      totalReviews: reviews.length,
      averageRating: parseFloat(averageRating)
    },
    reviews
  });
};

/**
 * Get my reviews (as farmer)
 * @route GET /api/reviews/my
 * @access Private/Farmer
 */
const getMyReviews = async (req, res) => {
  const reviews = await Review.find({ farmerId: req.user._id })
    .populate('equipmentId', 'name type')
    .populate('ownerId', 'name')
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, 'My reviews fetched successfully', {
    count: reviews.length,
    reviews
  });
};

/**
 * Update review
 * @route PUT /api/reviews/:id
 * @access Private/Farmer
 */
const updateReview = async (req, res, next) => {
  const { rating, comment } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  // Check if farmer owns this review
  if (!review.farmerId.equals(req.user._id)) {
    return next(new AppError('You can only update your own reviews', 403));
  }

  // Validate rating if provided
  if (rating && (rating < 1 || rating > 5)) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }

  // Update fields
  if (rating) review.rating = rating;
  if (comment !== undefined) review.comment = comment;

  await review.save();

  sendSuccess(res, 200, 'Review updated successfully', { review });
};

/**
 * Delete review
 * @route DELETE /api/reviews/:id
 * @access Private/Farmer
 */
const deleteReview = async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  // Check if farmer owns this review
  if (!review.farmerId.equals(req.user._id)) {
    return next(new AppError('You can only delete your own reviews', 403));
  }

  await review.deleteOne();

  sendSuccess(res, 200, 'Review deleted successfully', null);
};

module.exports = {
  submitReview,
  getEquipmentReviews,
  getOwnerReviews,
  getMyReviews,
  updateReview,
  deleteReview
};
