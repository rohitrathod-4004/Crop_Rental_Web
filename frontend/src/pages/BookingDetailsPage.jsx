import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getBookingById, startBooking, completeBooking, ownerConfirmCompletion } from '../services/bookingService';
import { bookingStatusConfig } from '../utils/mockData';

function BookingDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    });

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                setLoading(true);
                const response = await getBookingById(id);
                setBooking(response.data.booking);
                setError('');
            } catch (err) {
                console.error('Error fetching booking:', err);
                setError(err.message || 'Booking not found');
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);

    const handleStartBooking = async () => {
        if (!confirm("Are you sure you want to start this booking?")) return;
        try {
            await startBooking(id);
            // Refresh booking data
            const response = await getBookingById(id);
            setBooking(response.data.booking);
        } catch (err) {
            console.error(err);
            alert("Failed to start booking: " + (err.message || "Unknown error"));
        }
    };

    const handleCompleteBooking = async () => {
        if (!confirm("Are you sure you want to mark this booking as completed? This will update the status and notify the owner.")) return;
        try {
            await completeBooking(id);
            // Refresh booking data
            const response = await getBookingById(id);
            setBooking(response.data.booking);
        } catch (err) {
            console.error(err);
            alert("Failed to complete booking: " + (err.message || "Unknown error"));
        }
    };

    const handleOwnerConfirmCompletion = async () => {
        if (!confirm("Are you sure you want to confirm the return of the equipment?")) return;
        try {
            await ownerConfirmCompletion(id);
            // Refresh booking data
            const response = await getBookingById(id);
            setBooking(response.data.booking);
        } catch (err) {
            console.error(err);
            alert("Failed to confirm completion: " + (err.message || "Unknown error"));
        }
    };

    if (loading) {
        return (
            <DashboardLayout user={user}>
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">⏳</div>
                    <h2 className="text-2xl font-bold text-gray-800">Loading booking...</h2>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !booking) {
        return (
            <DashboardLayout user={user}>
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Booking Not Found
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Link
                        to="/farmer/bookings"
                        className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        Back to Bookings
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const StatusBadge = ({ status }) => {
        const config = bookingStatusConfig[status];
        return (
            <span className={`px-4 py-2 ${config.bgClass} ${config.textClass} rounded-full text-sm font-semibold`}>
                {config.icon} {config.label}
            </span>
        );
    };

    // Status timeline data
    const getStatusTimeline = () => {
        const statuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
        const currentIndex = statuses.indexOf(booking.status);

        return statuses.map((status, index) => ({
            status,
            label: bookingStatusConfig[status].label,
            icon: bookingStatusConfig[status].icon,
            completed: index <= currentIndex,
            active: index === currentIndex
        }));
    };

    const timeline = getStatusTimeline();

    const isFarmer = user?.role === 'FARMER';
    const isOwner = user?.role === 'OWNER';

    return (
        <DashboardLayout user={user}>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(isFarmer ? '/farmer/bookings' : '/owner/bookings')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium mb-4"
                >
                    <span>←</span> Back to Bookings
                </button>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Booking Details
                        </h1>
                        <p className="text-gray-600">Booking ID: {booking._id}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Equipment Info */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Equipment Information</h2>
                        <div className="flex gap-4">
                            <img
                                src={booking.equipmentId?.images?.[0] || 'https://via.placeholder.com/400x300'}
                                alt={booking.equipmentId?.name || 'Equipment'}
                                className="w-32 h-32 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    {booking.equipmentId?.name || 'Equipment'}
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-600">
                                        <span className="mr-2">🏷️</span>
                                        <span>{booking.equipmentId?.type || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <span className="mr-2">📍</span>
                                        <span>{booking.equipmentId?.location?.address || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <span className="mr-2">📦</span>
                                        <span className="font-semibold">{booking.bookingType}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Date & Time Details */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Date & Time</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Date</p>
                                <p className="font-semibold text-gray-800">
                                    {formatDate(booking.requestedStartTime)}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Time</p>
                                <p className="font-semibold text-gray-800">
                                    {formatTime(booking.requestedStartTime)} - {formatTime(booking.requestedEndTime)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Booking Status</h2>
                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                            {/* Timeline Items */}
                            <div className="space-y-6">
                                {timeline.map((item, index) => (
                                    <div key={item.status} className="relative flex items-start">
                                        {/* Icon */}
                                        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 ${item.completed
                                            ? 'bg-green-500 border-green-200'
                                            : 'bg-gray-100 border-gray-200'
                                            }`}>
                                            <span className="text-xl">
                                                {item.completed ? '✓' : item.icon}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="ml-4 flex-1">
                                            <p className={`font-semibold ${item.active ? 'text-green-600' : 'text-gray-800'
                                                }`}>
                                                {item.label}
                                            </p>
                                            {item.active && (
                                                <p className="text-sm text-gray-500 mt-1">Current status</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information (Role-Based) */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {isFarmer ? 'Owner Information' : 'Farmer Information'}
                        </h2>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                                👤
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">
                                    {isFarmer ? booking.ownerId?.name : booking.farmerId?.name}
                                </p>
                                <p className="text-sm text-green-600">
                                    {isFarmer ? '✓ Verified Owner' : '✓ Verified Farmer'}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center text-gray-600">
                                <span className="mr-2">📞</span>
                                <span>
                                    {isFarmer ? booking.ownerId?.phone : booking.farmerId?.phone || 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <span className="mr-2">📍</span>
                                <span>{booking.equipmentId?.location?.address || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Pricing Breakdown */}
                    <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Pricing Breakdown</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Base Amount:</span>
                                <span className="font-semibold">₹{booking.pricing.baseAmount}</span>
                            </div>

                            {booking.pricing.travelCost > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Travel Cost:</span>
                                    <span className="font-semibold">₹{booking.pricing.travelCost}</span>
                                </div>
                            )}

                            <div className="border-t pt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800">Total:</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        ₹{booking.pricing.totalAmount}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-3 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Payment Status:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${booking.paymentStatus === 'PAID'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {booking.paymentStatus === 'PAID' ? '✓ Paid' : '⏳ Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
                        <div className="space-y-3">
                            {/* Farmer Actions */}
                            {isFarmer && booking.status === 'PENDING' && (
                                <button className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition">
                                    Cancel Request
                                </button>
                            )}

                            {isFarmer && booking.status === 'AWAITING_PAYMENT' && (
                                <button
                                    onClick={() => navigate('/payment', {
                                        state: {
                                            bookingData: {
                                                equipmentName: booking.equipmentId.name,
                                                equipmentType: booking.equipmentId.type,
                                                equipmentImage: booking.equipmentId.images?.[0],
                                                bookingType: booking.bookingType,
                                                date: booking.requestedStartTime.split('T')[0],
                                                requestedStartTime: booking.requestedStartTime,
                                                requestedEndTime: booking.requestedEndTime,
                                                startTime: new Date(booking.requestedStartTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                                                endTime: new Date(booking.requestedEndTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                                                location: booking.equipmentId.location?.address,
                                                ownerName: booking.ownerId?.name || 'Owner',
                                                pricing: booking.pricing
                                            },
                                            bookingId: booking._id
                                        }
                                    })}
                                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition shadow-lg animate-pulse"
                                >
                                    Pay Now (₹{booking.pricing.totalAmount})
                                </button>
                            )}

                            {isFarmer && booking.status === 'CONFIRMED' && (
                                <button
                                    onClick={handleStartBooking}
                                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition shadow-lg animate-pulse"
                                >
                                    Start Booking
                                </button>
                            )}

                            {isFarmer && booking.status === 'IN_PROGRESS' && (
                                <button
                                    onClick={handleCompleteBooking}
                                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition shadow-lg animate-pulse"
                                >
                                    Complete Booking
                                </button>
                            )}

                            {isFarmer && (booking.status === 'COMPLETED' || booking.status === 'AWAITING_OWNER_CONFIRMATION') && (
                                <button
                                    onClick={() => navigate(`/disputes/create/${booking._id}`)}
                                    className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition"
                                >
                                    Raise Dispute
                                </button>
                            )}

                            {/* Owner Actions */}
                            {isOwner && (booking.status === 'COMPLETED' || booking.status === 'AWAITING_OWNER_CONFIRMATION') && (
                                <button
                                    onClick={() => navigate(`/disputes/create/${booking._id}`)}
                                    className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition"
                                >
                                    Raise Dispute
                                </button>
                            )}

                            {isOwner && booking.status === 'AWAITING_OWNER_CONFIRMATION' && (
                                <button
                                    onClick={handleOwnerConfirmCompletion}
                                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition shadow-lg animate-pulse"
                                >
                                    Confirm Equipment Return
                                </button>
                            )}

                            {/* Shared Actions */}
                            <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition">
                                Contact {isFarmer ? 'Owner' : 'Farmer'}
                            </button>

                            <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition">
                                Download Invoice
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default BookingDetailsPage;
