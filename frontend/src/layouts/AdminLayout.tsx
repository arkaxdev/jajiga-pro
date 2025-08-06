import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { 
  LayoutDashboard,
  Users,
  Home,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/utils/cn';

const AdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  const menuItems = [
    {
      title: 'داشبورد',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      title: 'کاربران',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'اقامتگاه‌ها',
      href: '/admin/listings',
      icon: Home,
    },
    {
      title: 'رزروها',
      href: '/admin/bookings',
      icon: Calendar,
    },
    {
      title: 'پرداخت‌ها',
      href: '/admin/payments',
      icon: DollarSign,
    },
    {
      title: 'گزارش‌ها',
      href: '/admin/reports',
      icon: FileText,
    },
    {
      title: 'تنظیمات',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white min-h-screen">
          <div className="p-6">
            <Link to="/" className="flex items-center space-x-2 space-x-reverse mb-8">
              <ChevronLeft className="h-5 w-5" />
              <span className="text-xl font-bold">پنل مدیریت جاجیگا</span>
            </Link>
            
            {/* Admin Info */}
            <div className="mb-8 pb-8 border-b border-gray-800">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-400">مدیر سیستم</p>
                </div>
              </div>
            </div>
            
            {/* Menu */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-800 text-gray-300'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
              
              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors hover:bg-red-600 text-gray-300 hover:text-white mt-8"
              >
                <LogOut className="h-5 w-5" />
                <span>خروج</span>
              </button>
            </nav>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1">
          {/* Top Bar */}
          <header className="bg-white shadow-sm border-b">
            <div className="px-8 py-4">
              <h1 className="text-2xl font-semibold text-gray-800">
                {menuItems.find(item => item.href === location.pathname)?.title || 'پنل مدیریت'}
              </h1>
            </div>
          </header>
          
          {/* Page Content */}
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
