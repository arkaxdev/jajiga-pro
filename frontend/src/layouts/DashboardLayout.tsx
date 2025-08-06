import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { 
  User, 
  Calendar, 
  Heart, 
  MessageSquare, 
  Home,
  List,
  DollarSign,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

const DashboardLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  const isHost = user?.role === 'HOST';
  
  const guestMenuItems = [
    {
      title: 'داشبورد',
      href: '/dashboard',
      icon: User,
    },
    {
      title: 'رزروهای من',
      href: '/dashboard/bookings',
      icon: Calendar,
    },
    {
      title: 'علاقه‌مندی‌ها',
      href: '/dashboard/favorites',
      icon: Heart,
    },
    {
      title: 'پیام‌ها',
      href: '/dashboard/messages',
      icon: MessageSquare,
    },
    {
      title: 'پروفایل',
      href: '/dashboard/profile',
      icon: Settings,
    },
  ];
  
  const hostMenuItems = [
    {
      title: 'داشبورد میزبان',
      href: '/host',
      icon: Home,
    },
    {
      title: 'اقامتگاه‌های من',
      href: '/host/listings',
      icon: List,
    },
    {
      title: 'رزروها',
      href: '/host/bookings',
      icon: Calendar,
    },
    {
      title: 'درآمد من',
      href: '/host/earnings',
      icon: DollarSign,
    },
  ];
  
  const menuItems = isHost ? [...guestMenuItems, ...hostMenuItems] : guestMenuItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              {/* User Info */}
              <div className="text-center mb-6 pb-6 border-b">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-500">{user?.mobile}</p>
                {isHost && (
                  <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    میزبان
                  </span>
                )}
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
                          : 'hover:bg-gray-100 text-gray-700'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
                
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors hover:bg-red-50 text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span>خروج</span>
                </button>
              </nav>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
