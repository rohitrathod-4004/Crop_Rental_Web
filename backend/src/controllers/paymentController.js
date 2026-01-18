const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { sendSuccess } = require('../utils/responseUtils');
const AppError = require('../utils/AppError');
const { PAYMENT_STATUS, BOOKING_STATUS } = require('../config/constants');

// Lazy initialization of Razorpay instance
let razorpayInstance = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
};

/**
 * Create Razorpay payment order
 * @route POST /api/payments/create-order
 * @access Private/Farmer
 */
const createPaymentOrder = async (req, res, next) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return next(new AppError('Booking ID is required', 400));
  }

  // Get booking details
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if farmer owns this booking
  if (!booking.farmerId.equals(req.user._id)) {
    return next(new AppError('You are not authorized to pay for this booking', 403));
  }

  // Check if booking is in valid state for payment
  if (booking.status !== BOOKING_STATUS.AWAITING_PAYMENT) {
    if (booking.status === BOOKING_STATUS.PENDING) {
      return next(new AppError('Booking is waiting for owner approval', 400));
    }
    return next(new AppError('Booking is not ready for payment', 400));
  }

  // Check if payment already exists and is successful
  const existingPayment = await Payment.findOne({ bookingId: booking._id });
  
  if (existingPayment && existingPayment.status === PAYMENT_STATUS.SUCCESS) {
    return next(new AppError('Payment already completed for this booking', 400));
  }

  // Create Razorpay order
  const orderOptions = {
    amount: Math.round(booking.pricing.totalAmount * 100), // Convert to paise
    currency: 'INR',
    receipt: `booking_${booking._id}`,
    notes: {
      bookingId: booking._id.toString(),
      farmerId: req.user._id.toString(),
      bookingType: booking.bookingType
    }
  };

  try {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create(orderOptions);

    // Create or update payment record
    let payment;
    if (existingPayment) {
      // Update existing payment record
      existingPayment.razorpayOrderId = order.id;
      existingPayment.amount = booking.pricing.totalAmount;
      existingPayment.status = PAYMENT_STATUS.PENDING;
      payment = await existingPayment.save();
    } else {
      // Create new payment record
      payment = await Payment.create({
        bookingId: booking._id,
        farmerId: req.user._id,
        razorpayOrderId: order.id,
        amount: booking.pricing.totalAmount,
        currency: 'INR',
        status: PAYMENT_STATUS.PENDING
      });
    }

    sendSuccess(res, 201, 'Payment order created successfully', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return next(new AppError('Failed to create payment order', 500));
  }
};

/**
 * Verify Razorpay payment signature
 * @route POST /api/payments/verify
 * @access Private/Farmer
 */
const verifyPayment = async (req, res, next) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  } = req.body;

  // Validate required fields
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return next(new AppError('Missing payment verification details', 400));
  }

  // Find payment record
  const payment = await Payment.findOne({ razorpayOrderId });

  if (!payment) {
    return next(new AppError('Payment record not found', 404));
  }

  // Check if farmer owns this payment
  if (!payment.farmerId.equals(req.user._id)) {
    return next(new AppError('You are not authorized to verify this payment', 403));
  }

  // Verify signature
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    // Signature verification failed
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failureReason = 'Signature verification failed';
    await payment.save();

    return next(new AppError('Payment verification failed. Invalid signature', 400));
  }

  // Signature verified successfully
  payment.status = PAYMENT_STATUS.SUCCESS;
  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.paidAt = new Date();
  await payment.save();

  // Update booking payment status and confirm booking
  await Booking.findByIdAndUpdate(payment.bookingId, {
    paymentStatus: PAYMENT_STATUS.SUCCESS,
    status: 'CONFIRMED',
    confirmedAt: new Date()
  });

  sendSuccess(res, 200, 'Payment verified successfully', { payment });
};

/**
 * Get payment details by booking ID
 * @route GET /api/payments/booking/:id
 * @access Private
 */
const getPaymentByBooking = async (req, res, next) => {
  const payment = await Payment.findOne({
    bookingId: req.params.id
  }).populate('bookingId', 'pricing status');

  if (!payment) {
    return next(new AppError('Payment not found for this booking', 404));
  }

  // Check authorization
  const booking = await Booking.findById(req.params.id);
  const isAuthorized = 
    booking.farmerId.equals(req.user._id) ||
    booking.ownerId.equals(req.user._id) ||
    req.user.role === 'ADMIN';

  if (!isAuthorized) {
    return next(new AppError('You are not authorized to view this payment', 403));
  }

  sendSuccess(res, 200, 'Payment details fetched successfully', { payment });
};

/**
 * Get all payments (Admin only)
 * @route GET /api/payments
 * @access Private/Admin
 */
const getAllPayments = async (req, res) => {
  const { status } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const payments = await Payment.find(filter)
    .populate('bookingId', 'bookingType pricing status')
    .populate('farmerId', 'name email phone')
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, 'Payments fetched successfully', {
    count: payments.length,
    payments
  });
};

/**
 * Handle payment webhook (for production use)
 * @route POST /api/payments/webhook
 * @access Public (Razorpay webhook)
 */
const handleWebhook = async (req, res, next) => {
  // Verify webhook signature
  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Webhook secret not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  const body = JSON.stringify(req.body);
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== webhookSignature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Process webhook event
  const event = req.body.event;
  const payload = req.body.payload.payment.entity;

  if (event === 'payment.captured') {
    // Payment successful
    const payment = await Payment.findOne({
      razorpayOrderId: payload.order_id
    });

    if (payment && payment.status !== PAYMENT_STATUS.SUCCESS) {
      payment.status = PAYMENT_STATUS.SUCCESS;
      payment.razorpayPaymentId = payload.id;
      payment.paidAt = new Date();
      await payment.save();

      await Booking.findByIdAndUpdate(payment.bookingId, {
        paymentStatus: 'PAID'
      });
    }
  } else if (event === 'payment.failed') {
    // Payment failed
    const payment = await Payment.findOne({
      razorpayOrderId: payload.order_id
    });

    if (payment) {
      payment.status = PAYMENT_STATUS.FAILED;
      payment.failureReason = payload.error_description || 'Payment failed';
      await payment.save();
    }
  }

  res.status(200).json({ status: 'ok' });
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentByBooking,
  getAllPayments,
  handleWebhook
};
