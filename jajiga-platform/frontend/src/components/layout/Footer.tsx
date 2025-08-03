import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">درباره جاجیگا</h3>
            <p className="text-sm leading-relaxed">
              جاجیگا پلتفرم رزرو آنلاین اقامتگاه در سراسر ایران است. ما بهترین تجربه اقامت را برای مسافران و میزبانان فراهم می‌کنیم.
            </p>
            <div className="flex space-x-4 space-x-reverse mt-4">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">دسترسی سریع</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="text-sm hover:text-white transition-colors">
                  جستجوی اقامتگاه
                </Link>
              </li>
              <li>
                <Link to="/host/become-host" className="text-sm hover:text-white transition-colors">
                  میزبان شوید
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-white transition-colors">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-white transition-colors">
                  تماس با ما
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm hover:text-white transition-colors">
                  حریم خصوصی
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm hover:text-white transition-colors">
                  شرایط استفاده
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">شهرهای محبوب</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search?city=تهران" className="text-sm hover:text-white transition-colors">
                  تهران
                </Link>
              </li>
              <li>
                <Link to="/search?city=اصفهان" className="text-sm hover:text-white transition-colors">
                  اصفهان
                </Link>
              </li>
              <li>
                <Link to="/search?city=شیراز" className="text-sm hover:text-white transition-colors">
                  شیراز
                </Link>
              </li>
              <li>
                <Link to="/search?city=مشهد" className="text-sm hover:text-white transition-colors">
                  مشهد
                </Link>
              </li>
              <li>
                <Link to="/search?city=کیش" className="text-sm hover:text-white transition-colors">
                  کیش
                </Link>
              </li>
              <li>
                <Link to="/search?city=رامسر" className="text-sm hover:text-white transition-colors">
                  رامسر
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">تماس با ما</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 space-x-reverse">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">۰۲۱-۱۲۳۴۵۶۷۸</span>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">info@jajiga.com</span>
              </li>
              <li className="flex items-start space-x-3 space-x-reverse">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  تهران، خیابان ولیعصر، پلاک ۱۲۳
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {currentYear} جاجیگا. تمامی حقوق محفوظ است.
            </p>
            <div className="flex items-center space-x-4 space-x-reverse mt-4 md:mt-0">
              <img
                src="/images/enamad.png"
                alt="نماد اعتماد الکترونیکی"
                className="h-16"
              />
              <img
                src="/images/samandehi.png"
                alt="نماد ساماندهی"
                className="h-16"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
