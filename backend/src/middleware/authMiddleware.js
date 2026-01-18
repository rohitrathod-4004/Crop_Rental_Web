const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { VERIFICATION_STATUS } = require('../config/constants');

/**
 * Protect routes - Verify JWT token
 * @middleware
 */
const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return next(new AppError('Not authenticated. Please login to access this resource', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from token
    const user = await User.findById(decoded.userId);

    // Check if user exists
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Account is deactivated', 401));
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token. Please login again', 401));
  }
};

/**
 * Restrict access to specific roles
 * @param {...string} roles - Allowed roles
 * @middleware
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

/**
 * Verify owner is approved before allowing actions
 * @middleware
 */
const verifyOwnerApproved = (req, res, next) => {
  // Only check if user is an owner
  if (req.user.role === 'OWNER') {
    const verificationStatus = req.user.ownerProfile?.verificationStatus;

    if (verificationStatus === VERIFICATION_STATUS.PENDING_VERIFICATION) {
      return next(
        new AppError('Your owner verification is pending. Please wait for admin approval', 403)
      );
    }

    if (verificationStatus === VERIFICATION_STATUS.REJECTED) {
      return next(
        new AppError('Your owner verification was rejected. Please contact support', 403)
      );
    }

    if (verificationStatus !== VERIFICATION_STATUS.APPROVED) {
      return next(
        new AppError('Owner verification required', 403)
      );
    }
  }

  next();
};

/**
 * Check if user owns the resource
 * Expects resourceOwnerId to be set in req object by controller
 * @middleware
 */
const checkOwnership = (req, res, next) => {
  if (!req.resourceOwnerId) {
    return next(new AppError('Resource owner not specified', 500));
  }

  if (req.user._id.toString() !== req.resourceOwnerId.toString()) {
    return next(new AppError('You do not own this resource', 403));
  }

  next();
};

module.exports = {
  protect,
  restrictTo,
  verifyOwnerApproved,
  checkOwnership
};
