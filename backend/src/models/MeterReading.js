const mongoose = require('mongoose');
const { METER_READING_TYPES } = require('../config/constants');

const meterReadingSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required']
  },
  
  readingType: {
    type: String,
    enum: Object.values(METER_READING_TYPES),
    required: [true, 'Reading type is required']
  },
  
  readingValue: {
    type: Number,
    required: [true, 'Meter reading value is required'],
    min: [0, 'Reading value cannot be negative']
  },
  
  imageUrl: {
    type: String,
    required: [true, 'Image proof of meter reading is required']
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for performance
meterReadingSchema.index({ bookingId: 1, readingType: 1 });
meterReadingSchema.index({ timestamp: -1 });

// Validation: Check-out reading should be greater than check-in reading
meterReadingSchema.pre('save', async function(next) {
  if (this.readingType === METER_READING_TYPES.CHECK_OUT) {
    const checkInReading = await this.constructor.findOne({
      bookingId: this.bookingId,
      readingType: METER_READING_TYPES.CHECK_IN
    });
    
    if (checkInReading && this.readingValue < checkInReading.readingValue) {
      return next(new Error('Check-out reading must be greater than or equal to check-in reading'));
    }
  }
  
  next();
});

module.exports = mongoose.model('MeterReading', meterReadingSchema);
