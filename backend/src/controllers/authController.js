const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');
const { sendSuccess } = require('../utils/responseUtils');
const AppError = require('../utils/AppError');

/**
 * Register new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  const { name, email, phone, password, role, location } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !password || !role) {
    return next(new AppError('All fields are required', 400));
  }

  // Validate role
  const validRoles = ['FARMER', 'OWNER', 'ADMIN'];
  if (!validRoles.includes(role)) {
    return next(new AppError('Invalid role', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    return next(new AppError('User with this email or phone already exists', 409));
  }

  // Prepare user data
  const userData = {
    name,
    email,
    phone,
    passwordHash: password, // Will be hashed by model pre-save hook
    role
  };

  // Add role-specific profile data
  if (role === 'FARMER' && location) {
    userData.farmerProfile = { location };
  }

  if (role === 'OWNER') {
    userData.ownerProfile = {
      verificationStatus: 'PENDING_VERIFICATION'
    };
  }

  // Create user
  const user = await User.create(userData);

  // Generate JWT token
  const token = generateToken({
    userId: user._id,
    role: user.role
  });

  sendSuccess(res, 201, 'User registered successfully', {
    token,
    user
  });
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  // Find user and include password hash
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Account is deactivated', 401));
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Generate JWT token
  const token = generateToken({
    userId: user._id,
    role: user.role
  });

  // Remove password from response
  user.passwordHash = undefined;

  sendSuccess(res, 200, 'Login successful', {
    token,
    user
  });
};

/**
 * Get current authenticated user
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res) => {
  sendSuccess(res, 200, 'User profile fetched successfully', {
    user: req.user
  });
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
const updateProfile = async (req, res, next) => {
  const { name, phone, location } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;

  // Update farmer location if applicable
  if (req.user.role === 'FARMER' && location) {
    updateData.farmerProfile = { location };
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  sendSuccess(res, 200, 'Profile updated successfully', { user });
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
