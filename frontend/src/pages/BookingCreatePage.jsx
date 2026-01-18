import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getEquipmentById } from '../services/equipmentService';
import { createBooking } from '../services/bookingService';

function BookingCreatePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    });

    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        bookingType: 'RENTAL',
        date: '',
        startTime: '',
        endTime: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch equipment details
    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                setLoading(true);
                const response = await getEquipmentById(id);
                setEquipment(response.data.equipment);
                setError('');
            } catch (err) {
                console.error('Error fetching equipment:', err);
                setError(err.message || 'Equipment not found');
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
                    <h2 className="text-2xl font-bold text-gray-800">Loading...</h2>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !equipment) {
        return (
            <DashboardLayout user={user}>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-800">Equipment Not Found</h2>
                </div>
            </DashboardLayout>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const calculatePricing = () => {
        if (!formData.startTime || !formData.endTime) {
            return { hours: 0, baseAmount: 0, travelCost: 0, totalAmount: 0 };
        }

        const start = new Date(`2000-01-01T${formData.startTime}`);
        const end = new Date(`2000-01-01T${formData.endTime}`);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return { hours: 0, baseAmount: 0, travelCost: 0, totalAmount: 0 };
        }

        let hours = (end - start) / (1000 * 60 * 60);

        if (hours <= 0) return { hours: 0, baseAmount: 0, travelCost: 0, totalAmount: 0 };

        // Round up to 2 decimal places for pricing
        hours = Math.round(hours * 100) / 100;

        const baseAmount = Math.round(hours * equipment.pricing.hourlyRate);
        const travelCost = formData.bookingType === 'SERVICE' ? 200 : 0;
        const totalAmount = baseAmount + travelCost;

        return { hours, baseAmount, travelCost, totalAmount };
    };

    const pricing = calculatePricing();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.startTime) newErrors.startTime = 'Start time is required';
        if (!formData.endTime) newErrors.endTime = 'End time is required';

        if (formData.startTime && formData.endTime) {
            const start = new Date(`2000-01-01T${formData.startTime}`);
            const end = new Date(`2000-01-01T${formData.endTime}`);
            if (end <= start) {
                newErrors.endTime = 'End time must be after start time';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Create booking via API
        try {
            setIsSubmitting(true);

            // Combine date and time for backend
            const requestedStartTime = new Date(`${formData.date}T${formData.startTime}`);
            const requestedEndTime = new Date(`${formData.date}T${formData.endTime}`);

            const bookingData = {
                equipmentId: equipment._id,
                bookingType: formData.bookingType,
                requestedStartTime: requestedStartTime.toISOString(),
                requestedEndTime: requestedEndTime.toISOString()
            };

            const response = await createBooking(bookingData);
            const booking = response.data.booking;

            // Navigate to payment page with booking details
            navigate('/payment', {
                state: {
                    bookingData: {
                        equipmentName: equipment.name,
                        equipmentType: equipment.type,
                        equipmentImage: equipment.images && equipment.images.length > 0 ? equipment.images[0] : null,
                        bookingType: formData.bookingType,
                        date: formData.date,
                        startTime: formData.startTime,
                        endTime: formData.endTime,
                        location: equipment.location.address,
                        ownerName: equipment.ownerId?.name || 'Owner',
                        pricing: {
                            baseAmount: booking.pricing.baseAmount,
                            travelCost: booking.pricing.travelCost || 0,
                            totalAmount: booking.pricing.totalAmount
                        }
                    },
                    bookingId: booking._id
                }
            });
        } catch (err) {
            console.error('Error creating booking:', err);
            alert(err.message || 'Failed to create booking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout user={user}>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium mb-4"
                >
                    <span>←</span> Back
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Create Booking</h1>
                <p className="text-gray-600">Fill in the details to book this equipment</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Equipment Summary Card */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Equipment Summary</h2>
                            <div className="flex gap-4">
                                {equipment.images && equipment.images.length > 0 ? (
                                    <img
                                        src={equipment.images[0]}
                                        alt={equipment.name}
                                        className="w-24 h-24 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/100x100?text=Equipment';
                                        }}
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <span className="text-3xl">🚜</span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">{equipment.name}</h3>
                                    <p className="text-sm text-gray-600">{equipment.type}</p>
                                    <p className="text-sm text-gray-600">📍 {equipment.location.address}</p>
                                    <p className="text-sm font-semibold text-green-600 mt-1">
                                        ₹{equipment.pricing.hourlyRate}/hour
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Booking Type */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Type</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${formData.bookingType === 'RENTAL'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                    } `}>
                                    <input
                                        type="radio"
                                        name="bookingType"
                                        value="RENTAL"
                                        checked={formData.bookingType === 'RENTAL'}
                                        onChange={handleChange}
                                        className="mr-3"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-800">Rental</p>
                                        <p className="text-sm text-gray-600">Equipment only</p>
                                    </div>
                                </label>

                                <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${formData.bookingType === 'SERVICE'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                    } `}>
                                    <input
                                        type="radio"
                                        name="bookingType"
                                        value="SERVICE"
                                        checked={formData.bookingType === 'SERVICE'}
                                        onChange={handleChange}
                                        className="mr-3"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-800">Service</p>
                                        <p className="text-sm text-gray-600">With operator (+₹200)</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Date & Time</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-4 py-2 border ${errors.date ? 'border-red-500' : 'border-gray-300'
                                            } rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white`}
                                    />
                                    {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                                </div>

                                {/* Start Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border ${errors.startTime ? 'border-red-500' : 'border-gray-300'
                                            } rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white`}
                                    />
                                    {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
                                </div>

                                {/* End Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border ${errors.endTime ? 'border-red-500' : 'border-gray-300'
                                            } rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white`}
                                    />
                                    {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
                                </div>
                            </div>

                            {/* Working Hours Info */}
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <span className="font-semibold">Working Hours:</span> {equipment.availability.workingHours.start} - {equipment.availability.workingHours.end}
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3 px-4 text-white font-semibold rounded-lg transition ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {isSubmitting ? 'Sending Request...' : 'Request Slot'}
                        </button>
                    </form>
                </div>

                {/* Pricing Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Pricing Breakdown</h2>

                        {pricing.hours > 0 ? (
                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Duration:</span>
                                    <span className="font-semibold">{pricing.hours} hours</span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Hourly Rate:</span>
                                    <span className="font-semibold">₹{equipment.pricing.hourlyRate}/hr</span>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-gray-600 mb-2">
                                        <span>Base Amount:</span>
                                        <span className="font-semibold">₹{pricing.baseAmount}</span>
                                    </div>

                                    {formData.bookingType === 'SERVICE' && (
                                        <div className="flex justify-between text-gray-600 mb-2">
                                            <span>Travel Cost:</span>
                                            <span className="font-semibold">₹{pricing.travelCost}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-800">Total:</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            ₹{pricing.totalAmount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">Select date and time to see pricing</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default BookingCreatePage;
