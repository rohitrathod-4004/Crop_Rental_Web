const Equipment = require('../models/Equipment');
const User = require('../models/User');
const { sendSuccess } = require('../utils/responseUtils');
const AppError = require('../utils/AppError');
const { VERIFICATION_STATUS } = require('../config/constants');

/**
 * Create new equipment
 * @route POST /api/equipment
 * @access Private/Owner (Approved)
 */
const createEquipment = async (req, res, next) => {
  const {
    name,
    type,
    description,
    pricing,
    location,
    availability,
    images
  } = req.body;

  // Validate required fields
  if (!name || !type || !description || !pricing || !location) {
    return next(new AppError('Missing required fields', 400));
  }

  // Validate pricing
  if (!pricing.hourlyRate) {
    return next(new AppError('Hourly rate is required', 400));
  }

  // Validate location
  if (!location.lat || !location.lng || !location.address) {
    return next(new AppError('Complete location (lat, lng, address) is required', 400));
  }

  // Create equipment
  const equipment = await Equipment.create({
    ownerId: req.user._id,
    name,
    type,
    description,
    pricing,
    location,
    availability: availability || {},
    images: images || []
  });

  sendSuccess(res, 201, 'Equipment added successfully', { equipment });
};

/**
 * Get owner's equipment
 * @route GET /api/equipment/owner
 * @access Private/Owner
 */
const getOwnerEquipment = async (req, res) => {
  const equipment = await Equipment.find({
    ownerId: req.user._id
  }).sort({ createdAt: -1 });

  sendSuccess(res, 200, 'Owner equipment fetched successfully', {
    count: equipment.length,
    equipment
  });
};

/**
 * Get equipment by ID (Public)
 * @route GET /api/equipment/:id
 * @access Public
 */
const getEquipmentById = async (req, res, next) => {
  const equipment = await Equipment.findById(req.params.id)
    .populate('ownerId', 'name phone email ownerProfile');

  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  // Check if equipment is active
  if (!equipment.isActive) {
    return next(new AppError('Equipment is not available', 404));
  }

  // NOTE: Temporarily disabled for demo - in production, uncomment this
  // Check if owner is approved
  // const owner = await User.findById(equipment.ownerId);
  // if (!owner || owner.ownerProfile?.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
  //   return next(new AppError('Equipment is not available', 404));
  // }

  sendSuccess(res, 200, 'Equipment details fetched successfully', { equipment });
};

/**
 * Update equipment
 * @route PUT /api/equipment/:id
 * @access Private/Owner (Approved)
 */
const updateEquipment = async (req, res, next) => {
  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  // Check ownership
  if (!equipment.ownerId.equals(req.user._id)) {
    return next(new AppError('You do not own this equipment', 403));
  }

  // Update allowed fields
  const allowedUpdates = [
    'name',
    'type',
    'description',
    'pricing',
    'location',
    'availability',
    'images'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      equipment[field] = req.body[field];
    }
  });

  await equipment.save();

  sendSuccess(res, 200, 'Equipment updated successfully', { equipment });
};

/**
 * Toggle equipment status (activate/deactivate)
 * @route PATCH /api/equipment/:id/toggle-status
 * @access Private/Owner (Approved)
 */
const toggleEquipmentStatus = async (req, res, next) => {
  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  // Check ownership
  if (!equipment.ownerId.equals(req.user._id)) {
    return next(new AppError('You do not own this equipment', 403));
  }

  equipment.isActive = !equipment.isActive;
  await equipment.save();

  const status = equipment.isActive ? 'activated' : 'deactivated';
  sendSuccess(res, 200, `Equipment ${status} successfully`, { equipment });
};

/**
 * Delete equipment
 * @route DELETE /api/equipment/:id
 * @access Private/Owner (Approved)
 */
const deleteEquipment = async (req, res, next) => {
  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  // Check ownership
  if (!equipment.ownerId.equals(req.user._id)) {
    return next(new AppError('You do not own this equipment', 403));
  }

  // Check if equipment has active bookings
  // TODO: Add booking check when booking module is implemented

  await equipment.deleteOne();

  sendSuccess(res, 200, 'Equipment deleted successfully', null);
};

/**
 * List equipment (Discovery/Search)
 * @route GET /api/equipment
 * @access Public
 */
const listEquipment = async (req, res) => {
  const {
    type,
    minPrice,
    maxPrice,
    lat,
    lng,
    radius,
    search,
    page = 1,
    limit = 10
  } = req.query;

  // Build query
  const query = { isActive: true };

  // Filter by type
  if (type) {
    query.type = type;
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query['pricing.hourlyRate'] = {};
    if (minPrice) query['pricing.hourlyRate'].$gte = Number(minPrice);
    if (maxPrice) query['pricing.hourlyRate'].$lte = Number(maxPrice);
  }

  // Search by name or description
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Location-based search (basic implementation)
  // TODO: Implement proper geospatial queries with MongoDB
  if (lat && lng && radius) {
    // For now, we'll fetch all and filter in memory
    // In production, use MongoDB geospatial queries
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Get only equipment from approved owners
  const approvedOwners = await User.find({
    role: 'OWNER',
    'ownerProfile.verificationStatus': VERIFICATION_STATUS.APPROVED
  }).select('_id');

  const approvedOwnerIds = approvedOwners.map(owner => owner._id);
  query.ownerId = { $in: approvedOwnerIds };

  const [equipment, total] = await Promise.all([
    Equipment.find(query)
      .populate('ownerId', 'name phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Equipment.countDocuments(query)
  ]);

  sendSuccess(res, 200, 'Equipment list fetched successfully', {
    equipment,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  });
};

/**
 * Get equipment types (for filters)
 * @route GET /api/equipment/types
 * @access Public
 */
const getEquipmentTypes = async (req, res) => {
  const types = [
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
  ];

  sendSuccess(res, 200, 'Equipment types fetched successfully', { types });
};

module.exports = {
  createEquipment,
  getOwnerEquipment,
  getEquipmentById,
  updateEquipment,
  toggleEquipmentStatus,
  deleteEquipment,
  listEquipment,
  getEquipmentTypes
};
