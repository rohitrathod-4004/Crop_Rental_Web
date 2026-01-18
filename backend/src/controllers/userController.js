const User = require('../models/User');
const { sendSuccess } = require('../utils/responseUtils');
const AppError = require('../utils/AppError');

/**
 * Submit owner verification documents
 * @route POST /api/users/owner/submit-verification
 * @access Private/Owner
 */
const submitOwnerVerification = async (req, res, next) => {
  // Check if user is an owner
  if (req.user.role !== 'OWNER') {
    return next(new AppError('Only owners can submit verification', 403));
  }

  const { idProofUrl, equipmentProofUrl } = req.body;

  // Validate required documents
  if (!idProofUrl || !equipmentProofUrl) {
    return next(new AppError('Both ID proof and equipment proof are required', 400));
  }

  // Update owner profile with documents
  req.user.ownerProfile.documents = {
    idProofUrl,
    equipmentProofUrl
  };

  // Set status to pending if not already set
  if (!req.user.ownerProfile.verificationStatus) {
    req.user.ownerProfile.verificationStatus = 'PENDING_VERIFICATION';
  }

  await req.user.save();

  sendSuccess(res, 200, 'Verification documents submitted successfully', {
    user: req.user
  });
};

/**
 * Get owner verification status
 * @route GET /api/users/owner/verification-status
 * @access Private/Owner
 */
const getOwnerVerificationStatus = async (req, res, next) => {
  if (req.user.role !== 'OWNER') {
    return next(new AppError('Only owners can check verification status', 403));
  }

  const status = {
    verificationStatus: req.user.ownerProfile.verificationStatus,
    verifiedAt: req.user.ownerProfile.verifiedAt,
    rejectionReason: req.user.ownerProfile.rejectionReason,
    documents: req.user.ownerProfile.documents
  };

  sendSuccess(res, 200, 'Verification status fetched successfully', { status });
};

module.exports = {
  submitOwnerVerification,
  getOwnerVerificationStatus
};
