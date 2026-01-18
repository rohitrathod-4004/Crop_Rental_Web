import { useLocation, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useState } from 'react';

function PaymentSuccessPage() {
    const location = useLocation();
    const [user, setUser] = useState(() => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    });

    const { bookingId, amount, equipmentName } = location.state || {
        bookingId: 'B1234',
        amount: 4000,
        equipmentName: 'Equipment'
    };

    return (
        <DashboardLayout user={user}>
            <div className="max-w-2xl mx-auto">
                {/* Success Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    {/* Success Icon */}
                    <div className="mb-6">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="text-5xl">✅</div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Payment Successful!
                        </h1>
                        <p className="text-gray-600">
                            Your booking has been confirmed
                        </p>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Booking ID:</span>
                                <span className="font-bold text-green-600 text-lg">{bookingId}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Equipment:</span>
                                <span className="font-semibold text-gray-800">{equipmentName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Amount Paid:</span>
                                <span className="font-bold text-gray-800 text-xl">₹{amount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Payment Status:</span>
                                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                                    ✓ Paid
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Message */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            📧 A confirmation email has been sent to your registered email address.
                            You can view your booking details in "My Bookings" section.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Link
                            to="/farmer/bookings"
                            className="block w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                        >
                            Go to My Bookings
                        </Link>
                        <Link
                            to="/equipment"
                            className="block w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition"
                        >
                            Browse More Equipment
                        </Link>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-6 pt-6 border-t">
                        <p className="text-sm text-gray-500">
                            Need help? Contact us at support@agrirent.com
                        </p>
                    </div>
                </div>

                {/* What's Next */}
                <div className="mt-6 bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">What's Next?</h2>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">1️⃣</div>
                            <div>
                                <p className="font-semibold text-gray-800">Wait for Confirmation</p>
                                <p className="text-sm text-gray-600">
                                    The equipment owner will confirm your booking shortly
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">2️⃣</div>
                            <div>
                                <p className="font-semibold text-gray-800">Check Booking Details</p>
                                <p className="text-sm text-gray-600">
                                    Review date, time, and location in your bookings
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">3️⃣</div>
                            <div>
                                <p className="font-semibold text-gray-800">Contact Owner</p>
                                <p className="text-sm text-gray-600">
                                    Coordinate pickup/delivery details with the owner
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default PaymentSuccessPage;
