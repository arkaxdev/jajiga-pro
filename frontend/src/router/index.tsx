import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Pages
import HomePage from '@/pages/HomePage';
import SearchPage from '@/pages/SearchPage';
import ListingDetailPage from '@/pages/ListingDetailPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Guest Route Component (redirect if authenticated)
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'listing/:id',
        element: <ListingDetailPage />,
      },
      {
        path: 'about',
        element: <div>درباره ما</div>,
      },
      {
        path: 'contact',
        element: <div>تماس با ما</div>,
      },
      {
        path: 'privacy',
        element: <div>حریم خصوصی</div>,
      },
      {
        path: 'terms',
        element: <div>شرایط استفاده</div>,
      },
    ],
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <div>داشبورد مهمان</div>,
      },
      {
        path: 'bookings',
        element: <div>رزروهای من</div>,
      },
      {
        path: 'favorites',
        element: <div>علاقه‌مندی‌ها</div>,
      },
      {
        path: 'messages',
        element: <div>پیام‌ها</div>,
      },
      {
        path: 'profile',
        element: <div>پروفایل</div>,
      },
    ],
  },
  {
    path: '/host',
    element: (
      <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <div>داشبورد میزبان</div>,
      },
      {
        path: 'listings',
        element: <div>اقامتگاه‌های من</div>,
      },
      {
        path: 'listings/new',
        element: <div>ثبت اقامتگاه جدید</div>,
      },
      {
        path: 'listings/:id/edit',
        element: <div>ویرایش اقامتگاه</div>,
      },
      {
        path: 'bookings',
        element: <div>رزروهای میزبان</div>,
      },
      {
        path: 'earnings',
        element: <div>درآمد من</div>,
      },
      {
        path: 'become-host',
        element: <div>میزبان شوید</div>,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <div>داشبورد ادمین</div>,
      },
      {
        path: 'users',
        element: <div>مدیریت کاربران</div>,
      },
      {
        path: 'listings',
        element: <div>مدیریت اقامتگاه‌ها</div>,
      },
      {
        path: 'bookings',
        element: <div>مدیریت رزروها</div>,
      },
      {
        path: 'payments',
        element: <div>مدیریت پرداخت‌ها</div>,
      },
      {
        path: 'reports',
        element: <div>گزارش‌ها</div>,
      },
      {
        path: 'settings',
        element: <div>تنظیمات</div>,
      },
    ],
  },
  {
    path: '*',
    element: <div>صفحه مورد نظر یافت نشد</div>,
  },
]);
