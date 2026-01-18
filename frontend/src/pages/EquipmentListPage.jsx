import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import EquipmentCard from '../components/EquipmentCard';
import { getAllEquipment } from '../services/equipmentService';
import { equipmentTypes } from '../utils/mockData';

function EquipmentListPage() {
    const [user, setUser] = useState(() => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    });

    const [equipment, setEquipment] = useState([]);
    const [allEquipment, setAllEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');
    const [priceRange, setPriceRange] = useState('ALL');

    // Fetch equipment from backend
    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                setLoading(true);
                const response = await getAllEquipment();
                const equipmentData = response.data.equipment || [];
                setEquipment(equipmentData);
                setAllEquipment(equipmentData);
                setError('');
            } catch (err) {
                console.error('Error fetching equipment:', err);
                setError(err.message || 'Failed to load equipment');
                setEquipment([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEquipment();
    }, []);

    // Filter equipment based on search and filters
    const filteredEquipment = equipment.filter(equipment => {
        // Search filter
        const matchesSearch = equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            equipment.location.address.toLowerCase().includes(searchQuery.toLowerCase());

        // Type filter
        const matchesType = selectedType === 'ALL' || equipment.type === selectedType;

        // Price filter
        let matchesPrice = true;
        if (priceRange === 'LOW') {
            matchesPrice = equipment.pricing.hourlyRate < 300;
        } else if (priceRange === 'MEDIUM') {
            matchesPrice = equipment.pricing.hourlyRate >= 300 && equipment.pricing.hourlyRate < 600;
        } else if (priceRange === 'HIGH') {
            matchesPrice = equipment.pricing.hourlyRate >= 600;
        }

        return matchesSearch && matchesType && matchesPrice;
    });

    return (
        <DashboardLayout user={user}>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Equipment Marketplace 🚜
                        </h1>
                        <p className="text-gray-600">
                            Browse and rent agricultural equipment
                        </p>
                    </div>
                    <Link
                        to="/farmer/dashboard"
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Equipment
                        </label>
                        <input
                            type="text"
                            placeholder="Search by name or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 bg-white"
                        />
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Equipment Type
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white text-gray-900"
                        >
                            {equipmentTypes.map(type => (
                                <option key={type} value={type}>
                                    {type === 'ALL' ? 'All Types' : type}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price Range
                        </label>
                        <select
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white text-gray-900"
                        >
                            <option value="ALL">All Prices</option>
                            <option value="LOW">Under ₹300/hr</option>
                            <option value="MEDIUM">₹300 - ₹600/hr</option>
                            <option value="HIGH">Above ₹600/hr</option>
                        </select>
                    </div>
                </div>

                {/* Active Filters Display */}
                {(searchQuery || selectedType !== 'ALL' || priceRange !== 'ALL') && (
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-600">Active filters:</span>
                        {searchQuery && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                Search: "{searchQuery}"
                            </span>
                        )}
                        {selectedType !== 'ALL' && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                Type: {selectedType}
                            </span>
                        )}
                        {priceRange !== 'ALL' && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                Price: {priceRange}
                            </span>
                        )}
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedType('ALL');
                                setPriceRange('ALL');
                            }}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className="mb-4">
                <p className="text-gray-600">
                    Showing <span className="font-semibold">{filteredEquipment.length}</span> equipment
                    {filteredEquipment.length !== allEquipment.length && (
                        <span> (filtered from {allEquipment.length} total)</span>
                    )}
                </p>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Loading equipment...
                    </h3>
                    <p className="text-gray-600">
                        Please wait while we fetch available equipment
                    </p>
                </div>
            ) : error ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Error Loading Equipment
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        Retry
                    </button>
                </div>
            ) : filteredEquipment.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEquipment.map(equipment => (
                        <EquipmentCard key={equipment._id} equipment={equipment} />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        No equipment found
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Try adjusting your filters or search query
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedType('ALL');
                            setPriceRange('ALL');
                        }}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
}

export default EquipmentListPage;
