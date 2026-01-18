const express = require('express');
const {
  submitOwnerVerification,
  getOwnerVerificationStatus
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Owner verification routes
router.post(
  '/owner/submit-verification',
  restrictTo('OWNER'),
  asyncHandler(submitOwnerVerification)
);

router.get(
  '/owner/verification-status',
  restrictTo('OWNER'),
  asyncHandler(getOwnerVerificationStatus)
);

module.exports = router;
