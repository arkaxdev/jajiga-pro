# راهنمای نصب و راه‌اندازی پلتفرم جاجیگا

## پیش‌نیازها

- Node.js (نسخه 18 یا بالاتر)
- PostgreSQL (نسخه 14 یا بالاتر)
- Git
- حساب Cloudinary برای آپلود تصاویر
- حساب زرین‌پال برای پرداخت آنلاین (اختیاری)

## مراحل نصب

### 1. کلون کردن پروژه

```bash
git clone <repository-url>
cd jajiga-platform
```

### 2. نصب وابستگی‌ها

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### 3. تنظیمات محیطی (Environment Variables)

#### Backend (.env)
در پوشه `backend` فایل `.env` بسازید:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/jajiga_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# SMS Service (Kavenegar)
KAVENEGAR_API_KEY="your-kavenegar-api-key"

# Payment Gateway (ZarinPal)
ZARINPAL_MERCHANT_ID="your-merchant-id"
ZARINPAL_SANDBOX=true

# Frontend URL
FRONTEND_URL="http://localhost:5173"
```

#### Frontend (.env)
در پوشه `frontend` فایل `.env` بسازید:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. راه‌اندازی دیتابیس

```bash
cd backend

# ایجاد دیتابیس
npx prisma db push

# اجرای seed (داده‌های اولیه)
npx prisma db seed
```

### 5. اجرای پروژه

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd frontend
npm run dev
```

## دسترسی به پروژه

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- API Documentation: http://localhost:5000/api-docs

## حساب‌های تستی

### ادمین
- موبایل: 09123456789
- رمز عبور: admin123

### میزبان
- موبایل: 09123456788
- رمز عبور: host123

### مهمان
- موبایل: 09123456787
- رمز عبور: guest123

## ساختار پروژه

```
jajiga-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/    # کنترلرها
│   │   ├── routes/        # مسیرها
│   │   ├── middleware/    # میان‌افزارها
│   │   ├── services/      # سرویس‌ها
│   │   ├── utils/         # توابع کمکی
│   │   └── index.ts       # نقطه ورود
│   ├── prisma/
│   │   └── schema.prisma  # مدل دیتابیس
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # کامپوننت‌ها
│   │   ├── pages/        # صفحات
│   │   ├── layouts/      # قالب‌ها
│   │   ├── services/     # سرویس‌های API
│   │   ├── store/        # State Management
│   │   ├── utils/        # توابع کمکی
│   │   └── App.tsx       # کامپوننت اصلی
│   └── package.json
└── README.md
```

## دستورات مفید

### Backend

```bash
# اجرای سرور توسعه
npm run dev

# ساخت برای production
npm run build

# اجرای production
npm start

# مدیریت دیتابیس
npx prisma studio        # رابط گرافیکی دیتابیس
npx prisma migrate dev   # ایجاد migration
npx prisma db push      # اعمال تغییرات
```

### Frontend

```bash
# اجرای سرور توسعه
npm run dev

# ساخت برای production
npm run build

# پیش‌نمایش build
npm run preview

# بررسی کد
npm run lint
```

## رفع مشکلات رایج

### خطای اتصال به دیتابیس
- مطمئن شوید PostgreSQL در حال اجرا است
- اطلاعات اتصال در `.env` را بررسی کنید
- دیتابیس را با `npx prisma db push` ایجاد کنید

### خطای CORS
- مطمئن شوید `FRONTEND_URL` در backend `.env` درست است
- پورت‌های frontend و backend را بررسی کنید

### خطای آپلود تصویر
- اطلاعات Cloudinary در `.env` را بررسی کنید
- از اتصال اینترنت مطمئن شوید

## توسعه

### اضافه کردن مدل جدید
1. مدل را در `prisma/schema.prisma` اضافه کنید
2. `npx prisma db push` را اجرا کنید
3. کنترلر و روت مربوطه را ایجاد کنید

### اضافه کردن صفحه جدید
1. کامپوننت صفحه را در `frontend/src/pages` ایجاد کنید
2. روت را در `frontend/src/router/index.tsx` اضافه کنید
3. لینک منو را در هدر یا سایدبار اضافه کنید

## Deploy

### Backend (Heroku)
```bash
heroku create jajiga-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET="your-secret"
# سایر environment variables
git push heroku main
```

### Frontend (Vercel)
```bash
vercel
# دستورالعمل‌ها را دنبال کنید
# Environment variables را تنظیم کنید
```

## مشارکت

برای مشارکت در پروژه:
1. Fork کنید
2. Branch جدید ایجاد کنید
3. تغییرات را Commit کنید
4. Pull Request ارسال کنید

## لایسنس

این پروژه تحت لایسنس MIT است.
