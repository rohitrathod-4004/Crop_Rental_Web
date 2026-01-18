import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getPendingOwners, approveOwner, rejectOwner } from '../services/statsService';

function PendingOwnersPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
        fetchPendingOwners();
    }, []);

    const fetchPendingOwners = async () => {
        try {
            setLoading(true);
            const response = await getPendingOwners();
            setOwners(response.data.owners || []);
            setError('');
        } catch (err) {
            console.error('Error fetching pending owners:', err);
            setError(err.message || 'Failed to load pending owners');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (ownerId) => {
        if (!confirm('Are you sure you want to approve this owner?')) return;

        try {
            setProcessingId(ownerId);
            await approveOwner(ownerId);
            alert('Owner approved successfully!');
            // Refresh the list
            fetchPendingOwners();
        } catch (err) {
            console.error('Error approving owner:', err);
            alert(err.message || 'Failed to approve owner');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (ownerId) => {
        const reason = prompt('Please enter rejection reason:');
        if (!reason || reason.trim() === '') {
            alert('Rejection reason is required');
            return;
        }

        try {
            setProcessingId(ownerId);
            await rejectOwner(ownerId, reason.trim());
            alert('Owner rejected successfully');
            // Refresh the list
            fetchPendingOwners();
        } catch (err) {
            console.error('Error rejecting owner:', err);
            alert(err.message || 'Failed to reject owner');
        } finally {
            setProcessingId(null);
        }
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
                    Pending Owner Verifications ⏳
                </h1>
                <p className="text-gray-600">
                    Review and approve owner registration requests
                </p>
            </div>

            {/* Content */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl font-semibold text-gray-800">Loading pending owners...</h3>
                </div>
            ) : error ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchPendingOwners}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        Retry
                    </button>
                </div>
            ) : owners.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        No Pending Verifications
                    </h3>
                    <p className="text-gray-600">All owner applications have been processed</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {owners.map(owner => (
                        <div key={owner._id} className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Owner Info */}
                                <div className="flex-1">
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
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                            ⏳ Pending
                                        </span>
                                    </div>

                                    {/* Documents */}
                                    {owner.ownerProfile?.documents && (
                                        <div className="mb-4">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Documents:</p>
                                            <div className="flex gap-2">
                                                {owner.ownerProfile.documents.idProofUrl && (
                                                    <a
                                                        href={owner.ownerProfile.documents.idProofUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                                                    >
                                                        📄 ID Proof
                                                    </a>
                                                )}
                                                {owner.ownerProfile.documents.equipmentProofUrl && (
                                                    <a
                                                        href={owner.ownerProfile.documents.equipmentProofUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                                                    >
                                                        📄 Equipment Proof
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(owner._id)}
                                            disabled={processingId === owner._id}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${processingId === owner._id
                                                    ? 'bg-gray-300 cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                                }`}
                                        >
                                            {processingId === owner._id ? 'Processing...' : '✓ Approve'}
                                        </button>
                                        <button
                                            onClick={() => handleReject(owner._id)}
                                            disabled={processingId === owner._id}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${processingId === owner._id
                                                    ? 'bg-gray-300 cursor-not-allowed'
                                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                                }`}
                                        >
                                            {processingId === owner._id ? 'Processing...' : '✗ Reject'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

export default PendingOwnersPage;
