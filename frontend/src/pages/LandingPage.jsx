import { Link } from 'react-router-dom';

function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Header */}
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
                        Agricultural Equipment
                        <span className="block text-green-600">Rental Platform</span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                        Connect farmers with equipment owners. Rent tractors, harvesters, and more.
                        Affordable, accessible, and transparent.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition transform hover:scale-105"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 bg-white hover:bg-gray-50 text-green-600 font-semibold rounded-lg shadow-lg border-2 border-green-600 transition transform hover:scale-105"
                        >
                            Sign In
                        </Link>
                    </div>

                    {/* Features */}
                    <div className="mt-20 grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="text-4xl mb-4">🚜</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                For Farmers
                            </h3>
                            <p className="text-gray-600">
                                Rent equipment easily and affordably
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="text-4xl mb-4">🔧</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                For Owners
                            </h3>
                            <p className="text-gray-600">
                                Earn by renting out your equipment
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="text-4xl mb-4">✅</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Verified & Secure
                            </h3>
                            <p className="text-gray-600">
                                All owners are verified by admins
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
