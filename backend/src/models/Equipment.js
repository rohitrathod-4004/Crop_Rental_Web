const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  type: {
    type: String,
    required: [true, 'Equipment type is required'],
    enum: [
      'Tractor',
      'Harvester',
      'Plough',
      'Seeder',
      'Sprayer',
      'Thresher',
      'Cultivator',
      'Rotavator',
      'Water Pump',
      'Trailer',
      'Other'
    ]
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  images: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: 'Maximum 5 images allowed'
    }
  },
  
  pricing: {
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: [50, 'Hourly rate must be at least ₹50'],
      max: [10000, 'Hourly rate cannot exceed ₹10,000']
    },
    dailyRate: {
      type: Number,
      min: [500, 'Daily rate must be at least ₹500'],
      max: [50000, 'Daily rate cannot exceed ₹50,000']
    }
  },
  
  location: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    }
  },
  
  availability: {
    slotDurationHours: {
      type: Number,
      default: 2,
      min: [1, 'Slot duration must be at least 1 hour'],
      max: [24, 'Slot duration cannot exceed 24 hours']
    },
    workingHours: {
      start: {
        type: String,
        default: '09:00',
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)']
      },
      end: {
        type: String,
        default: '18:00',
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)']
      }
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
equipmentSchema.index({ ownerId: 1 });
equipmentSchema.index({ type: 1 });
equipmentSchema.index({ isActive: 1 });
equipmentSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// Virtual for total bookings count
equipmentSchema.virtual('totalBookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'equipmentId',
  count: true
});

module.exports = mongoose.model('Equipment', equipmentSchema);
