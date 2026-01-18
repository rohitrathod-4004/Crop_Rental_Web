import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

function FarmerDashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Get user from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    return (
        <DashboardLayout user={user}>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-gray-600">
                    Find and rent agricultural equipment for your farm
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Active Bookings</p>
                            <p className="text-3xl font-bold text-gray-800">0</p>
                        </div>
                        <div className="text-4xl">📋</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Completed</p>
                            <p className="text-3xl font-bold text-gray-800">0</p>
                        </div>
                        <div className="text-4xl">✅</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Spent</p>
                            <p className="text-3xl font-bold text-gray-800">₹0</p>
                        </div>
                        <div className="text-4xl">💰</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Browse Equipment */}
                    <Link
                        to="/equipment"
                        className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition transform hover:scale-105 block"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Browse Equipment</h3>
                            <div className="text-3xl">🚜</div>
                        </div>
                        <p className="text-green-100 mb-4">
                            Find tractors, harvesters, and more equipment available for rent
                        </p>
                        <div className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition inline-block">
                            Explore Now →
                        </div>
                    </Link>

                    {/* My Bookings */}
                    <Link
                        to="/farmer/bookings"
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition transform hover:scale-105 block"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">My Bookings</h3>
                            <div className="text-3xl">📅</div>
                        </div>
                        <p className="text-blue-100 mb-4">
                            View and manage your current and past equipment bookings
                        </p>
                        <div className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition inline-block">
                            View Bookings →
                        </div>
                    </Link>

                    {/* My Disputes */}
                    <Link
                        to="/disputes/my"
                        className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition transform hover:scale-105 block"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">My Disputes</h3>
                            <div className="text-3xl">⚠️</div>
                        </div>
                        <p className="text-red-100 mb-4">
                            Track the status of your raised disputes
                        </p>
                        <div className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition inline-block">
                            View Disputes →
                        </div>
                    </Link>
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

export default FarmerDashboard;
