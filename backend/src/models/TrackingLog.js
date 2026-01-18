const mongoose = require('mongoose');
const { TRACKING_EVENTS } = require('../config/constants');

const trackingLogSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required']
  },
  
  eventType: {
    type: String,
    enum: Object.values(TRACKING_EVENTS),
    required: [true, 'Event type is required']
  },
  
  imageUrl: {
    type: String,
    required: [true, 'Image proof is required']
  },
  
  location: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required']
    }
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for performance
trackingLogSchema.index({ bookingId: 1, eventType: 1 });
trackingLogSchema.index({ timestamp: -1 });

// Prevent duplicate event types for same booking
trackingLogSchema.index(
  { bookingId: 1, eventType: 1 }, 
  { unique: true, partialFilterExpression: { eventType: { $in: ['CHECK_IN', 'CHECK_OUT'] } } }
);

module.exports = mongoose.model('TrackingLog', trackingLogSchema);
