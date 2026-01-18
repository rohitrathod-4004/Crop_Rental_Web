import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getOwnerStats } from '../services/statsService';
import api from '../services/api';

function OwnerDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUserData();
        fetchStats();
    }, []);

    const fetchUserData = async () => {
        try {
            // Fetch fresh user data from backend
            const response = await api.get('/auth/me');
            const userData = response.data.user;
            setUser(userData);
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (err) {
            console.error('Error fetching user data:', err);
            // Fallback to localStorage
            const userStr = localStorage.getItem('user');
            if (userStr) {
                setUser(JSON.parse(userStr));
            }
        }
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await getOwnerStats();
            setStats(response.data.stats);
            setError('');
        } catch (err) {
            console.error('Error fetching owner stats:', err);
            setError(err.message || 'Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    // Get verification status from user data
    const verificationStatus = user?.ownerProfile?.verificationStatus || 'PENDING_VERIFICATION';

    const getVerificationBadge = () => {
        switch (verificationStatus) {
            case 'APPROVED':
                return (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        ✓ Verified
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        ✗ Rejected
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        ⏳ Pending Verification
                    </span>
                );
        }
    };

    return (
        <DashboardLayout user={user}>
            {/* Welcome Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Welcome back, {user?.name}! 👋
                        </h1>
                        <p className="text-gray-600">
                            Manage your equipment and rental requests
                        </p>
                    </div>
                    {getVerificationBadge()}
                </div>
            </div>

            {/* Verification Alert */}
            {verificationStatus === 'PENDING_VERIFICATION' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="text-3xl">⏳</div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-yellow-800 mb-2">
                                Verification Pending
                            </h3>
                            <p className="text-yellow-700 text-sm mb-3">
                                Your account is under review by our admin team. You'll be able to add equipment once approved.
                            </p>
                            <button
                                onClick={() => {
                                    fetchUserData();
                                    fetchStats();
                                }}
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition"
                            >
                                🔄 Refresh Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {verificationStatus === 'REJECTED' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="text-3xl">❌</div>
                        <div>
                            <h3 className="font-semibold text-red-800 mb-2">
                                Verification Rejected
                            </h3>
                            <p className="text-red-700 text-sm mb-2">
                                Your owner verification was rejected. Please contact support for more information.
                            </p>
                            {user?.ownerProfile?.rejectionReason && (
                                <p className="text-red-600 text-sm italic">
                                    Reason: {user.ownerProfile.rejectionReason}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">My Equipment</p>
                            <p className="text-3xl font-bold text-gray-800">{stats?.equipment?.total || 0}</p>
                        </div>
                        <div className="text-4xl">🚜</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Active Bookings</p>
                            <p className="text-3xl font-bold text-gray-800">{stats?.bookings?.confirmed || 0}</p>
                        </div>
                        <div className="text-4xl">📋</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Earnings</p>
                            <p className="text-3xl font-bold text-gray-800">₹{stats?.totalEarnings || 0}</p>
                        </div>
                        <div className="text-4xl">💰</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Pending Requests</p>
                            <p className="text-3xl font-bold text-gray-800">{stats?.bookings?.pending || 0}</p>
                        </div>
                        <div className="text-4xl">🔔</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* My Equipment */}
                    <div
                        onClick={() => navigate('/owner/equipment')}
                        className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition transform hover:scale-105"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">My Equipment</h3>
                            <div className="text-3xl">🚜</div>
                        </div>
                        <p className="text-green-100 mb-4">
                            View and manage your equipment listings
                        </p>
                        <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition">
                            Manage →
                        </button>
                    </div>

                    {/* Booking Requests */}
                    <div
                        onClick={() => navigate('/owner/bookings')}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition transform hover:scale-105"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Booking Requests</h3>
                            <div className="text-3xl">📅</div>
                        </div>
                        <p className="text-blue-100 mb-4">
                            Review and approve rental requests
                        </p>
                        <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition">
                            View Requests →
                        </button>
                    </div>

                    {/* My Disputes */}
                    <div
                        onClick={() => navigate('/disputes/my')}
                        className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition transform hover:scale-105"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">My Disputes</h3>
                            <div className="text-3xl">⚠️</div>
                        </div>
                        <p className="text-red-100 mb-4">
                            Track the status of your raised disputes
                        </p>
                        <button className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition">
                            View Disputes →
                        </button>
                    </div>

                    {/* Verification Status */}
                    <div
                        onClick={() => {
                            fetchUserData();
                            fetchStats();
                        }}
                        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition transform hover:scale-105"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Verification</h3>
                            <div className="text-3xl">✓</div>
                        </div>
                        <p className="text-purple-100 mb-4">
                            Check your verification status and documents
                        </p>
                        <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition">
                            Check Status →
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">📭</div>
                    <p>No recent activity</p>
                    <p className="text-sm">Your bookings and transactions will appear here</p>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default OwnerDashboard;
