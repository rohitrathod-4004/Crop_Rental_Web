import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/DashboardLayout';
import disputeService from '../services/disputeService';
import '../style.css';

const AdminDisputesPage = () => {
    const [disputes, setDisputes] = useState([]);
    const [summary, setSummary] = useState(null);
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
            const data = await disputeService.getAllDisputes(status);
            setDisputes(data.disputes || []);
            setSummary(data.summary);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching disputes:", err);
            setError("Failed to load disputes.");
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
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Dispute Management</h1>
                <p className="text-gray-600">Review and resolve disputes raised by users.</p>
            </div>

            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="text-3xl font-bold text-gray-800 mb-1">{summary.total}</div>
                        <div className="text-gray-500 text-sm">Total Disputes</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-100">
                        <div className="text-3xl font-bold text-blue-700 mb-1">{summary.open}</div>
                        <div className="text-blue-600 text-sm">Open</div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl shadow-sm p-4 border border-yellow-100">
                        <div className="text-3xl font-bold text-yellow-700 mb-1">{summary.underReview}</div>
                        <div className="text-yellow-600 text-sm">Under Review</div>
                    </div>
                    <div className="bg-green-50 rounded-xl shadow-sm p-4 border border-green-100">
                        <div className="text-3xl font-bold text-green-700 mb-1">{summary.resolved}</div>
                        <div className="text-green-600 text-sm">Resolved</div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex gap-2">
                    {['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === status
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'ALL' ? 'All' : status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raised By</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {disputes.map(dispute => (
                                <tr key={dispute._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {new Date(dispute.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{dispute.raisedBy?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{dispute.raisedBy?.role}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {dispute.disputeType.replace(/_/g, ' ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                        {dispute.bookingId?._id?.substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={dispute.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link
                                            to={`/disputes/${dispute._id}`}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition"
                                        >
                                            Manage
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {disputes.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No disputes found matching your filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDisputesPage;
