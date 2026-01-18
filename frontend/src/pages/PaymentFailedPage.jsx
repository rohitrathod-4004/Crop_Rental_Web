import { useLocation, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useState } from 'react';

function PaymentFailedPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    });

    const { amount, bookingData } = location.state || {
        amount: 0,
        bookingData: null
    };

    const handleRetry = () => {
        // Navigate back to payment page with booking data
        navigate('/payment', { state: { bookingData } });
    };

    return (
        <DashboardLayout user={user}>
            <div className="max-w-2xl mx-auto">
                {/* Failure Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    {/* Failure Icon */}
                    <div className="mb-6">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="text-5xl">❌</div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Payment Failed
                        </h1>
                        <p className="text-gray-600">
                            We couldn't process your payment
                        </p>
                    </div>

                    {/* Error Details */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-bold text-gray-800 text-xl">₹{amount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Payment Status:</span>
                                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
                                    ✗ Failed
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Possible Reasons */}
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                        <h3 className="font-semibold text-yellow-800 mb-2">
                            Possible Reasons:
                        </h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Insufficient balance in your account</li>
                            <li>• Payment gateway timeout</li>
                            <li>• Incorrect payment details</li>
                            <li>• Bank server issues</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleRetry}
                            className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                        >
                            Retry Payment
                        </button>
                        <button
                            onClick={() => navigate(-2)}
                            className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition"
                        >
                            Back to Booking
                        </button>
                        <Link
                            to="/farmer/dashboard"
                            className="block w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition"
                        >
                            Go to Dashboard
                        </Link>
                    </div>

                    {/* Help Section */}
                    <div className="mt-6 pt-6 border-t">
                        <p className="text-sm text-gray-600 mb-2">
                            Need help with payment?
                        </p>
                        <div className="flex items-center justify-center gap-4 text-sm">
                            <a href="mailto:support@agrirent.com" className="text-green-600 hover:text-green-700 font-medium">
                                📧 Email Support
                            </a>
                            <span className="text-gray-300">|</span>
                            <a href="tel:+919876543210" className="text-green-600 hover:text-green-700 font-medium">
                                📞 Call Us
                            </a>
                        </div>
                    </div>
                </div>

                {/* Troubleshooting Tips */}
                <div className="mt-6 bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Troubleshooting Tips</h2>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">💡</div>
                            <div>
                                <p className="font-semibold text-gray-800">Check Your Balance</p>
                                <p className="text-sm text-gray-600">
                                    Ensure you have sufficient balance in your account or card
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">🔄</div>
                            <div>
                                <p className="font-semibold text-gray-800">Try Different Method</p>
                                <p className="text-sm text-gray-600">
                                    Use a different payment method (UPI, Card, Net Banking)
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">📱</div>
                            <div>
                                <p className="font-semibold text-gray-800">Contact Your Bank</p>
                                <p className="text-sm text-gray-600">
                                    If the issue persists, contact your bank for assistance
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default PaymentFailedPage;
