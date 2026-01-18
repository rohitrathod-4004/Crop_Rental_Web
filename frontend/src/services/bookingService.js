import api from './api';

/**
 * Booking Service
 * Handles all booking-related API calls
 */

// Create booking
export const createBooking = async (data) => {
  try {
    const response = await api.post('/bookings', data);
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get farmer bookings
export const getFarmerBookings = async () => {
  try {
    const response = await api.get('/bookings/farmer');
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get booking by ID
export const getBookingById = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}`);
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Cancel booking
export const cancelBooking = async (id) => {
  try {
    const response = await api.patch(`/bookings/${id}/cancel`);
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Confirm booking (Owner)
export const confirmBooking = async (id) => {
  try {
    const response = await api.patch(`/bookings/${id}/confirm`);
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Start booking (Farmer)
export const startBooking = async (id) => {
  try {
    const response = await api.patch(`/bookings/${id}/start`);
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Complete booking (Farmer)
export const completeBooking = async (id) => {
  try {
    const response = await api.patch(`/bookings/${id}/complete`);
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Confirm completion (Owner)
export const ownerConfirmCompletion = async (id) => {
  try {
    const response = await api.patch(`/bookings/${id}/owner-confirm`);
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};
