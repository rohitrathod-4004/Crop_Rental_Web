import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getEquipmentById } from '../services/equipmentService';

function EquipmentDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    });

    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch equipment details from backend
    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                console.log('Fetching equipment with ID:', id);
                setLoading(true);
                const response = await getEquipmentById(id);
                console.log('Equipment response:', response);
                console.log('Equipment data:', response.data);
                setEquipment(response.data.equipment);
                setError('');
            } catch (err) {
                console.error('Error fetching equipment:', err);
                console.error('Error response:', err.response);
                console.error('Error data:', err.response?.data);
                const errorMessage = err.response?.data?.message || err.message || 'Equipment not found';
                setError(errorMessage);
                setEquipment(null);
            } finally {
                setLoading(false);
            }
        };
        fetchEquipment();
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout user={user}>
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">⏳</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Loading equipment details...
                    </h2>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !equipment) {
        return (
            <DashboardLayout user={user}>
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Equipment Not Found
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {error || "The equipment you're looking for doesn't exist."}
                    </p>
                    <Link
                        to="/equipment"
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        Browse Equipment
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    // Safety wrapper - provide defaults for all nested properties
    const safeEquipment = {
        ...equipment,
        images: equipment.images || [],
        location: equipment.location || { address: 'Location not specified', lat: 0, lng: 0 },
        pricing: equipment.pricing || { hourlyRate: 0, dailyRate: 0 },
        availability: equipment.availability || {
            slotDurationHours: 2,
            workingHours: { start: '09:00', end: '18:00' }
        },
        ownerId: equipment.ownerId || { name: 'Unknown', phone: 'N/A' }
    };

    return (
        <DashboardLayout user={user}>
            {/* Back Button */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                    <span>←</span> Back
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {/* Image */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                        {safeEquipment.images && safeEquipment.images.length > 0 ? (
                            <img
                                src={safeEquipment.images[0]}
                                alt={safeEquipment.name || 'Equipment'}
                                className="w-full h-96 object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/800x400?text=Equipment+Image';
                                }}
                            />
                        ) : (
                            <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-8xl mb-4">🚜</div>
                                    <p className="text-gray-500">No image available</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Details Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        {/* Title and Type */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                    {safeEquipment.name || 'Equipment'}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                        {safeEquipment.type || 'N/A'}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                        ✓ Verified Owner
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-gray-600 mb-6">
                            <span className="text-xl mr-2">📍</span>
                            <span className="text-lg">{safeEquipment.location?.address || 'Location not specified'}</span>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-3">
                                Description
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                {safeEquipment.description}
                            </p>
                        </div>

                        {/* Specifications */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">
                                Specifications
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="text-2xl">⏰</span>
                                    <div>
                                        <p className="text-sm text-gray-500">Slot Duration</p>
                                        <p className="font-semibold text-gray-800">
                                            {safeEquipment.availability.slotDuration} minutes
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="text-2xl">🕐</span>
                                    <div>
                                        <p className="text-sm text-gray-500">Working Hours</p>
                                        <p className="font-semibold text-gray-800">
                                            {safeEquipment.availability.workingHours.start} - {safeEquipment.availability.workingHours.end}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    {/* Pricing Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6 sticky top-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Pricing
                        </h2>

                        {/* Hourly Rate */}
                        <div className="mb-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                            <p className="text-sm text-gray-600 mb-1">Hourly Rate</p>
                            <p className="text-3xl font-bold text-green-600">
                                ₹{safeEquipment.pricing.hourlyRate}
                                <span className="text-lg text-gray-500 font-normal">/hour</span>
                            </p>
                        </div>

                        {/* Daily Rate */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                            <p className="text-sm text-gray-600 mb-1">Daily Rate</p>
                            <p className="text-3xl font-bold text-blue-600">
                                ₹{safeEquipment.pricing.dailyRate}
                                <span className="text-lg text-gray-500 font-normal">/day</span>
                            </p>
                        </div>

                        {/* Book Now Button */}
                        <Link
                            to={`/equipment/${safeEquipment._id}/book`}
                            className="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition mb-3 text-center"
                        >
                            Book Now
                        </Link>

                        <p className="text-xs text-gray-500 text-center">
                            Secure booking with payment protection
                        </p>
                    </div>

                    {/* Owner Info Card */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Owner Information
                        </h2>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                                👤
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">
                                    {safeEquipment.ownerId?.name || 'Owner'}
                                </p>
                                <p className="text-sm text-green-600">
                                    ✓ Verified Owner
                                </p>
                            </div>
                        </div>

                        {/* Contact Owner */}
                        <div className="border-t pt-4">
                            <p className="text-gray-600 mb-2">Contact Owner</p>
                            <div className="flex items-center gap-2 text-gray-800 font-medium">
                                <span>📞</span>
                                <span>{safeEquipment.ownerId?.phone || 'Not available'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 mt-3">
                            <span className="text-xl">📍</span>
                            <span>{safeEquipment.location.address}</span>
                        </div>

                        <button className="w-full mt-4 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition">
                            Contact Owner
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default EquipmentDetailsPage;

