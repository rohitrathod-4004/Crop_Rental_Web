import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';

function AddEquipmentPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Tractor',
        description: '',
        hourlyRate: '',
        dailyRate: '',
        address: '',
        latitude: '',
        longitude: ''
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Geocode address to get lat/lng
    const handleGeocodeAddress = async () => {
        if (!formData.address.trim()) {
            alert('Please enter an address first');
            return;
        }

        try {
            setGeocoding(true);
            // Using OpenStreetMap Nominatim API (free, no API key needed)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                setFormData({
                    ...formData,
                    latitude: data[0].lat,
                    longitude: data[0].lon
                });
                alert(`✓ Location found!\\nLat: ${data[0].lat}\\nLng: ${data[0].lon}`);
            } else {
                alert('Location not found. Please check the address.');
            }
        } catch (err) {
            console.error('Geocoding error:', err);
            alert('Failed to geocode address. You can enter coordinates manually.');
        } finally {
            setGeocoding(false);
        }
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (files.length + images.length > 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        // Create previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
        setImages([...images, ...files]);
    };

    // Remove image
    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate coordinates
        if (!formData.latitude || !formData.longitude) {
            alert('Please geocode the address or enter coordinates manually');
            return;
        }

        try {
            setLoading(true);

            // Upload images to Cloudinary
            const uploadedImageUrls = [];

            for (const imageFile of images) {
                const imageFormData = new FormData();
                imageFormData.append('image', imageFile);

                try {
                    const uploadResponse = await api.post('/upload', imageFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    if (uploadResponse.data && uploadResponse.data.url) {
                        uploadedImageUrls.push(uploadResponse.data.url);
                    }
                } catch (uploadError) {
                    console.error('Failed to upload image:', uploadError);
                    // Continue with other images or handle error as needed
                }
            }

            const imageUrls = uploadedImageUrls;

            await api.post('/equipment', {
                name: formData.name,
                type: formData.type,
                description: formData.description,
                pricing: {
                    hourlyRate: parseFloat(formData.hourlyRate),
                    dailyRate: parseFloat(formData.dailyRate)
                },
                location: {
                    lat: parseFloat(formData.latitude),
                    lng: parseFloat(formData.longitude),
                    address: formData.address
                },
                images: imageUrls
            });

            alert('Equipment added successfully!');
            navigate('/owner/equipment');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add equipment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout user={user}>
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/owner/equipment')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium mb-4"
                >
                    <span>←</span> Back to My Equipment
                </button>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Add Equipment 🚜
                </h1>
                <p className="text-gray-600">
                    List your equipment for rental
                </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-md p-8 max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Equipment Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Equipment Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                            placeholder="e.g., John Deere 5075E Tractor"
                        />
                    </div>

                    {/* Equipment Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Equipment Type *
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                        >
                            <option value="Tractor">Tractor</option>
                            <option value="Harvester">Harvester</option>
                            <option value="Plough">Plough</option>
                            <option value="Seeder">Seeder</option>
                            <option value="Sprayer">Sprayer</option>
                            <option value="Thresher">Thresher</option>
                            <option value="Cultivator">Cultivator</option>
                            <option value="Rotavator">Rotavator</option>
                            <option value="Water Pump">Water Pump</option>
                            <option value="Trailer">Trailer</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                            placeholder="Describe your equipment, its features, and condition..."
                        />
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hourly Rate (₹) *
                            </label>
                            <input
                                type="number"
                                name="hourlyRate"
                                value={formData.hourlyRate}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                                placeholder="500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Daily Rate (₹) *
                            </label>
                            <input
                                type="number"
                                name="dailyRate"
                                value={formData.dailyRate}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                                placeholder="3000"
                            />
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 Location</h3>

                        {/* Address */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                                    placeholder="e.g., Pune, Maharashtra, India"
                                />
                                <button
                                    type="button"
                                    onClick={handleGeocodeAddress}
                                    disabled={geocoding}
                                    className={`px-6 py-2 rounded-lg font-medium transition ${geocoding
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    {geocoding ? '🔄 Finding...' : '📍 Get Coordinates'}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Click "Get Coordinates" to automatically fetch latitude & longitude
                            </p>
                        </div>

                        {/* Coordinates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Latitude *
                                </label>
                                <input
                                    type="number"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    required
                                    step="any"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                                    placeholder="18.5204"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Longitude *
                                </label>
                                <input
                                    type="number"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    required
                                    step="any"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                                    placeholder="73.8567"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Images Section */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📷 Equipment Images</h3>

                        {/* Image Upload */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Images (Max 5)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Supported formats: JPG, PNG, GIF. Max 5 images.
                            </p>
                        </div>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/owner/equipment')}
                            className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-3 rounded-lg font-medium transition ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                        >
                            {loading ? 'Adding...' : '✓ Add Equipment'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

export default AddEquipmentPage;
