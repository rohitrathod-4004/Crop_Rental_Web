import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getFarmerBookings } from '../services/bookingService';
import { bookingStatusConfig } from '../utils/mockData';

function MyBookingsPage() {
    const [user, setUser] = useState(() => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    });

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL');

    // Fetch bookings from backend
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const response = await getFarmerBookings();
                setBookings(response.data.bookings || []);
                setError('');
            } catch (err) {
                console.error('Error fetching bookings:', err);
                setError(err.message || 'Failed to load bookings');
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const filteredBookings = filter === 'ALL'
        ? bookings
        : filter === 'COMPLETED'
            ? bookings.filter(booking => booking.status === 'COMPLETED' || booking.status === 'AWAITING_OWNER_CONFIRMATION')
            : bookings.filter(booking => booking.status === filter);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
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
            <span className={`px-3 py-1 ${config.bgClass} ${config.textClass} rounded-full text-sm font-semibold`}>
                {config.icon} {config.label}
            </span>
        );
    };

    return (
        <DashboardLayout user={user}>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            My Bookings 📋
                        </h1>
                        <p className="text-gray-600">
                            View and manage your equipment bookings
                        </p>
                    </div>
                    <Link
                        to="/equipment"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        + New Booking
                    </Link>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                    {['ALL', 'PENDING', 'AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === status
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'ALL' ? 'All' : bookingStatusConfig[status]?.label || status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookings List */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Loading bookings...
                    </h3>
                </div>
            ) : error ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Error Loading Bookings
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        Retry
                    </button>
                </div>
            ) : filteredBookings.length > 0 ? (
                <div className="space-y-4">
                    {filteredBookings.map(booking => (
                        <div key={booking._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Equipment Image */}
                                    <div className="flex-shrink-0">
                                        <img
                                            src={booking.equipmentId?.images?.[0] || 'https://via.placeholder.com/400x300'}
                                            alt={booking.equipmentId?.name || 'Equipment'}
                                            className="w-full md:w-32 h-32 object-cover rounded-lg"
                                        />
                                    </div>

                                    {/* Booking Details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800 mb-1">
                                                    {booking.equipmentId?.name || 'Equipment'}
                                                </h3>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                                        {booking.equipmentId?.type || 'N/A'}
                                                    </span>
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                                        {booking.bookingType}
                                                    </span>
                                                    <StatusBadge status={booking.status} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-center text-gray-600">
                                                <span className="mr-2">📅</span>
                                                <span>{formatDate(booking.requestedStartTime)}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <span className="mr-2">🕐</span>
                                                <span>
                                                    {formatTime(booking.requestedStartTime)} - {formatTime(booking.requestedEndTime)}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <span className="mr-2">📍</span>
                                                <span>{booking.equipmentId?.location?.address || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <span className="mr-2">👤</span>
                                                <span>{booking.ownerId?.name || 'Owner'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div>
                                                <p className="text-2xl font-bold text-green-600">
                                                    ₹{booking.pricing.totalAmount}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Payment: {booking.paymentStatus === 'SUCCESS' ? '✓ Paid' : '⏳ Pending'}
                                                </p>
                                            </div>
                                            <Link
                                                to={`/farmer/bookings/${booking._id}`}
                                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        No bookings found
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {filter === 'ALL'
                            ? "You haven't made any bookings yet"
                            : `No ${bookingStatusConfig[filter]?.label.toLowerCase()} bookings`}
                    </p>
                    <Link
                        to="/equipment"
                        className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        Browse Equipment
                    </Link>
                </div>
            )}
        </DashboardLayout>
    );
}

export default MyBookingsPage;
