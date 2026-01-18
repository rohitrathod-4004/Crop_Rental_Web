import api from './api';

const disputeService = {
  // Raise a new dispute
  raiseDispute: async (disputeData) => {
    const response = await api.post('/disputes', disputeData);
    return response.data;
  },

  // Get disputes for current user (Farmer/Owner)
  getMyDisputes: async (status) => {
    const params = status ? { status } : {};
    const response = await api.get('/disputes/my', { params });
    return response.data;
  },

  // Get single dispute details
  getDisputeById: async (id) => {
    const response = await api.get(`/disputes/${id}`);
    return response.data;
  },

  // Admin: Get all disputes
  getAllDisputes: async (status) => {
    const params = status ? { status } : {};
    const response = await api.get('/disputes/admin/all', { params });
    return response.data;
  },

  // Admin: Mark dispute as under review
  markUnderReview: async (id) => {
    const response = await api.patch(`/disputes/${id}/under-review`);
    return response.data;
  },

  // Admin: Resolve dispute
  resolveDispute: async (id, resolutionData) => {
    const response = await api.patch(`/disputes/${id}/admin-action`, resolutionData);
    return response.data;
  },

  // Owner: Create refund payment order
  createRefundOrder: async (id) => {
    const response = await api.post(`/disputes/${id}/refund-order`);
    return response.data;
  },

  // Owner: Verify refund payment
  verifyRefund: async (id, paymentData) => {
    const response = await api.post(`/disputes/${id}/verify-refund`, paymentData);
    return response.data;
  }
};

export default disputeService;
