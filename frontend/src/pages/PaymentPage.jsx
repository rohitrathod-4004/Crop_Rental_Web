import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { createPaymentOrder, verifyPayment } from '../services/paymentService';

function PaymentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(() => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    });

    // Get booking data and bookingId from navigation state
    const bookingData = location.state?.bookingData || {
        equipmentName: 'John Deere 5075E Tractor',
        equipmentType: 'TRACTOR',
        equipmentImage: 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Tractor',
        bookingType: 'RENTAL',
        date: '2026-01-20',
        startTime: '08:00',
        endTime: '16:00',
        location: 'Pune, Maharashtra',
        ownerName: 'Ramesh Patil',
        pricing: {
            baseAmount: 4000,
            travelCost: 0,
            totalAmount: 4000
        }
    };

    const bookingId = location.state?.bookingId;

    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        if (!bookingId) {
            alert('Booking ID not found. Please create a booking first.');
            navigate('/equipment');
            return;
        }

        try {
            setIsProcessing(true);

            // 1. Create Razorpay order from backend
            const orderResponse = await createPaymentOrder(bookingId);
            const { orderId, amount, currency, keyId } = orderResponse.data;

            // 2. Razorpay checkout options
            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: 'AgriRent',
                description: 'Equipment Booking Payment',
                order_id: orderId,
                handler: async function (response) {
                    try {
                        // 3. Verify payment signature with backend
                        await verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });

                        // 4. Navigate to success page
                        navigate('/payment/success', {
                            state: {
                                bookingId: bookingId,
                                amount: amount / 100, // Convert paise to rupees
                                equipmentName: bookingData.equipmentName
                            }
                        });
                    } catch (err) {
                        console.error('Payment verification failed:', err);
                        // Navigate to failed page
                        navigate('/payment/failed', {
                            state: {
                                amount: amount / 100,
                                bookingData: bookingData
                            }
                        });
                    }
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    }
                },
                theme: {
                    color: '#16a34a' // Green color matching our theme
                },
            };

            // 5. Open Razorpay checkout popup
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error('Payment initiation failed:', err);
            alert(err.message || 'Unable to initiate payment. Please try again.');
            setIsProcessing(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (isoString) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <DashboardLayout user={user}>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium mb-4"
                >
                    <span>←</span> Back
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Complete Payment</h1>
                <p className="text-gray-600">Review your booking and proceed to payment</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {/* Booking Summary */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h2>

                        {/* Equipment Info */}
                        <div className="flex gap-4 mb-6 pb-6 border-b">
                            <img
                                src={bookingData.equipmentImage}
                                alt={bookingData.equipmentName}
                                className="w-24 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                    {bookingData.equipmentName}
                                </h3>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                        {bookingData.equipmentType}
                                    </span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                        {bookingData.bookingType}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">📍 {bookingData.location}</p>
                                <p className="text-sm text-gray-600">👤 {bookingData.ownerName}</p>
                            </div>
                        </div>

                        {/* Booking Details */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <span className="text-gray-700">Date:</span>
                                <span className="font-semibold text-gray-900">
                                    {formatDate(bookingData.date)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <span className="text-gray-700">Time:</span>
                                <span className="font-semibold text-gray-900">
                                    {bookingData.startTime || formatTime(bookingData.requestedStartTime)} - {bookingData.endTime || formatTime(bookingData.requestedEndTime)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <span className="text-gray-700">Booking Type:</span>
                                <span className="font-semibold text-gray-900">
                                    {bookingData.bookingType}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Security Message */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">🔒</div>
                            <div>
                                <h3 className="font-semibold text-green-800 mb-2">
                                    Secure Payment
                                </h3>
                                <p className="text-sm text-green-700">
                                    Your payment is secured with industry-standard encryption.
                                    We use Razorpay for safe and secure transactions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Details</h2>

                        {/* Pricing Breakdown */}
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Base Amount:</span>
                                <span className="font-semibold">₹{bookingData.pricing.baseAmount}</span>
                            </div>

                            {bookingData.pricing.travelCost > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Travel Cost:</span>
                                    <span className="font-semibold">₹{bookingData.pricing.travelCost}</span>
                                </div>
                            )}

                            <div className="border-t pt-3">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                                    <span className="text-3xl font-bold text-green-600">
                                        ₹{bookingData.pricing.totalAmount}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg transition ${isProcessing
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                                }`}
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    Processing...
                                </span>
                            ) : (
                                `Pay ₹${bookingData.pricing.totalAmount}`
                            )}
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-3">
                            By proceeding, you agree to our terms and conditions
                        </p>

                        {/* Payment Methods */}
                        <div className="mt-6 pt-6 border-t">
                            <p className="text-sm text-gray-600 mb-3">We accept:</p>
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <span className="text-lg">💳</span> Cards
                                </div>
                                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <span className="text-lg">🏦</span> UPI
                                </div>
                                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <span className="text-lg">🏧</span> Net Banking
                                </div>
                                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <span className="text-lg">📱</span> Wallets
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default PaymentPage;
