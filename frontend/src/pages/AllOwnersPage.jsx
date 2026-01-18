import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getAllOwners } from '../services/statsService';

function AllOwnersPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState(''); // '', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED'

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
        fetchOwners();
    }, [filter]);

    const fetchOwners = async () => {
        try {
            setLoading(true);
            const response = await getAllOwners(filter);
            setOwners(response.data.owners || []);
            setError('');
        } catch (err) {
            console.error('Error fetching owners:', err);
            setError(err.message || 'Failed to load owners');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            PENDING_VERIFICATION: { class: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            APPROVED: { class: 'bg-green-100 text-green-800', label: 'Approved' },
            REJECTED: { class: 'bg-red-100 text-red-800', label: 'Rejected' }
        };
        return badges[status] || { class: 'bg-gray-100 text-gray-800', label: status };
    };

    return (
        <DashboardLayout user={user}>
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium mb-4"
                >
                    <span>←</span> Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    All Owners 🚜
                </h1>
                <p className="text-gray-600">
                    View all equipment owners and their verification status
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => setFilter('')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === ''
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        All Owners
                    </button>
                    <button
                        onClick={() => setFilter('PENDING_VERIFICATION')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'PENDING_VERIFICATION'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('APPROVED')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'APPROVED'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setFilter('REJECTED')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'REJECTED'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl font-semibold text-gray-800">Loading owners...</h3>
                </div>
            ) : error ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchOwners}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        Retry
                    </button>
                </div>
            ) : owners.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        No Owners Found
                    </h3>
                    <p className="text-gray-600">No owners match the selected filter</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {owners.map(owner => {
                        const statusBadge = getStatusBadge(owner.ownerProfile?.verificationStatus);
                        return (
                            <div key={owner._id} className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                                            {owner.name}
                                        </h3>
                                        <div className="space-y-1">
                                            <p className="text-gray-600 flex items-center gap-2">
                                                <span>📧</span> {owner.email}
                                            </p>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                <span>📞</span> {owner.phone}
                                            </p>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                <span>📅</span> Registered: {new Date(owner.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadge.class}`}>
                                        {statusBadge.label}
                                    </span>
                                </div>

                                {owner.ownerProfile?.verificationStatus === 'APPROVED' && owner.ownerProfile?.verifiedAt && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">
                                            ✓ Verified on {new Date(owner.ownerProfile.verifiedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {owner.ownerProfile?.verificationStatus === 'REJECTED' && owner.ownerProfile?.rejectionReason && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-red-600">
                                            ✗ Rejected: {owner.ownerProfile.rejectionReason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-700 text-center">
                            Showing <span className="font-medium">{owners.length}</span> owners
                        </p>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default AllOwnersPage;
