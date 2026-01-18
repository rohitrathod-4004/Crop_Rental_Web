// Mock booking data for UI demonstration
export const mockBookings = [
  {
    _id: 'B001',
    equipmentId: '1',
    equipmentName: 'John Deere 5075E Tractor',
    equipmentType: 'TRACTOR',
    equipmentImage: 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Tractor',
    bookingType: 'RENTAL',
    requestedStartTime: '2026-01-20T08:00:00',
    requestedEndTime: '2026-01-20T16:00:00',
    status: 'CONFIRMED',
    pricing: {
      baseAmount: 4000,
      travelCost: 0,
      totalAmount: 4000
    },
    ownerName: 'Ramesh Patil',
    ownerPhone: '9876543210',
    location: 'Pune, Maharashtra',
    paymentStatus: 'PAID',
    createdAt: '2026-01-15T10:30:00'
  },
  {
    _id: 'B002',
    equipmentId: '3',
    equipmentName: 'Combine Harvester',
    equipmentType: 'HARVESTER',
    equipmentImage: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Harvester',
    bookingType: 'SERVICE',
    requestedStartTime: '2026-01-22T06:00:00',
    requestedEndTime: '2026-01-22T14:00:00',
    status: 'PENDING',
    pricing: {
      baseAmount: 6400,
      travelCost: 200,
      totalAmount: 6600
    },
    ownerName: 'Prakash Deshmukh',
    ownerPhone: '9876543212',
    location: 'Solapur, Maharashtra',
    paymentStatus: 'PENDING',
    createdAt: '2026-01-16T14:20:00'
  },
  {
    _id: 'B003',
    equipmentId: '2',
    equipmentName: 'Mahindra 575 DI Tractor',
    equipmentType: 'TRACTOR',
    equipmentImage: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Tractor',
    bookingType: 'RENTAL',
    requestedStartTime: '2026-01-10T07:00:00',
    requestedEndTime: '2026-01-10T19:00:00',
    status: 'COMPLETED',
    pricing: {
      baseAmount: 4800,
      travelCost: 0,
      totalAmount: 4800
    },
    ownerName: 'Suresh Kumar',
    ownerPhone: '9876543211',
    location: 'Nashik, Maharashtra',
    paymentStatus: 'PAID',
    createdAt: '2026-01-08T09:15:00'
  }
];

// Booking status configurations
export const bookingStatusConfig = {
  PENDING: {
    label: 'Pending',
    color: 'yellow',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-800',
    icon: '⏳'
  },
  AWAITING_PAYMENT: {
    label: 'Awaiting Payment',
    color: 'orange',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-800',
    icon: '💳'
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-800',
    icon: '✓'
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'purple',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-800',
    icon: '🔄'
  },
  COMPLETED: {
    label: 'Completed',
    color: 'green',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800',
    icon: '✅'
  },
  AWAITING_OWNER_CONFIRMATION: {
    label: 'Awaiting Owner Confirmation',
    color: 'teal',
    bgClass: 'bg-teal-100',
    textClass: 'text-teal-800',
    icon: '📝'
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'red',
    bgClass: 'bg-red-100',
    textClass: 'text-red-800',
    icon: '❌'
  }
};

// Equipment types for filtering
export const equipmentTypes = [
  'ALL',
  'TRACTOR',
  'HARVESTER',
  'PLOUGH',
  'SEEDER',
  'SPRAYER',
  'THRESHER',
  'OTHER'
];

