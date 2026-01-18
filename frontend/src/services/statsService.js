import api from './api';

/**
 * Stats Service
 * Handles all dashboard statistics API calls
 */

// Get admin platform statistics
export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get farmer dashboard statistics
export const getFarmerStats = async () => {
  try {
    const response = await api.get('/bookings/farmer/stats');
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get owner dashboard statistics
export const getOwnerStats = async () => {
  try {
    const response = await api.get('/bookings/owner/stats');
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get pending owner verification requests (Admin)
export const getPendingOwners = async () => {
  try {
    const response = await api.get('/admin/owners/pending');
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all owners (Admin)
export const getAllOwners = async (status = '') => {
  try {
    const response = await api.get('/admin/owners', {
      params: status ? { status } : {}
    });
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Approve owner (Admin)
export const approveOwner = async (ownerId) => {
  try {
    const response = await api.patch(`/admin/owners/${ownerId}/approve`);
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reject owner (Admin)
export const rejectOwner = async (ownerId, reason) => {
  try {
    const response = await api.patch(`/admin/owners/${ownerId}/reject`, { reason });
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};
