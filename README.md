# پلتفرم جاجیگا - سیستم رزرو اقامتگاه آنلاین

## 📋 درباره پروژه
پلتفرم جامع برای اجاره کوتاه‌مدت اقامتگاه‌ها در سراسر ایران با امکانات:
- 🏠 ثبت و مدیریت اقامتگاه توسط میزبانان
- 🔍 جستجوی پیشرفته و فیلتر اقامتگاه‌ها
- 💳 سیستم پرداخت آنلاین امن
- 💬 سیستم پیام‌رسانی داخلی
- 📊 پنل مدیریت کامل

## 🛠️ تکنولوژی‌های استفاده شده

### Frontend
- React 18 + TypeScript
- Vite (Build tool)
- TailwindCSS (Styling)
- React Router v6 (Routing)
- React Query (Data fetching)
- Zustand (State management)
- React Hook Form (Forms)
- Leaflet (Maps)

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (Database)
- Prisma (ORM)
- JWT (Authentication)
- Multer + Cloudinary (File upload)
- Socket.io (Real-time messaging)
- Nodemailer (Email)
- Zarinpal API (Payment)

## 🚀 راه‌اندازی پروژه

### پیش‌نیازها
- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm >= 9.0.0

### نصب و راه‌اندازی

1. **کلون کردن پروژه**
```bash
git clone [repository-url]
cd jajiga-platform
```

2. **نصب وابستگی‌ها**
```bash
npm install
```

3. **تنظیم متغیرهای محیطی**
- کپی فایل‌های `.env.example` در فولدرهای `frontend` و `backend`
- تنظیم مقادیر مناسب در فایل‌های `.env`

4. **راه‌اندازی دیتابیس**
```bash
cd backend
npm run db:migrate
npm run db:seed
```

5. **اجرای پروژه در حالت توسعه**
```bash
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

## 📁 ساختار پروژه

```
jajiga-platform/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   └── public/
├── backend/           # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   └── prisma/
├── shared/           # Shared types and utilities
└── database/         # Database scripts and migrations
```

## 👥 انواع کاربران

### 1. مهمان (Guest)
- جستجو و مشاهده اقامتگاه‌ها
- رزرو اقامتگاه
- مدیریت رزروها
- ارسال پیام به میزبان
- ثبت نظر و امتیاز

### 2. میزبان (Host)
- ثبت اقامتگاه جدید
- مدیریت اقامتگاه‌ها
- تأیید/رد درخواست‌های رزرو
- مشاهده گزارش درآمد
- پاسخ به پیام‌ها و نظرات

### 3. مدیر (Admin)
- مدیریت کاربران
- تأیید اقامتگاه‌های جدید
- مدیریت تراکنش‌ها
- مشاهده گزارش‌ها
- پشتیبانی

## 🔐 امنیت
- رمزنگاری با bcrypt
- احراز هویت JWT
- Rate limiting
- Input validation
- CORS protection
- SQL injection prevention

## 📱 صفحات اصلی
1. صفحه اصلی
2. نتایج جستجو
3. جزئیات اقامتگاه
4. ثبت‌نام/ورود
5. داشبورد مهمان
6. داشبورد میزبان
7. پنل ادمین

## 🤝 مشارکت
برای مشارکت در توسعه:
1. Fork کنید
2. Branch جدید بسازید
3. تغییرات را Commit کنید
4. Pull Request بفرستید

## 📄 لایسنس
MIT License
