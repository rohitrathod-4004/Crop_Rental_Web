import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';

function AllFarmersPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
        fetchFarmers();
    }, []);

    const fetchFarmers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users', { params: { role: 'FARMER' } });
            setFarmers(response.data.users || []);
            setError('');
        } catch (err) {
            console.error('Error fetching farmers:', err);
            setError(err.message || 'Failed to load farmers');
        } finally {
            setLoading(false);
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
                    All Farmers 👨‍🌾
                </h1>
                <p className="text-gray-600">
                    View all registered farmers
                </p>
            </div>

            {/* Content */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl font-semibold text-gray-800">Loading farmers...</h3>
                </div>
            ) : error ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchFarmers}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        Retry
                    </button>
                </div>
            ) : farmers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        No Farmers Found
                    </h3>
                    <p className="text-gray-600">No farmers have registered yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {farmers.map(farmer => (
                        <div key={farmer._id} className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                                        {farmer.name}
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="text-gray-600 flex items-center gap-2">
                                            <span>📧</span> {farmer.email}
                                        </p>
                                        <p className="text-gray-600 flex items-center gap-2">
                                            <span>📞</span> {farmer.phone}
                                        </p>
                                        <p className="text-gray-600 flex items-center gap-2">
                                            <span>📅</span> Registered: {new Date(farmer.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${farmer.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {farmer.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-700 text-center">
                            Showing <span className="font-medium">{farmers.length}</span> farmers
                        </p>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default AllFarmersPage;
