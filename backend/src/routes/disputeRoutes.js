const express = require('express');
const {
  raiseDispute,
  getMyDisputes,
  getDisputeById,
  adminResolveDispute,
  getAllDisputes,
  markUnderReview,
  createDisputeRefundOrder,
  verifyDisputeRefund
} = require('../controllers/disputeController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes (Farmer/Owner)
router.post('/', asyncHandler(raiseDispute));
router.get('/my', asyncHandler(getMyDisputes));
router.get('/:id', asyncHandler(getDisputeById));

// Admin routes
router.get(
  '/admin/all',
  restrictTo('ADMIN'),
  asyncHandler(getAllDisputes)
);

router.patch(
  '/:id/under-review',
  restrictTo('ADMIN'),
  asyncHandler(markUnderReview)
);

router.patch(
  '/:id/admin-action',
  restrictTo('ADMIN'),
  asyncHandler(adminResolveDispute)
);

// Refund payment routes
router.post('/:id/refund-order', asyncHandler(createDisputeRefundOrder));
router.post('/:id/verify-refund', asyncHandler(verifyDisputeRefund));

module.exports = router;
