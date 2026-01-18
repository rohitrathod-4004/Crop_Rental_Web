import { Link } from 'react-router-dom';

/**
 * EquipmentCard Component
 * Reusable card for displaying equipment in grid
 */
function EquipmentCard({ equipment }) {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:scale-105">
            {/* Image */}
            <div className="relative h-48 bg-gray-200">
                {equipment.images && equipment.images.length > 0 ? (
                    <img
                        src={equipment.images[0]}
                        alt={equipment.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x300?text=Equipment';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-6xl">🚜</div>
                    </div>
                )}
                {/* Type Badge */}
                <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                        {equipment.type}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Name */}
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                    {equipment.name}
                </h3>

                {/* Location */}
                <div className="flex items-center text-gray-600 text-sm mb-3">
                    <span className="mr-1">📍</span>
                    <span className="line-clamp-1">{equipment.location.address}</span>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-2xl font-bold text-green-600">
                            ₹{equipment.pricing.hourlyRate}
                            <span className="text-sm text-gray-500 font-normal">/hour</span>
                        </p>
                        <p className="text-sm text-gray-500">
                            ₹{equipment.pricing.dailyRate}/day
                        </p>
                    </div>
                </div>

                {/* View Details Button */}
                <Link
                    to={`/equipment/${equipment._id}`}
                    className="block w-full text-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
}

export default EquipmentCard;
