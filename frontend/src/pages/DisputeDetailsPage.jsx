import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import disputeService from '../services/disputeService';
import DashboardLayout from '../components/DashboardLayout';
import '../style.css';

const DisputeDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [dispute, setDispute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Admin resolution state
    const [resolving, setResolving] = useState(false);
    const [resolutionData, setResolutionData] = useState({
        action: 'NO_ACTION',
        remarks: '',
        refundAmount: 0
    });

    useEffect(() => {
        fetchDispute();
    }, [id]);

    const fetchDispute = async () => {
        try {
            const data = await disputeService.getDisputeById(id);
            setDispute(data.dispute);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching dispute:", err);
            setError("Failed to load dispute details.");
            setLoading(false);
        }
    };

    const handleResolutionChange = (e) => {
        const { name, value } = e.target;
        setResolutionData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleResolutionSubmit = async (e) => {
        e.preventDefault();
        setResolving(true);
        try {
            await disputeService.resolveDispute(id, resolutionData);
            setResolving(false);
            fetchDispute(); // Refresh data
        } catch (err) {
            console.error("Error resolving dispute:", err);
            alert("Failed to resolve dispute: " + (err.response?.data?.message || err.message));
            setResolving(false);
        }
    };

    const markUnderReview = async () => {
        try {
            await disputeService.markUnderReview(id);
            fetchDispute();
        } catch (err) {
            console.error("Error marking under review:", err);
        }
    };

    const handleRefundPayment = async () => {
        setResolving(true);
        try {
            // 1. Create Order
            const orderData = await disputeService.createRefundOrder(id);
            const { orderId, amount, keyId } = orderData.data; // Response wrapped in data

            // 2. Open Razorpay
            const options = {
                key: keyId,
                amount: amount,
                currency: "INR",
                name: "AgriRent Refund",
                description: `Refund for Dispute #${id}`,
                order_id: orderId,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        await disputeService.verifyRefund(id, {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });

                        alert("Refund payment successful!");
                        setResolving(false);
                        fetchDispute();
                    } catch (verifyErr) {
                        console.error("Verification failed:", verifyErr);
                        alert("Payment successful but verification failed.");
                        setResolving(false);
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone
                },
                theme: {
                    color: "#16a34a"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                alert("Payment Failed: " + response.error.description);
                setResolving(false);
            });
            rzp1.open();

        } catch (err) {
            console.error("Error initiating refund:", err);
            alert("Failed to initiate refund payment.");
            setResolving(false);
        }
    };

    if (loading) return (
        <DashboardLayout user={user}>
            <div className="text-center py-12">
                <div className="loading-spinner"></div>
                <p className="mt-4 text-gray-600">Loading details...</p>
            </div>
        </DashboardLayout>
    );

    if (error) return (
        <DashboardLayout user={user}>
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                {error}
                <button onClick={() => navigate(-1)} className="ml-2 underline">Back</button>
            </div>
        </DashboardLayout>
    );

    if (!dispute) return (
        <DashboardLayout user={user}>
            <div className="text-center py-12">
                <h3 className="text-xl font-bold text-gray-800">Dispute not found</h3>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 underline">Back</button>
            </div>
        </DashboardLayout>
    );

    const isAdmin = user?.role === 'ADMIN';
    const isResolved = dispute.status === 'RESOLVED' || dispute.status === 'REJECTED';

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-800';
            case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardLayout user={user}>
            <div className="mb-6">
                <button
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium mb-4"
                    onClick={() => navigate(-1)}
                >
                    <span>←</span> Back
                </button>
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold text-gray-800">Dispute Details</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(dispute.status)}`}>
                        {dispute.status.replace(/_/g, ' ')}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">{dispute.disputeType.replace(/_/g, ' ')}</h2>
                        <h3 className="text-lg text-gray-600 mb-4">{dispute.reason}</h3>

                        <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg text-gray-700 whitespace-pre-line mb-6">
                            {dispute.description}
                        </div>

                        {dispute.evidenceImages && dispute.evidenceImages.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Evidence</h4>
                                <div className="flex flex-wrap gap-4">
                                    {dispute.evidenceImages.map((img, idx) => (
                                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block w-32 h-32 rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition">
                                            <img src={img} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500">
                            Raised on {new Date(dispute.createdAt).toLocaleString()}
                        </div>
                    </div>

                    {dispute.adminDecision && (
                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                            <h3 className="text-lg font-bold text-green-800 mb-4">Resolution Decision</h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-gray-600 font-medium">Action:</span>
                                    <span className="ml-2 text-gray-800">{dispute.adminDecision.action}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600 font-medium">Remarks:</span>
                                    <p className="mt-1 text-gray-800 bg-green-50 p-3 rounded">{dispute.adminDecision.remarks}</p>
                                </div>
                                {dispute.adminDecision.refundAmount > 0 && (
                                    <div>
                                        <span className="text-gray-600 font-medium">Refund Amount:</span>
                                        <span className="ml-2 font-bold text-green-600">₹{dispute.adminDecision.refundAmount}</span>
                                    </div>
                                )}
                                <div className="text-right text-xs text-gray-500 mt-2">
                                    Decided by Admin on {new Date(dispute.adminDecision.decidedAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Info</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Booking ID</span>
                                <span className="font-mono bg-gray-100 text-gray-900 px-2 py-1 rounded border border-gray-200">
                                    {dispute.bookingId?._id?.substring(0, 8)}...
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Type</span>
                                <span className="text-gray-900 font-semibold">{dispute.bookingId?.bookingType}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Status</span>
                                <span className="font-semibold text-gray-900">{dispute.bookingId?.status}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Total Amount</span>
                                <span className="font-bold text-gray-900">₹{dispute.bookingId?.pricing?.totalAmount || '0'}</span>
                            </div>

                        </div>

                        <hr className="my-4 border-gray-100" />

                        <h4 className="font-semibold text-gray-800 mb-3">Participants</h4>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Raised By</p>
                                <p className="font-medium text-gray-800">{dispute.raisedBy?.name}</p>
                                <p className="text-gray-500">{dispute.raisedBy?.role}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Against</p>
                                <p className="font-medium text-gray-800">{dispute.raisedAgainst?.name}</p>
                                <p className="text-gray-500">{dispute.raisedAgainst?.role}</p>
                            </div>
                        </div>
                    </div>

                    {isAdmin && !isResolved && (
                        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-red-50">
                            <h3 className="text-lg font-bold text-red-800 mb-4">Admin Actions</h3>

                            {dispute.status === 'OPEN' && (
                                <button
                                    className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition mb-6 shadow-sm"
                                    onClick={markUnderReview}
                                >
                                    Mark Under Review
                                </button>
                            )}

                            <form onSubmit={handleResolutionSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Action</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900 bg-white"
                                        name="action"
                                        value={resolutionData.action}
                                        onChange={handleResolutionChange}
                                    >
                                        <option value="NO_ACTION">No Action (Dismiss)</option>
                                        <option value="WARNING">Issue Warning</option>
                                        <option value="REFUND">Refund</option>
                                        <option value="EXTRA_CHARGE">Extra Charge Applied</option>
                                    </select>
                                </div>

                                {resolutionData.action === 'REFUND' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900 bg-white"
                                            name="refundAmount"
                                            value={resolutionData.refundAmount}
                                            onChange={handleResolutionChange}
                                            min="0"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900 bg-white"
                                        name="remarks"
                                        rows="3"
                                        value={resolutionData.remarks}
                                        onChange={handleResolutionChange}
                                        required
                                        placeholder="Explain the decision..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-md transition disabled:opacity-50"
                                    disabled={resolving}
                                >
                                    {resolving ? 'Processing...' : 'Resolve Dispute'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Owner Refund Payment Action */}
                    {dispute.status === 'REFUND_PENDING' && user._id === dispute.raisedAgainst?._id && (
                        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-yellow-400">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Refund Required</h3>
                            <p className="text-gray-600 mb-4">
                                Admin has resolved this dispute requiring a refund of
                                <span className="font-bold text-red-600 ml-1">₹{dispute.adminDecision?.refundAmount}</span>.
                            </p>
                            <button
                                onClick={handleRefundPayment}
                                disabled={resolving}
                                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition"
                            >
                                {resolving ? 'Processing...' : 'Pay Refund Now'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DisputeDetailsPage;
