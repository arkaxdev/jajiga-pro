import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Home, Sparkles, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/utils/format';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.city) params.append('city', searchQuery.city);
    if (searchQuery.checkIn) params.append('checkIn', searchQuery.checkIn);
    if (searchQuery.checkOut) params.append('checkOut', searchQuery.checkOut);
    if (searchQuery.guests > 1) params.append('guests', searchQuery.guests.toString());
    
    navigate(`/search?${params.toString()}`);
  };

  const popularCities = [
    { name: 'تهران', image: '/images/cities/tehran.jpg', count: 1250 },
    { name: 'اصفهان', image: '/images/cities/isfahan.jpg', count: 890 },
    { name: 'شیراز', image: '/images/cities/shiraz.jpg', count: 650 },
    { name: 'مشهد', image: '/images/cities/mashhad.jpg', count: 780 },
    { name: 'کیش', image: '/images/cities/kish.jpg', count: 420 },
    { name: 'رامسر', image: '/images/cities/ramsar.jpg', count: 380 },
  ];

  const features = [
    {
      icon: Shield,
      title: 'رزرو امن',
      description: 'پرداخت آنلاین امن و تضمین بازگشت وجه',
    },
    {
      icon: Sparkles,
      title: 'تنوع اقامتگاه',
      description: 'از ویلا و آپارتمان تا بوم‌گردی و کلبه',
    },
    {
      icon: Heart,
      title: 'میزبانان تأیید شده',
      description: 'همه میزبانان احراز هویت شده‌اند',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/hero-bg.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 container text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            اقامتگاه دلخواهت رو پیدا کن
          </h1>
          <p className="text-xl mb-8">
            بیش از ۱۰,۰۰۰ اقامتگاه در سراسر ایران
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-xl p-4 md:p-6 text-gray-900 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="کجا می‌خواهید بروید؟"
                  value={searchQuery.city}
                  onChange={(e) => setSearchQuery({ ...searchQuery, city: e.target.value })}
                  className="pr-10"
                />
              </div>
              
              <div className="relative">
                <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="date"
                  placeholder="تاریخ ورود"
                  value={searchQuery.checkIn}
                  onChange={(e) => setSearchQuery({ ...searchQuery, checkIn: e.target.value })}
                  className="pr-10"
                />
              </div>
              
              <div className="relative">
                <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="date"
                  placeholder="تاریخ خروج"
                  value={searchQuery.checkOut}
                  onChange={(e) => setSearchQuery({ ...searchQuery, checkOut: e.target.value })}
                  className="pr-10"
                />
              </div>
              
              <div className="relative">
                <Users className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="number"
                  min="1"
                  placeholder="تعداد مهمان"
                  value={searchQuery.guests}
                  onChange={(e) => setSearchQuery({ ...searchQuery, guests: parseInt(e.target.value) || 1 })}
                  className="pr-10"
                />
              </div>
            </div>
            
            <Button type="submit" size="lg" className="w-full md:w-auto mt-4">
              <Search className="ml-2 h-5 w-5" />
              جستجو
            </Button>
          </form>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">شهرهای محبوب</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCities.map((city) => (
              <div
                key={city.name}
                onClick={() => navigate(`/search?city=${city.name}`)}
                className="relative h-64 rounded-lg overflow-hidden cursor-pointer group"
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 right-4 text-white">
                  <h3 className="text-2xl font-bold mb-1">{city.name}</h3>
                  <p className="text-sm">{city.count} اقامتگاه</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">چرا جاجیگا؟</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container text-center">
          <Home className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">میزبان شوید</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            اقامتگاه خود را در جاجیگا ثبت کنید و از مزایای میزبانی بهره‌مند شوید
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/host/become-host')}
          >
            شروع میزبانی
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
