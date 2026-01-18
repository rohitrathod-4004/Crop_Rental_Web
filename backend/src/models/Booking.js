const mongoose = require('mongoose');
const { BOOKING_STATUS, BOOKING_TYPES, PAYMENT_STATUS } = require('../config/constants');

const bookingSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required']
  },
  
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: [true, 'Equipment ID is required']
  },
  
  bookingType: {
    type: String,
    enum: Object.values(BOOKING_TYPES),
    required: [true, 'Booking type is required']
  },
  
  // User-visible times
  requestedStartTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  
  requestedEndTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  
  // System-blocked time (includes buffer for SERVICE type)
  blockedStartTime: {
    type: Date,
    required: [true, 'Blocked start time is required']
  },
  
  blockedEndTime: {
    type: Date,
    required: [true, 'Blocked end time is required']
  },
  
  pricing: {
    baseAmount: {
      type: Number,
      required: [true, 'Base amount is required'],
      min: [0, 'Base amount cannot be negative']
    },
    travelCost: {
      type: Number,
      default: 0,
      min: [0, 'Travel cost cannot be negative']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    }
  },
  
  status: {
    type: String,
    enum: Object.values(BOOKING_STATUS),
    default: BOOKING_STATUS.PENDING
  },
  
  paymentStatus: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  
  // Timestamps for status changes
  confirmedAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String }
}, {
  timestamps: true
});

// Indexes for performance and conflict detection
bookingSchema.index({ equipmentId: 1, blockedStartTime: 1, blockedEndTime: 1 });
bookingSchema.index({ farmerId: 1, createdAt: -1 });
bookingSchema.index({ ownerId: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Validation: End time must be after start time
bookingSchema.pre('save', function(next) {
  if (this.requestedEndTime <= this.requestedStartTime) {
    return next(new Error('End time must be after start time'));
  }
  
  if (this.blockedEndTime <= this.blockedStartTime) {
    return next(new Error('Blocked end time must be after blocked start time'));
  }
  
  next();
});

// Method to check if booking overlaps with another booking
bookingSchema.statics.checkOverlap = async function(equipmentId, startTime, endTime, excludeBookingId = null) {
  const query = {
    equipmentId,
    status: { $nin: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED] },
    $or: [
      // New booking starts during existing booking
      {
        blockedStartTime: { $lte: startTime },
        blockedEndTime: { $gt: startTime }
      },
      // New booking ends during existing booking
      {
        blockedStartTime: { $lt: endTime },
        blockedEndTime: { $gte: endTime }
      },
      // New booking completely contains existing booking
      {
        blockedStartTime: { $gte: startTime },
        blockedEndTime: { $lte: endTime }
      }
    ]
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  const overlappingBooking = await this.findOne(query);
  return !!overlappingBooking;
};

module.exports = mongoose.model('Booking', bookingSchema);
