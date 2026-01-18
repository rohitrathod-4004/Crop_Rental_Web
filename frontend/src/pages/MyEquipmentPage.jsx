import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';

function MyEquipmentPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const response = await api.get('/equipment/owner/my-equipment');
            setEquipment(response.data.equipment || []);
            setError('');
        } catch (err) {
            console.error('Error fetching equipment:', err);
            setError(err.message || 'Failed to load equipment');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (equipmentId, currentStatus) => {
        try {
            await api.patch(`/equipment/${equipmentId}`, {
                isActive: !currentStatus
            });
            // Refresh list
            fetchEquipment();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update equipment');
        }
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
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            My Equipment 🚜
                        </h1>
                        <p className="text-gray-600">
                            Manage your equipment listings
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/owner/equipment/add')}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        + Add Equipment
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl font-semibold text-gray-800">Loading equipment...</h3>
                </div>
            ) : error ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchEquipment}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        Retry
                    </button>
                </div>
            ) : equipment.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🚜</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        No Equipment Yet
                    </h3>
                    <p className="text-gray-600 mb-6">Start by adding your first equipment</p>
                    <button
                        onClick={() => navigate('/owner/equipment/add')}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        + Add Equipment
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {equipment.map(item => (
                        <div key={item._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                            {/* Image */}
                            <div className="h-48 bg-gray-200 relative">
                                {item.images && item.images.length > 0 ? (
                                    <img
                                        src={item.images[0]}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl">
                                        🚜
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.isActive
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-500 text-white'
                                        }`}>
                                        {item.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">
                                    {item.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {item.description}
                                </p>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Price per hour</p>
                                        <p className="text-xl font-bold text-green-600">
                                            ₹{item.pricing?.hourlyRate || 0}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Type</p>
                                        <p className="text-sm font-medium text-gray-800">
                                            {item.type}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/owner/equipment/${item._id}/edit`)}
                                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(item._id, item.isActive)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${item.isActive
                                                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                            }`}
                                    >
                                        {item.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

export default MyEquipmentPage;
