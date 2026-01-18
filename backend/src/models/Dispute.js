const mongoose = require('mongoose');
const { DISPUTE_STATUS, DISPUTE_TYPES, RESOLUTION_ACTIONS } = require('../config/constants');

const disputeSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required']
  },
  
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Raised by user ID is required']
  },
  
  raisedAgainst: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Raised against user ID is required']
  },
  
  disputeType: {
    type: String,
    enum: Object.values(DISPUTE_TYPES),
    required: [true, 'Dispute type is required']
  },
  
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    maxlength: [200, 'Reason cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  evidenceImages: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: 'Maximum 5 evidence images allowed'
    }
  },
  
  status: {
    type: String,
    enum: Object.values(DISPUTE_STATUS),
    default: DISPUTE_STATUS.OPEN
  },
  
  adminDecision: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      enum: Object.values(RESOLUTION_ACTIONS)
    },
    remarks: {
      type: String,
      maxlength: [500, 'Remarks cannot exceed 500 characters']
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    },
    decidedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
disputeSchema.index({ raisedBy: 1, createdAt: -1 });
disputeSchema.index({ raisedAgainst: 1, createdAt: -1 });
disputeSchema.index({ status: 1 });

// Update decidedAt timestamp when admin makes a decision
disputeSchema.pre('save', function(next) {
  if (this.isModified('adminDecision.action') && !this.adminDecision.decidedAt) {
    this.adminDecision.decidedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Dispute', disputeSchema);
