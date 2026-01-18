import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';

function OwnerBookingsPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, CONFIRMED, IN_PROGRESS, COMPLETED

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
        fetchBookings();
    }, [filter]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/bookings/owner');
            let filteredBookings = response.data.bookings || [];

            if (filter !== 'ALL') {
                filteredBookings = filteredBookings.filter(b => b.status === filter);
            }

            setBookings(filteredBookings);
            setError('');
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(err.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (bookingId) => {
        if (!confirm('Confirm this booking?')) return;

        try {
            await api.patch(`/bookings/${bookingId}/confirm`);
            alert('Booking confirmed!');
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to confirm booking');
        }
    };

    const handleConfirmCompletion = async (bookingId) => {
        if (!confirm('Confirm that the job is completed? This will close the booking.')) return;

        try {
            await api.patch(`/bookings/${bookingId}/owner-confirm`);
            alert('Booking completion confirmed!');
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to confirm completion');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: { class: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            CONFIRMED: { class: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
            IN_PROGRESS: { class: 'bg-purple-100 text-purple-800', label: 'In Progress' },
            COMPLETED: { class: 'bg-green-100 text-green-800', label: 'Completed' },
            CANCELLED: { class: 'bg-red-100 text-red-800', label: 'Cancelled' }
        };
        return badges[status] || { class: 'bg-gray-100 text-gray-800', label: status };
    };

    return (
        <DashboardLayout user={user}>
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/owner/dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium mb-4"
                >
                    <span>←</span> Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Booking Requests 📅
                </h1>
                <p className="text-gray-600">
                    Manage incoming booking requests
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex gap-3 flex-wrap">
                    {['ALL', 'PENDING', 'AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'AWAITING_OWNER_CONFIRMATION', 'COMPLETED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === status
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl font-semibold text-gray-800">Loading bookings...</h3>
                </div>
            ) : error ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchBookings}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        Retry
                    </button>
                </div>
            ) : bookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        No Bookings Found
                    </h3>
                    <p className="text-gray-600">No bookings match the selected filter</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map(booking => {
                        const statusBadge = getStatusBadge(booking.status);
                        return (
                            <div key={booking._id} className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                                            {booking.equipmentId?.name || 'Equipment'}
                                        </h3>
                                        <p className="text-gray-600">
                                            Farmer: {booking.farmerId?.name || 'Unknown'}
                                        </p>
                                        <p className="text-gray-600">
                                            📞 {booking.farmerId?.phone || 'N/A'}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadge.class}`}>
                                        {statusBadge.label}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Start Date</p>
                                        <p className="font-medium text-gray-900">{new Date(booking.requestedStartTime).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">End Date</p>
                                        <p className="font-medium text-gray-900">{new Date(booking.requestedEndTime).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Duration</p>
                                        <p className="font-medium">{booking.duration?.hours || 0} hours</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="font-medium text-green-600">₹{booking.pricing?.totalAmount || 0}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {booking.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleConfirm(booking._id)}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                                        >
                                            ✓ Confirm
                                        </button>
                                    )}
                                    {booking.status === 'AWAITING_OWNER_CONFIRMATION' && (
                                        <button
                                            onClick={() => handleConfirmCompletion(booking._id)}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                                        >
                                            ✓ Confirm Completion
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate(`/owner/bookings/${booking._id}`)}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}

export default OwnerBookingsPage;
