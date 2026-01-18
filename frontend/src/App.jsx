import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Protected Pages
import FarmerDashboard from './pages/FarmerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Owner Pages
import MyEquipmentPage from './pages/MyEquipmentPage';
import OwnerBookingsPage from './pages/OwnerBookingsPage';
import AddEquipmentPage from './pages/AddEquipmentPage';

// Equipment Pages
import EquipmentListPage from './pages/EquipmentListPage';
import EquipmentDetailsPage from './pages/EquipmentDetailsPage';

// Booking Pages
import BookingCreatePage from './pages/BookingCreatePage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailsPage from './pages/BookingDetailsPage';

// Payment Pages
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';

// Admin Pages
import PendingOwnersPage from './pages/PendingOwnersPage';
import AllUsersPage from './pages/AllUsersPage';
import AllOwnersPage from './pages/AllOwnersPage';
import AllFarmersPage from './pages/AllFarmersPage';
import AdminDisputesPage from './pages/AdminDisputesPage';
import DisputeCreatePage from './pages/DisputeCreatePage';
import MyDisputesPage from './pages/MyDisputesPage';
import DisputeDetailsPage from './pages/DisputeDetailsPage';

function App() {
    return (
        <Router>
            <div className="app">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* Farmer Routes */}
                    <Route
                        path="/farmer/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['FARMER']}>
                                <FarmerDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Equipment Routes (Accessible to Farmers) */}
                    <Route
                        path="/equipment"
                        element={
                            <ProtectedRoute allowedRoles={['FARMER']}>
                                <EquipmentListPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/equipment/:id"
                        element={
                            <ProtectedRoute allowedRoles={['FARMER']}>
                                <EquipmentDetailsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Booking Routes (Accessible to Farmers) */}
                    <Route
                        path="/equipment/:id/book"
                        element={
                            <ProtectedRoute allowedRoles={['FARMER']}>
                                <BookingCreatePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/farmer/bookings"
                        element={
                            <ProtectedRoute allowedRoles={['FARMER']}>
                                <MyBookingsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/farmer/bookings/:id"
                        element={
                            <ProtectedRoute allowedRoles={['FARMER']}>
                                <BookingDetailsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Payment Routes (Accessible to Farmers) */}
                    <Route
                        path="/payment"
                        element={
                            <ProtectedRoute allowedRoles={['FARMER']}>
                                <PaymentPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment/success"
                        element={
                            <ProtectedRoute allowedRoles={['FARMER']}>
                                <PaymentSuccessPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment/failed"
                        element={
                            <ProtectedRoute allowedRoles={['FARMER']}>
                                <PaymentFailedPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Owner Routes */}
                    <Route
                        path="/owner/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['OWNER']}>
                                <OwnerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/equipment"
                        element={
                            <ProtectedRoute allowedRoles={['OWNER']}>
                                <MyEquipmentPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/bookings"
                        element={
                            <ProtectedRoute allowedRoles={['OWNER']}>
                                <OwnerBookingsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/bookings/:id"
                        element={
                            <ProtectedRoute allowedRoles={['OWNER']}>
                                <BookingDetailsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/equipment/add"
                        element={
                            <ProtectedRoute allowedRoles={['OWNER']}>
                                <AddEquipmentPage />
                            </ProtectedRoute>
                        }
                    />


                    {/* Admin Routes */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/disputes"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AdminDisputesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/owners/pending"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <PendingOwnersPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AllUsersPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/owners"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AllOwnersPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/farmers"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AllFarmersPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Dispute Routes - General */}
                    <Route
                        path="/disputes/my"
                        element={
                            <ProtectedRoute allowedRoles={['FARMER', 'OWNER']}>
                                <MyDisputesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/disputes/create/:bookingId"
                        element={
                            <ProtectedRoute allowedRoles={['FARMER', 'OWNER']}>
                                <DisputeCreatePage />
                            </ProtectedRoute>
                        }
                    />
                    {/* Dispute Details - Accessible to all roles (authorization check inside page) */}
                    <Route
                        path="/disputes/:id"
                        element={
                            <ProtectedRoute allowedRoles={['FARMER', 'OWNER', 'ADMIN']}>
                                <DisputeDetailsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all - redirect to landing */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
