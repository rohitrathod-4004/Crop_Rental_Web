const Dispute = require('../models/Dispute');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Razorpay = require('razorpay');
const { sendSuccess } = require('../utils/responseUtils');
const AppError = require('../utils/AppError');
const { DISPUTE_STATUS, BOOKING_STATUS } = require('../config/constants');

/**
 * Raise a dispute
 * @route POST /api/disputes
 * @access Private (Farmer/Owner)
 */
const raiseDispute = async (req, res, next) => {
  const { bookingId, disputeType, reason, description, evidenceImages } = req.body;

  // Validate required fields
  if (!bookingId || !disputeType || !reason || !description) {
    return next(new AppError('Missing required dispute details', 400));
  }

  // Get booking
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if user is part of this booking
  const isFarmer = booking.farmerId.equals(req.user._id);
  const isOwner = booking.ownerId.equals(req.user._id);

  if (!isFarmer && !isOwner) {
    return next(new AppError('You are not authorized to raise dispute for this booking', 403));
  }

  // Check if booking is in valid state for dispute
  const validStatuses = [
    BOOKING_STATUS.AWAITING_OWNER_CONFIRMATION,
    BOOKING_STATUS.COMPLETED
  ];

  if (!validStatuses.includes(booking.status)) {
    return next(new AppError('Disputes can only be raised after booking completion', 400));
  }

  // Check if dispute already exists for this booking
  const existingDispute = await Dispute.findOne({ bookingId });
  if (existingDispute) {
    return next(new AppError('A dispute already exists for this booking', 400));
  }

  // Determine who the dispute is against
  const raisedAgainst = isFarmer ? booking.ownerId : booking.farmerId;

  // Create dispute
  const dispute = await Dispute.create({
    bookingId,
    raisedBy: req.user._id,
    raisedAgainst,
    disputeType,
    reason,
    description,
    evidenceImages: evidenceImages || [],
    status: DISPUTE_STATUS.OPEN
  });

  // Populate for response
  await dispute.populate([
    { path: 'bookingId', select: 'bookingType pricing status' },
    { path: 'raisedBy', select: 'name email phone role' },
    { path: 'raisedAgainst', select: 'name email phone role' }
  ]);

  sendSuccess(res, 201, 'Dispute raised successfully', { dispute });
};

/**
 * Get my disputes
 * @route GET /api/disputes/my
 * @access Private
 */
const getMyDisputes = async (req, res) => {
  const { status } = req.query;

  const filter = {
    $or: [
      { raisedBy: req.user._id },
      { raisedAgainst: req.user._id }
    ]
  };

  if (status) filter.status = status;

  const disputes = await Dispute.find(filter)
    .populate('bookingId', 'bookingType pricing status')
    .populate('raisedBy', 'name email role')
    .populate('raisedAgainst', 'name email role')
    .populate('adminDecision.reviewedBy', 'name email')
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, 'My disputes fetched successfully', {
    count: disputes.length,
    disputes
  });
};

/**
 * Get dispute by ID
 * @route GET /api/disputes/:id
 * @access Private
 */
const getDisputeById = async (req, res, next) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate('bookingId', 'bookingType pricing status requestedStartTime requestedEndTime')
    .populate('raisedBy', 'name email phone role')
    .populate('raisedAgainst', 'name email phone role')
    .populate('adminDecision.reviewedBy', 'name email');

  if (!dispute) {
    return next(new AppError('Dispute not found', 404));
  }

  // Check authorization
  const isAuthorized = 
    dispute.raisedBy._id.equals(req.user._id) ||
    dispute.raisedAgainst._id.equals(req.user._id) ||
    req.user.role === 'ADMIN';

  if (!isAuthorized) {
    return next(new AppError('You are not authorized to view this dispute', 403));
  }

  sendSuccess(res, 200, 'Dispute details fetched successfully', { dispute });
};

/**
 * Admin resolve dispute
 * @route PATCH /api/disputes/:id/admin-action
 * @access Private/Admin
 */


const adminResolveDispute = async (req, res, next) => {
  const { action, remarks, refundAmount } = req.body;

  // Validate required fields
  if (!action || !remarks) {
    return next(new AppError('Action and remarks are required', 400));
  }

  // Validate action
  const validActions = ['REFUND', 'EXTRA_CHARGE', 'WARNING', 'NO_ACTION'];
  if (!validActions.includes(action)) {
    return next(new AppError('Invalid action type', 400));
  }

  // Validate refund amount if action is REFUND
  if (action === 'REFUND' && (!refundAmount || refundAmount <= 0)) {
    return next(new AppError('Valid refund amount is required for REFUND action', 400));
  }

  const dispute = await Dispute.findById(req.params.id);

  if (!dispute) {
    return next(new AppError('Dispute not found', 404));
  }

  // Check if already resolved
  if (dispute.status === DISPUTE_STATUS.RESOLVED) {
    return next(new AppError('Dispute is already resolved', 400));
  }

  // Update dispute status and admin decision
  if (action === 'REFUND') {
    dispute.status = DISPUTE_STATUS.REFUND_PENDING;
  } else {
    dispute.status = DISPUTE_STATUS.RESOLVED;
  }

  dispute.adminDecision = {
    reviewedBy: req.user._id,
    action,
    remarks,
    refundAmount: action === 'REFUND' ? refundAmount : undefined,
    decidedAt: new Date()
  };

  await dispute.save();

  await dispute.populate([
    { path: 'bookingId', select: 'bookingType pricing' },
    { path: 'raisedBy', select: 'name email' },
    { path: 'raisedAgainst', select: 'name email' },
    { path: 'adminDecision.reviewedBy', select: 'name email' }
  ]);

  sendSuccess(res, 200, 'Dispute updated successfully', { dispute });
};

/**
 * Get all disputes (Admin)
 * @route GET /api/disputes/admin/all
 * @access Private/Admin
 */
const getAllDisputes = async (req, res) => {
  const { status } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const disputes = await Dispute.find(filter)
    .populate('bookingId', 'bookingType pricing status')
    .populate('raisedBy', 'name email phone role')
    .populate('raisedAgainst', 'name email phone role')
    .populate('adminDecision.reviewedBy', 'name email')
    .sort({ createdAt: -1 });

  // Group by status for admin dashboard
  const summary = {
    total: disputes.length,
    open: disputes.filter(d => d.status === DISPUTE_STATUS.OPEN).length,
    underReview: disputes.filter(d => d.status === DISPUTE_STATUS.UNDER_REVIEW).length,
    resolved: disputes.filter(d => d.status === DISPUTE_STATUS.RESOLVED).length
  };

  sendSuccess(res, 200, 'All disputes fetched successfully', {
    summary,
    disputes
  });
};

/**
 * Update dispute status to under review (Admin)
 * @route PATCH /api/disputes/:id/under-review
 * @access Private/Admin
 */
const markUnderReview = async (req, res, next) => {
  const dispute = await Dispute.findById(req.params.id);

  if (!dispute) {
    return next(new AppError('Dispute not found', 404));
  }

  if (dispute.status !== DISPUTE_STATUS.OPEN) {
    return next(new AppError('Only open disputes can be marked under review', 400));
  }

  dispute.status = DISPUTE_STATUS.UNDER_REVIEW;
  await dispute.save();

  sendSuccess(res, 200, 'Dispute marked as under review', { dispute });
};

/**
 * Create refund payment order (Owner)
 * @route POST /api/disputes/:id/refund-order
 * @access Private/Owner
 */
const createDisputeRefundOrder = async (req, res, next) => {
  const dispute = await Dispute.findById(req.params.id);

  if (!dispute) {
    return next(new AppError('Dispute not found', 404));
  }

  // Check if user is the one who needs to pay (raisedAgainst)
  // Assuming Owner is raisedAgainst in a Farmer raised dispute, or similar logic.
  // Actually simplest is checking if req.user._id equals raisedAgainst.
  // For now, let's assume the person paying is the one the dispute was raised against (the Owner).
  if (!dispute.raisedAgainst.equals(req.user._id)) {
     return next(new AppError('You are not authorized to pay this refund', 403));
  }

  if (dispute.status !== DISPUTE_STATUS.REFUND_PENDING) {
    return next(new AppError('This dispute is not pending a refund payment', 400));
  }

  const refundAmount = dispute.adminDecision?.refundAmount;
  if (!refundAmount || refundAmount <= 0) {
      return next(new AppError('Invalid refund amount', 400));
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: Math.round(refundAmount * 100), // amount in paise
      currency: "INR",
      receipt: `dispute_refund_${dispute._id}`,
      notes: {
        disputeId: dispute._id.toString(),
        type: 'DISPUTE_REFUND'
      }
    };

    const order = await razorpay.orders.create(options);

    sendSuccess(res, 200, 'Refund order created', {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        disputeId: dispute._id
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return next(new AppError('Failed to create refund payment order', 500));
  }
};

/**
 * Verify refund payment (Owner)
 * @route POST /api/disputes/:id/verify-refund
 * @access Private/Owner
 */
const verifyDisputeRefund = async (req, res, next) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const dispute = await Dispute.findById(req.params.id);

   if (!dispute) {
    return next(new AppError('Dispute not found', 404));
  }

  const crypto = require('crypto');
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpaySignature) {
      // Payment successful
      dispute.status = DISPUTE_STATUS.RESOLVED;
      dispute.adminDecision.refundDetails = {
          refundId: razorpayPaymentId, // Using payment ID as refund ref
          amount: dispute.adminDecision.refundAmount,
          paidAt: new Date(),
          status: 'PAID_BY_OWNER'
      };
      await dispute.save();
      
      sendSuccess(res, 200, 'Refund payment verified. Dispute resolved.', { dispute });
  } else {
      return next(new AppError('Invalid signature', 400));
  }
};

module.exports = {
  raiseDispute,
  getMyDisputes,
  getDisputeById,
  adminResolveDispute,
  getAllDisputes,
  markUnderReview,
  createDisputeRefundOrder,
  verifyDisputeRefund
};
