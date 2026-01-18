const User = require('../models/User');
const Dispute = require('../models/Dispute');
const { sendSuccess } = require('../utils/responseUtils');
const AppError = require('../utils/AppError');
const { VERIFICATION_STATUS, DISPUTE_STATUS } = require('../config/constants');

/**
 * Get all pending owner verification requests
 * @route GET /api/admin/owners/pending
 * @access Private/Admin
 */
const getPendingOwners = async (req, res) => {
  const owners = await User.find({
    role: 'OWNER',
    'ownerProfile.verificationStatus': VERIFICATION_STATUS.PENDING_VERIFICATION
  })
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, 'Pending owner verifications fetched successfully', {
    count: owners.length,
    owners
  });
};

/**
 * Get all owners (all statuses)
 * @route GET /api/admin/owners
 * @access Private/Admin
 */
const getAllOwners = async (req, res) => {
  const { status } = req.query;

  const filter = { role: 'OWNER' };
  if (status) {
    filter['ownerProfile.verificationStatus'] = status;
  }

  const owners = await User.find(filter)
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, 'Owners fetched successfully', {
    count: owners.length,
    owners
  });
};

/**
 * Get owner details by ID
 * @route GET /api/admin/owners/:id
 * @access Private/Admin
 */
const getOwnerDetails = async (req, res, next) => {
  const owner = await User.findOne({
    _id: req.params.id,
    role: 'OWNER'
  })
    .select('-passwordHash')
    .populate('ownerProfile.verifiedBy', 'name email');

  if (!owner) {
    return next(new AppError('Owner not found', 404));
  }

  sendSuccess(res, 200, 'Owner details fetched successfully', { owner });
};

/**
 * Approve owner verification
 * @route PATCH /api/admin/owners/:id/approve
 * @access Private/Admin
 */
const approveOwner = async (req, res, next) => {
  const owner = await User.findById(req.params.id);

  if (!owner || owner.role !== 'OWNER') {
    return next(new AppError('Owner not found', 404));
  }

  // Check if already approved
  if (owner.ownerProfile.verificationStatus === VERIFICATION_STATUS.APPROVED) {
    return next(new AppError('Owner is already approved', 400));
  }

  // Update verification status
  owner.ownerProfile.verificationStatus = VERIFICATION_STATUS.APPROVED;
  owner.ownerProfile.verifiedAt = new Date();
  owner.ownerProfile.verifiedBy = req.user._id;
  owner.ownerProfile.rejectionReason = undefined; // Clear any previous rejection reason

  await owner.save();

  // Remove password from response
  owner.passwordHash = undefined;

  sendSuccess(res, 200, 'Owner approved successfully', { owner });
};

/**
 * Reject owner verification
 * @route PATCH /api/admin/owners/:id/reject
 * @access Private/Admin
 */
const rejectOwner = async (req, res, next) => {
  const { reason } = req.body;

  // Validate rejection reason
  if (!reason || reason.trim().length === 0) {
    return next(new AppError('Rejection reason is required', 400));
  }

  if (reason.length > 500) {
    return next(new AppError('Rejection reason cannot exceed 500 characters', 400));
  }

  const owner = await User.findById(req.params.id);

  if (!owner || owner.role !== 'OWNER') {
    return next(new AppError('Owner not found', 404));
  }

  // Update verification status
  owner.ownerProfile.verificationStatus = VERIFICATION_STATUS.REJECTED;
  owner.ownerProfile.rejectionReason = reason.trim();
  owner.ownerProfile.verifiedAt = new Date();
  owner.ownerProfile.verifiedBy = req.user._id;

  await owner.save();

  // Remove password from response
  owner.passwordHash = undefined;

  sendSuccess(res, 200, 'Owner verification rejected', { owner });
};

/**
 * Get all users (basic admin view)
 * @route GET /api/admin/users
 * @access Private/Admin
 */
const getAllUsers = async (req, res) => {
  const { role, isActive } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const users = await User.find(filter)
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  // Group users by role for better overview
  const summary = {
    total: users.length,
    farmers: users.filter(u => u.role === 'FARMER').length,
    owners: users.filter(u => u.role === 'OWNER').length,
    admins: users.filter(u => u.role === 'ADMIN').length
  };

  sendSuccess(res, 200, 'Users fetched successfully', {
    summary,
    users
  });
};

/**
 * Get platform statistics
 * @route GET /api/admin/stats
 * @access Private/Admin
 */
const getPlatformStats = async (req, res) => {
  const [
    totalUsers,
    totalFarmers,
    totalOwners,
    totalAdmins,
    pendingOwners,
    approvedOwners,
    rejectedOwners,
    openDisputes,
    resolvedDisputes
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'FARMER' }),
    User.countDocuments({ role: 'OWNER' }),
    User.countDocuments({ role: 'ADMIN' }),
    User.countDocuments({ 
      role: 'OWNER', 
      'ownerProfile.verificationStatus': VERIFICATION_STATUS.PENDING_VERIFICATION 
    }),
    User.countDocuments({ 
      role: 'OWNER', 
      'ownerProfile.verificationStatus': VERIFICATION_STATUS.APPROVED 
    }),
    User.countDocuments({ 
      role: 'OWNER', 
      'ownerProfile.verificationStatus': VERIFICATION_STATUS.REJECTED 
    }),
    Dispute.countDocuments({ status: DISPUTE_STATUS.OPEN }),
    Dispute.countDocuments({ status: DISPUTE_STATUS.RESOLVED })
  ]);

  const stats = {
    users: {
      total: totalUsers,
      farmers: totalFarmers,
      owners: totalOwners,
      admins: totalAdmins
    },
    ownerVerification: {
      pending: pendingOwners,
      approved: approvedOwners,
      rejected: rejectedOwners
    },
    disputes: {
      open: openDisputes,
      resolved: resolvedDisputes
    }
  };

  sendSuccess(res, 200, 'Platform statistics fetched successfully', { stats });
};

/**
 * Deactivate user account
 * @route PATCH /api/admin/users/:id/deactivate
 * @access Private/Admin
 */
const deactivateUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.role === 'ADMIN') {
    return next(new AppError('Cannot deactivate admin users', 403));
  }

  if (!user.isActive) {
    return next(new AppError('User is already deactivated', 400));
  }

  user.isActive = false;
  await user.save();

  sendSuccess(res, 200, 'User deactivated successfully', { user });
};

/**
 * Reactivate user account
 * @route PATCH /api/admin/users/:id/reactivate
 * @access Private/Admin
 */
const reactivateUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.isActive) {
    return next(new AppError('User is already active', 400));
  }

  user.isActive = true;
  await user.save();

  sendSuccess(res, 200, 'User reactivated successfully', { user });
};

module.exports = {
  getPendingOwners,
  getAllOwners,
  getOwnerDetails,
  approveOwner,
  rejectOwner,
  getAllUsers,
  getPlatformStats,
  deactivateUser,
  reactivateUser
};
