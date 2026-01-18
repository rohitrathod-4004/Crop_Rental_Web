const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const { sendSuccess } = require('../utils/responseUtils');
const AppError = require('../utils/AppError');
const { BOOKING_STATUS, BOOKING_TYPES, VERIFICATION_STATUS, PAYMENT_STATUS } = require('../config/constants');

/**
 * Create new booking (Rental or Service)
 * @route POST /api/bookings
 * @access Private/Farmer
 */
const createBooking = async (req, res, next) => {
  const {
    equipmentId,
    bookingType,
    requestedStartTime,
    requestedEndTime
  } = req.body;

  // Validate required fields
  if (!equipmentId || !bookingType || !requestedStartTime || !requestedEndTime) {
    return next(new AppError('Missing required booking details', 400));
  }

  // Validate booking type
  if (!Object.values(BOOKING_TYPES).includes(bookingType)) {
    return next(new AppError('Invalid booking type', 400));
  }

  // Validate times
  const startTime = new Date(requestedStartTime);
  const endTime = new Date(requestedEndTime);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return next(new AppError('Invalid date format', 400));
  }

  if (endTime <= startTime) {
    return next(new AppError('End time must be after start time', 400));
  }

  // Check if booking is in the future
  if (startTime < new Date()) {
    return next(new AppError('Booking must be in the future', 400));
  }

  // Get equipment with owner details
  const equipment = await Equipment.findById(equipmentId).populate('ownerId');

  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  if (!equipment.isActive) {
    return next(new AppError('Equipment is not available', 400));
  }

  // Check if owner is approved
  if (equipment.ownerId.ownerProfile?.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
    return next(new AppError('Equipment owner is not verified', 403));
  }

  // Calculate blocked times
  let blockedStartTime = new Date(startTime);
  let blockedEndTime = new Date(endTime);

  // Add buffer for SERVICE bookings
  if (bookingType === BOOKING_TYPES.SERVICE) {
    const BUFFER_MINUTES = 60; // 1 hour buffer for travel/setup
    blockedEndTime = new Date(blockedEndTime.getTime() + BUFFER_MINUTES * 60000);
  }

  // Check for overlapping bookings
  const hasOverlap = await Booking.checkOverlap(
    equipmentId,
    blockedStartTime,
    blockedEndTime
  );

  if (hasOverlap) {
    return next(new AppError('Selected time slot is not available', 409));
  }

  // Calculate pricing
  const durationHours = (endTime - startTime) / (1000 * 60 * 60);
  const baseAmount = durationHours * equipment.pricing.hourlyRate;
  const travelCost = bookingType === BOOKING_TYPES.SERVICE ? 200 : 0; // Fixed travel cost for MVP
  const totalAmount = baseAmount + travelCost;

  // Create booking
  const booking = await Booking.create({
    farmerId: req.user._id,
    ownerId: equipment.ownerId._id,
    equipmentId,
    bookingType,
    requestedStartTime: startTime,
    requestedEndTime: endTime,
    blockedStartTime,
    blockedEndTime,
    pricing: {
      baseAmount,
      travelCost,
      totalAmount
    },
    status: BOOKING_STATUS.PENDING,
    paymentStatus: 'PENDING'
  });

  // Populate for response
  await booking.populate([
    { path: 'equipmentId', select: 'name type pricing' },
    { path: 'ownerId', select: 'name phone email' }
  ]);

  sendSuccess(res, 201, 'Booking created successfully', { booking });
};

/**
 * Get farmer's bookings
 * @route GET /api/bookings/farmer
 * @access Private/Farmer
 */
const getFarmerBookings = async (req, res) => {
  const { status } = req.query;

  const filter = { farmerId: req.user._id };
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate('equipmentId', 'name type pricing images')
    .populate('ownerId', 'name phone email')
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, 'Farmer bookings fetched successfully', {
    count: bookings.length,
    bookings
  });
};

/**
 * Get owner's bookings
 * @route GET /api/bookings/owner
 * @access Private/Owner (Approved)
 */
const getOwnerBookings = async (req, res) => {
  const { status } = req.query;

  const filter = { ownerId: req.user._id };
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate('equipmentId', 'name type')
    .populate('farmerId', 'name phone email')
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, 'Owner bookings fetched successfully', {
    count: bookings.length,
    bookings
  });
};

/**
 * Get booking by ID
 * @route GET /api/bookings/:id
 * @access Private
 */
const getBookingById = async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('equipmentId', 'name type pricing images location')
    .populate('farmerId', 'name phone email')
    .populate('ownerId', 'name phone email');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if user is authorized to view this booking
  const isAuthorized = 
    booking.farmerId._id.equals(req.user._id) ||
    booking.ownerId._id.equals(req.user._id) ||
    req.user.role === 'ADMIN';

  if (!isAuthorized) {
    return next(new AppError('You are not authorized to view this booking', 403));
  }

  sendSuccess(res, 200, 'Booking details fetched successfully', { booking });
};

/**
 * Confirm booking (Owner)
 * @route PATCH /api/bookings/:id/confirm
 * @access Private/Owner (Approved)
 */
const confirmBooking = async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check ownership
  if (!booking.ownerId.equals(req.user._id)) {
    return next(new AppError('You are not authorized to confirm this booking', 403));
  }

  // Check status
  if (booking.status !== BOOKING_STATUS.PENDING) {
    return next(new AppError('Only pending bookings can be confirmed', 400));
  }

  // Update status
  booking.status = BOOKING_STATUS.AWAITING_PAYMENT;
  booking.confirmedAt = new Date();
  await booking.save();

  await booking.populate([
    { path: 'equipmentId', select: 'name type' },
    { path: 'farmerId', select: 'name phone email' }
  ]);

  sendSuccess(res, 200, 'Booking approved. Awaiting payment from farmer.', { booking });
};

/**
 * Start booking (Farmer)
 * @route PATCH /api/bookings/:id/start
 * @access Private/Farmer
 */
const startBooking = async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if farmer owns this booking
  if (!booking.farmerId.equals(req.user._id)) {
    return next(new AppError('You are not authorized to start this booking', 403));
  }

  // Check status
  if (booking.status !== BOOKING_STATUS.CONFIRMED) {
    return next(new AppError('Only confirmed bookings can be started', 400));
  }

  // Update status
  booking.status = BOOKING_STATUS.IN_PROGRESS;
  booking.startedAt = new Date();
  await booking.save();

  sendSuccess(res, 200, 'Booking started successfully', { booking });
};

/**
 * Complete booking (Farmer)
 * @route PATCH /api/bookings/:id/complete
 * @access Private/Farmer
 */
const completeBooking = async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if farmer owns this booking
  if (!booking.farmerId.equals(req.user._id)) {
    return next(new AppError('You are not authorized to complete this booking', 403));
  }

  // Check status
  if (booking.status !== BOOKING_STATUS.IN_PROGRESS) {
    return next(new AppError('Only in-progress bookings can be completed', 400));
  }

  // Update status
  booking.status = BOOKING_STATUS.AWAITING_OWNER_CONFIRMATION;
  booking.completedAt = new Date();
  await booking.save();

  sendSuccess(res, 200, 'Booking completed. Awaiting owner confirmation', { booking });
};

/**
 * Owner confirms completion
 * @route PATCH /api/bookings/:id/owner-confirm
 * @access Private/Owner (Approved)
 */
const ownerConfirmCompletion = async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check ownership
  if (!booking.ownerId.equals(req.user._id)) {
    return next(new AppError('You are not authorized to confirm this booking', 403));
  }

  // Check status
  if (booking.status !== BOOKING_STATUS.AWAITING_OWNER_CONFIRMATION) {
    return next(new AppError('Booking is not awaiting confirmation', 400));
  }

  // Update status
  booking.status = BOOKING_STATUS.COMPLETED;
  booking.ownerConfirmedAt = new Date();
  await booking.save();

  sendSuccess(res, 200, 'Booking completed successfully', { booking });
};

/**
 * Cancel booking
 * @route PATCH /api/bookings/:id/cancel
 * @access Private/Farmer
 */
const cancelBooking = async (req, res, next) => {
  const { cancellationReason } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if farmer owns this booking
  if (!booking.farmerId.equals(req.user._id)) {
    return next(new AppError('You are not authorized to cancel this booking', 403));
  }

  // Check if booking can be cancelled
  if (![BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(booking.status)) {
    return next(new AppError('Booking cannot be cancelled at this stage', 400));
  }

  // Update status
  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancelledAt = new Date();
  booking.cancellationReason = cancellationReason || 'Cancelled by farmer';
  await booking.save();

  sendSuccess(res, 200, 'Booking cancelled successfully', { booking });
};

/**
 * Get available slots for equipment (helper for frontend)
 * @route GET /api/bookings/equipment/:equipmentId/available-slots
 * @access Public
 */
const getAvailableSlots = async (req, res, next) => {
  const { equipmentId } = req.params;
  const { date } = req.query;

  if (!date) {
    return next(new AppError('Date is required', 400));
  }

  const equipment = await Equipment.findById(equipmentId);

  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  // Get all bookings for this equipment on the specified date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await Booking.find({
    equipmentId,
    status: { $nin: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED] },
    blockedStartTime: { $lte: endOfDay },
    blockedEndTime: { $gte: startOfDay }
  }).select('blockedStartTime blockedEndTime');

  sendSuccess(res, 200, 'Available slots fetched successfully', {
    equipment: {
      slotDurationHours: equipment.availability.slotDurationHours,
      workingHours: equipment.availability.workingHours
    },
    bookedSlots: bookings.map(b => ({
      start: b.blockedStartTime,
      end: b.blockedEndTime
    }))
  });
};

/**
 * Get farmer dashboard statistics
 * @route GET /api/bookings/farmer/stats
 * @access Private/Farmer
 */
const getFarmerStats = async (req, res) => {
  const farmerId = req.user._id;

  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    totalSpent
  ] = await Promise.all([
    Booking.countDocuments({ farmerId }),
    Booking.countDocuments({ farmerId, status: BOOKING_STATUS.PENDING }),
    Booking.countDocuments({ farmerId, status: BOOKING_STATUS.CONFIRMED }),
    Booking.countDocuments({ farmerId, status: BOOKING_STATUS.COMPLETED }),
    Booking.countDocuments({ farmerId, status: BOOKING_STATUS.CANCELLED }),
    Booking.aggregate([
      { 
        $match: { 
          farmerId: farmerId,
          paymentStatus: PAYMENT_STATUS.SUCCESS
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$pricing.totalAmount' } 
        } 
      }
    ])
  ]);

  const stats = {
    bookings: {
      total: totalBookings,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      completed: completedBookings,
      cancelled: cancelledBookings
    },
    totalSpent: totalSpent[0]?.total || 0
  };

  sendSuccess(res, 200, 'Farmer statistics fetched successfully', { stats });
};

/**
 * Get owner dashboard statistics
 * @route GET /api/bookings/owner/stats
 * @access Private/Owner (Approved)
 */
const getOwnerStats = async (req, res) => {
  const ownerId = req.user._id;

  // Get equipment count
  const Equipment = require('../models/Equipment');
  
  const [
    totalEquipment,
    activeEquipment,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    totalEarnings
  ] = await Promise.all([
    Equipment.countDocuments({ ownerId }),
    Equipment.countDocuments({ ownerId, isActive: true }),
    Booking.countDocuments({ ownerId }),
    Booking.countDocuments({ ownerId, status: BOOKING_STATUS.PENDING }),
    Booking.countDocuments({ ownerId, status: BOOKING_STATUS.CONFIRMED }),
    Booking.countDocuments({ ownerId, status: BOOKING_STATUS.COMPLETED }),
    Booking.aggregate([
      { 
        $match: { 
          ownerId: ownerId,
          paymentStatus: PAYMENT_STATUS.SUCCESS
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$pricing.totalAmount' } 
        } 
      }
    ])
  ]);

  const stats = {
    equipment: {
      total: totalEquipment,
      active: activeEquipment
    },
    bookings: {
      total: totalBookings,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      completed: completedBookings
    },
    totalEarnings: totalEarnings[0]?.total || 0
  };

  sendSuccess(res, 200, 'Owner statistics fetched successfully', { stats });
};

module.exports = {
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
};
