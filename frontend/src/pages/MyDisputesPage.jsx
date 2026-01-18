import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/DashboardLayout';
import disputeService from '../services/disputeService';
import '../style.css';

const MyDisputesPage = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');

    const { user } = useAuth();

    useEffect(() => {
        fetchDisputes();
    }, [filter]);

    const fetchDisputes = async () => {
        setLoading(true);
        try {
            const status = filter === 'ALL' ? null : filter;
            const response = await disputeService.getMyDisputes(status);
            console.log("Fetch Disputes Response:", response); // Debugging

            // Handle nested data structure { success: true, data: { disputes: [] } }
            if (response.data && response.data.disputes) {
                setDisputes(response.data.disputes);
            } else if (response.disputes) {
                setDisputes(response.disputes);
            } else {
                setDisputes([]);
            }
            setLoading(false);
        } catch (err) {
            console.error("Error fetching disputes:", err);
            setError(err.response?.data?.message || err.message || "Failed to load disputes.");
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const config = {
            OPEN: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Open' },
            UNDER_REVIEW: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Under Review' },
            RESOLVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Resolved' },
            REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
            CLOSED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Closed' }
        };
        const style = config[status] || config.OPEN;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                {style.label}
            </span>
        );
    };

    if (loading && disputes.length === 0) {
        return (
            <DashboardLayout user={user}>
                <div className="text-center py-12">
                    <div className="loading-spinner"></div>
                    <p className="mt-4 text-gray-600">Loading disputes...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout user={user}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">My Disputes</h1>
                <p className="text-gray-600">Track and manage your raised disputes.</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex gap-2">
                    {['ALL', 'OPEN', 'RESOLVED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'ALL' ? 'All Disputes' : status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {disputes.length === 0 && !loading ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🛡️</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No disputes found</h3>
                    <p className="text-gray-600">You haven't raised any disputes yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {disputes.map(dispute => (
                        <div key={dispute._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-gray-100">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {dispute.disputeType.replace(/_/g, ' ')}
                                    </h3>
                                    <StatusBadge status={dispute.status} />
                                </div>

                                <p className="text-gray-600 mb-4 line-clamp-2">
                                    {dispute.description}
                                </p>

                                <div className="space-y-2 mb-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between">
                                        <span>Booking ID:</span>
                                        <span className="font-medium text-gray-700">{dispute.bookingId?._id?.substring(0, 8) || 'N/A'}...</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Date:</span>
                                        <span className="font-medium text-gray-700">{new Date(dispute.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Against:</span>
                                        <span className="font-medium text-gray-700">{dispute.raisedAgainst?.name || 'Unknown'}</span>
                                    </div>
                                </div>

                                <Link
                                    to={`/disputes/${dispute._id}`}
                                    className="block w-full text-center py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default MyDisputesPage;
