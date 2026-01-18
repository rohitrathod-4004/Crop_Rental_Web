import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import disputeService from '../services/disputeService';
import * as bookingService from '../services/bookingService';
import DashboardLayout from '../components/DashboardLayout';
import '../style.css';

const DisputeCreatePage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        disputeType: '',
        reason: '',
        description: '',
        evidenceImages: [] // Placeholder for now, can be implemented with file upload later
    });

    const DISPUTE_TYPES = {
        LATE_RETURN: 'LATE_RETURN',
        EXTRA_USAGE: 'EXTRA_USAGE',
        BILLING_MISMATCH: 'BILLING_MISMATCH',
        EQUIPMENT_CONDITION: 'EQUIPMENT_CONDITION',
        OTHER: 'OTHER'
    };

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await bookingService.getBookingById(bookingId);
                console.log("Fetch Booking Response:", response); // Debugging

                let bookingData = null;
                if (response.data && response.data.booking) {
                    bookingData = response.data.booking;
                } else if (response.booking) {
                    bookingData = response.booking;
                }

                if (bookingData) {
                    setBooking(bookingData);
                } else {
                    console.error("Invalid booking data structure:", response);
                    setError("Failed to parse booking data. See console.");
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching booking:", err);
                setError("Failed to load booking details.");
                setLoading(false);
            }
        };

        if (bookingId) {
            fetchBooking();
        } else {
            setError("No booking ID provided.");
            setLoading(false);
        }
    }, [bookingId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await disputeService.raiseDispute({
                bookingId,
                ...formData
            });
            // Redirect to My Disputes
            navigate('/disputes/my');
        } catch (err) {
            console.error("Error raising dispute:", err);
            setError(err.response?.data?.message || "Failed to raise dispute. Please try again.");
            setSubmitting(false);
        }
    };

    if (loading) return (
        <DashboardLayout user={user}>
            <div className="text-center py-12">
                <div className="loading-spinner"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
            </div>
        </DashboardLayout>
    );

    if (error && !booking) return (
        <DashboardLayout user={user}>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-2 text-red-700 underline"
                >
                    Go Back
                </button>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout user={user}>
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium mb-6"
                >
                    <span>←</span> Back
                </button>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">Raise a Dispute</h2>
                    </div>

                    {booking && (
                        <div className="p-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-blue-800 mb-2">Booking Reference</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-blue-600 uppercase text-xs font-bold tracking-wider">Equipment</p>
                                        <p className="text-gray-800 font-medium">{booking.equipmentId?.name || 'Unknown Equipment'}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-600 uppercase text-xs font-bold tracking-wider">Booking ID</p>
                                        <p className="text-gray-800 font-medium">{booking._id}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-600 uppercase text-xs font-bold tracking-wider">Date</p>
                                        <p className="text-gray-800 font-medium">{new Date(booking.requestedStartTime).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Dispute Type</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900 bg-white"
                                        name="disputeType"
                                        value={formData.disputeType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select a reason type</option>
                                        {Object.entries(DISPUTE_TYPES).map(([key, value]) => (
                                            <option key={key} value={key}>{value.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Reason (Short Title)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900 bg-white"
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        placeholder="e.g., Engine not working properly"
                                        maxLength="200"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Detailed Description</label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900 bg-white"
                                        name="description"
                                        rows="5"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Please provide full details of the issue..."
                                        maxLength="1000"
                                        required
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition bg-white"
                                        onClick={() => navigate(-1)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Submitting...' : 'Raise Dispute'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DisputeCreatePage;
