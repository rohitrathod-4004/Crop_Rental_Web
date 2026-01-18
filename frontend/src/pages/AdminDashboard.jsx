import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getAdminStats } from '../services/statsService';

function AdminDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Get user from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }

        // Fetch stats from backend
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await getAdminStats();
                setStats(response.data.stats);
                setError('');
            } catch (err) {
                console.error('Error fetching admin stats:', err);
                setError(err.message || 'Failed to load statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <DashboardLayout user={user}>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Admin Dashboard 🛡️
                </h1>
                <p className="text-gray-600">
                    Manage platform operations and user verifications
                </p>
            </div>

            {/* Platform Stats */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-gray-600">Loading statistics...</p>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">❌</div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Users</p>
                                <p className="text-3xl font-bold text-gray-800">{stats?.users?.total || 0}</p>
                            </div>
                            <div className="text-4xl">👥</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Pending Owners</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats?.ownerVerification?.pending || 0}</p>
                            </div>
                            <div className="text-4xl">⏳</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Farmers</p>
                                <p className="text-3xl font-bold text-gray-800">{stats?.users?.farmers || 0}</p>
                            </div>
                            <div className="text-4xl">👨‍🌾</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Owners</p>
                                <p className="text-3xl font-bold text-green-600">{stats?.users?.owners || 0}</p>
                            </div>
                            <div className="text-4xl">🚜</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Pending Owners */}
                    <div
                        onClick={() => navigate('/admin/owners/pending')}
                        className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition transform hover:scale-105"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Pending Owners</h3>
                            <div className="text-3xl">⏳</div>
                        </div>
                        <p className="text-yellow-100 mb-4">
                            Review and verify owner applications
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{stats?.ownerVerification?.pending || 0} Pending</span>
                            <button className="bg-white text-yellow-600 px-4 py-2 rounded-lg font-medium hover:bg-yellow-50 transition">
                                Review →
                            </button>
                        </div>
                    </div>

                    {/* Platform Stats */}
                    <div
                        onClick={() => alert('Platform Stats page coming soon!')}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition transform hover:scale-105"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Platform Stats</h3>
                            <div className="text-3xl">📊</div>
                        </div>
                        <p className="text-blue-100 mb-4">
                            View detailed analytics and reports
                        </p>
                        <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition">
                            View Stats →
                        </button>
                    </div>

                    {/* Disputes */}
                    <div
                        onClick={() => navigate('/admin/disputes')}
                        className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition transform hover:scale-105"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Disputes</h3>
                            <div className="text-3xl">⚠️</div>
                        </div>
                        <p className="text-red-100 mb-4">
                            Resolve conflicts between users
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{stats?.disputes?.open || 0} Open</span>
                            <button className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition">
                                Manage →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Management Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* User Management */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>👥</span> User Management
                    </h3>
                    <div className="space-y-3">
                        <div
                            onClick={() => navigate('/admin/users')}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                        >
                            <div>
                                <p className="font-medium text-gray-800">All Users</p>
                                <p className="text-sm text-gray-500">View and manage users</p>
                            </div>
                            <span className="text-gray-400">→</span>
                        </div>
                        <div
                            onClick={() => navigate('/admin/farmers')}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                        >
                            <div>
                                <p className="font-medium text-gray-800">Farmers</p>
                                <p className="text-sm text-gray-500">{stats?.users?.farmers || 0} registered</p>
                            </div>
                            <span className="text-gray-400">→</span>
                        </div>
                        <div
                            onClick={() => navigate('/admin/owners')}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                        >
                            <div>
                                <p className="font-medium text-gray-800">Owners</p>
                                <p className="text-sm text-gray-500">{stats?.users?.owners || 0} registered</p>
                            </div>
                            <span className="text-gray-400">→</span>
                        </div>
                    </div>
                </div>

                {/* Equipment Management */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>🚜</span> Equipment Management
                    </h3>
                    <div className="space-y-3">
                        <div
                            onClick={() => alert('All Equipment page coming soon!')}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                        >
                            <div>
                                <p className="font-medium text-gray-800">All Equipment</p>
                                <p className="text-sm text-gray-500">View all listings</p>
                            </div>
                            <span className="text-gray-400">→</span>
                        </div>
                        <div
                            onClick={() => alert('Active Listings page coming soon!')}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                        >
                            <div>
                                <p className="font-medium text-gray-800">Active Listings</p>
                                <p className="text-sm text-gray-500">0 active</p>
                            </div>
                            <span className="text-gray-400">→</span>
                        </div>
                        <div
                            onClick={() => alert('Inactive Listings page coming soon!')}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                        >
                            <div>
                                <p className="font-medium text-gray-800">Inactive Listings</p>
                                <p className="text-sm text-gray-500">0 inactive</p>
                            </div>
                            <span className="text-gray-400">→</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Platform Activity</h2>
                <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">📭</div>
                    <p>No recent activity</p>
                    <p className="text-sm">Platform activities will appear here</p>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default AdminDashboard;
