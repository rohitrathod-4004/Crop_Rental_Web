// Export all models from a single file for easy imports
const User = require('./User');
const Equipment = require('./Equipment');
const Booking = require('./Booking');
const TrackingLog = require('./TrackingLog');
const MeterReading = require('./MeterReading');
const Payment = require('./Payment');
const Dispute = require('./Dispute');
const Review = require('./Review');

module.exports = {
  User,
  Equipment,
  Booking,
  TrackingLog,
  MeterReading,
  Payment,
  Dispute,
  Review
};
