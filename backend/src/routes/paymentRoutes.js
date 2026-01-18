const express = require('express');
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentByBooking,
  getAllPayments,
  handleWebhook
} = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Webhook route (must be before other routes, no auth)
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(handleWebhook));

// Farmer routes
router.post(
  '/create-order',
  protect,
  restrictTo('FARMER'),
  asyncHandler(createPaymentOrder)
);

router.post(
  '/verify',
  protect,
  restrictTo('FARMER'),
  asyncHandler(verifyPayment)
);

// Shared routes
router.get(
  '/booking/:id',
  protect,
  asyncHandler(getPaymentByBooking)
);

// Admin routes
router.get(
  '/',
  protect,
  restrictTo('ADMIN'),
  asyncHandler(getAllPayments)
);

module.exports = router;
