import api from './api';

/**
 * Equipment Service
 * Handles all equipment-related API calls
 */

// Get all equipment (marketplace)
export const getAllEquipment = async (params = {}) => {
  try {
    const response = await api.get('/equipment', { params });
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get equipment by ID
export const getEquipmentById = async (id) => {
  try {
    const response = await api.get(`/equipment/${id}`);
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get equipment by owner (for owner dashboard - future use)
export const getOwnerEquipment = async () => {
  try {
    const response = await api.get('/equipment/owner/my-equipment');
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};
