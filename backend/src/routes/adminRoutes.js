const express = require('express');
const {
  getPendingOwners,
  getAllOwners,
  getOwnerDetails,
  approveOwner,
  rejectOwner,
  getAllUsers,
  getPlatformStats,
  deactivateUser,
  reactivateUser
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo('ADMIN'));

// Owner verification routes
router.get('/owners/pending', asyncHandler(getPendingOwners));
router.get('/owners', asyncHandler(getAllOwners));
router.get('/owners/:id', asyncHandler(getOwnerDetails));
router.patch('/owners/:id/approve', asyncHandler(approveOwner));
router.patch('/owners/:id/reject', asyncHandler(rejectOwner));

// User management routes
router.get('/users', asyncHandler(getAllUsers));
router.patch('/users/:id/deactivate', asyncHandler(deactivateUser));
router.patch('/users/:id/reactivate', asyncHandler(reactivateUser));

// Platform statistics
router.get('/stats', asyncHandler(getPlatformStats));

module.exports = router;
