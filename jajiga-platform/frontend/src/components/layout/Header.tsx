import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Home, Heart, Calendar } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">جاجیگا</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
          <Link
            to="/search"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            جستجو
          </Link>
          {isAuthenticated && user?.role === 'HOST' && (
            <Link
              to="/host"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              پنل میزبان
            </Link>
          )}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              پنل مدیریت
            </Link>
          )}
          <Link
            to="/about"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            درباره ما
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            تماس با ما
          </Link>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center space-x-4 space-x-reverse">
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                ورود
              </Button>
              <Button onClick={() => navigate('/register')}>
                ثبت‌نام
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.mobile}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <User className="ml-2 h-4 w-4" />
                  <span>پروفایل</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard/bookings')}>
                  <Calendar className="ml-2 h-4 w-4" />
                  <span>رزروهای من</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard/favorites')}>
                  <Heart className="ml-2 h-4 w-4" />
                  <span>علاقه‌مندی‌ها</span>
                </DropdownMenuItem>
                {user?.role === 'GUEST' && (
                  <DropdownMenuItem onClick={() => navigate('/host/become-host')}>
                    <Home className="ml-2 h-4 w-4" />
                    <span>میزبان شوید</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>خروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col space-y-4 p-4">
            <Link
              to="/search"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              جستجو
            </Link>
            {isAuthenticated && user?.role === 'HOST' && (
              <Link
                to="/host"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                پنل میزبان
              </Link>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                پنل مدیریت
              </Link>
            )}
            <Link
              to="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              درباره ما
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              تماس با ما
            </Link>
            
            <div className="pt-4 border-t space-y-2">
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    ورود
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/register');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    ثبت‌نام
                  </Button>
                </>
              ) : (
                <>
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="ml-2 h-4 w-4" />
                    پروفایل
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/dashboard/bookings');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Calendar className="ml-2 h-4 w-4" />
                    رزروهای من
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/dashboard/favorites');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Heart className="ml-2 h-4 w-4" />
                    علاقه‌مندی‌ها
                  </Button>
                  {user?.role === 'GUEST' && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/host/become-host');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Home className="ml-2 h-4 w-4" />
                      میزبان شوید
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="ml-2 h-4 w-4" />
                    خروج
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
