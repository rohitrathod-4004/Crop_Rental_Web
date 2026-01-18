const express = require('express');
const {
  createBooking,
  getFarmerBookings,
  getOwnerBookings,
  getBookingById,
  confirmBooking,
  startBooking,
  completeBooking,
  ownerConfirmCompletion,
  cancelBooking,
  getAvailableSlots,
  getFarmerStats,
  getOwnerStats
} = require('../controllers/bookingController');
const { protect, restrictTo, verifyOwnerApproved } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Farmer routes
router.post(
  '/',
  protect,
  restrictTo('FARMER'),
  asyncHandler(createBooking)
);

router.get(
  '/farmer/stats',
  protect,
  restrictTo('FARMER'),
  asyncHandler(getFarmerStats)
);

router.get(
  '/farmer',
  protect,
  restrictTo('FARMER'),
  asyncHandler(getFarmerBookings)
);

// Owner routes
router.get(
  '/owner/stats',
  protect,
  restrictTo('OWNER'),
  verifyOwnerApproved,
  asyncHandler(getOwnerStats)
);

router.get(
  '/owner',
  protect,
  restrictTo('OWNER'),
  verifyOwnerApproved,
  asyncHandler(getOwnerBookings)
);

router.patch(
  '/:id/confirm',
  protect,
  restrictTo('OWNER'),
  verifyOwnerApproved,
  asyncHandler(confirmBooking)
);

router.patch(
  '/:id/owner-confirm',
  protect,
  restrictTo('OWNER'),
  verifyOwnerApproved,
  asyncHandler(ownerConfirmCompletion)
);

// Shared routes
router.get(
  '/:id',
  protect,
  asyncHandler(getBookingById)
);

// Booking lifecycle (Farmer)
router.patch(
  '/:id/start',
  protect,
  restrictTo('FARMER'),
  asyncHandler(startBooking)
);

router.patch(
  '/:id/complete',
  protect,
  restrictTo('FARMER'),
  asyncHandler(completeBooking)
);

router.patch(
  '/:id/cancel',
  protect,
  restrictTo('FARMER'),
  asyncHandler(cancelBooking)
);

// Helper routes
router.get(
  '/equipment/:equipmentId/available-slots',
  asyncHandler(getAvailableSlots)
);

module.exports = router;
