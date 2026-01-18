const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../config/constants');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required'],
    unique: true
  },
  
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required']
  },
  
  razorpayOrderId: {
    type: String,
    required: [true, 'Razorpay order ID is required']
  },
  
  razorpayPaymentId: {
    type: String
  },
  
  razorpaySignature: {
    type: String
  },
  
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR']
  },
  
  status: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  
  paidAt: {
    type: Date
  },
  
  failureReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for performance
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ farmerId: 1, createdAt: -1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ status: 1 });

// Update paidAt timestamp when status changes to SUCCESS
paymentSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === PAYMENT_STATUS.SUCCESS && !this.paidAt) {
    this.paidAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
