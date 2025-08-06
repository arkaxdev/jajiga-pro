import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Public Pages
import HomePage from '@/pages/HomePage';
import SearchPage from '@/pages/SearchPage';
import ListingDetailPage from '@/pages/ListingDetailPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

// Guest Dashboard Pages
import GuestDashboard from '@/pages/guest/DashboardPage';
import MyBookings from '@/pages/guest/MyBookingsPage';
import MyFavorites from '@/pages/guest/MyFavoritesPage';
import MyMessages from '@/pages/guest/MyMessagesPage';
import MyProfile from '@/pages/guest/MyProfilePage';

// Host Dashboard Pages
import HostDashboard from '@/pages/host/DashboardPage';
import MyListings from '@/pages/host/MyListingsPage';
import CreateListing from '@/pages/host/CreateListingPage';
import EditListing from '@/pages/host/EditListingPage';
import HostBookings from '@/pages/host/BookingsPage';
import HostEarnings from '@/pages/host/EarningsPage';

// Admin Pages
import AdminDashboard from '@/pages/admin/DashboardPage';
import AdminUsers from '@/pages/admin/UsersPage';
import AdminListings from '@/pages/admin/ListingsPage';
import AdminBookings from '@/pages/admin/BookingsPage';
import AdminPayments from '@/pages/admin/PaymentsPage';
import AdminReports from '@/pages/admin/ReportsPage';
import AdminSettings from '@/pages/admin/SettingsPage';

// Other Pages
import NotFoundPage from '@/pages/NotFoundPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';

// Protected Route Component
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [] 
}: { 
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="listing/:id" element={<ListingDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Guest Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['GUEST', 'HOST']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<GuestDashboard />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="favorites" element={<MyFavorites />} />
          <Route path="messages" element={<MyMessages />} />
          <Route path="profile" element={<MyProfile />} />
        </Route>

        {/* Host Dashboard Routes */}
        <Route
          path="/host"
          element={
            <ProtectedRoute allowedRoles={['HOST']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HostDashboard />} />
          <Route path="listings" element={<MyListings />} />
          <Route path="listings/create" element={<CreateListing />} />
          <Route path="listings/:id/edit" element={<EditListing />} />
          <Route path="bookings" element={<HostBookings />} />
          <Route path="earnings" element={<HostEarnings />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Global Toast Notifications */}
      <Toaster />
    </>
  );
}

export default App;
