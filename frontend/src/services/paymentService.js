import api from './api';

export const createPaymentOrder = async (bookingId) => {
    // This matches the endpoint in paymentController.js: router.post('/create-order', protect, createPaymentOrder)
    const response = await api.post('/payments/create-order', { bookingId });
    return response;
};

export const verifyPayment = async (paymentData) => {
    // This matches the endpoint in paymentController.js: router.post('/verify', protect, verifyPayment)
    // This matches the endpoint in paymentController.js: router.post('/verify', protect, verifyPayment)
    const response = await api.post('/payments/verify', paymentData);
    return response;
};

export const getPaymentByBooking = async (bookingId) => {
    const response = await api.get(`/payments/booking/${bookingId}`);
    return response.data;
};
