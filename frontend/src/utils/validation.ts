import * as yup from 'yup';

// Persian mobile number regex
const MOBILE_REGEX = /^09\d{9}$/;

// Persian national ID validation
const isValidNationalId = (nationalId: string): boolean => {
  if (!/^\d{10}$/.test(nationalId)) return false;
  
  const check = parseInt(nationalId[9]);
  const sum = nationalId.split('').slice(0, 9).reduce((acc, num, i) => {
    return acc + parseInt(num) * (10 - i);
  }, 0) % 11;
  
  return sum < 2 ? check === sum : check === 11 - sum;
};

// Common validation schemas
export const validationSchemas = {
  // Mobile number
  mobile: yup
    .string()
    .required('شماره موبایل الزامی است')
    .matches(MOBILE_REGEX, 'شماره موبایل معتبر نیست'),

  // Email
  email: yup
    .string()
    .email('ایمیل معتبر نیست')
    .required('ایمیل الزامی است'),

  // Password
  password: yup
    .string()
    .required('رمز عبور الزامی است')
    .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),

  // Confirm password
  confirmPassword: yup
    .string()
    .required('تکرار رمز عبور الزامی است')
    .oneOf([yup.ref('password')], 'رمز عبور و تکرار آن یکسان نیستند'),

  // Name fields
  firstName: yup
    .string()
    .required('نام الزامی است')
    .min(2, 'نام باید حداقل ۲ کاراکتر باشد'),

  lastName: yup
    .string()
    .required('نام خانوادگی الزامی است')
    .min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),

  // National ID
  nationalId: yup
    .string()
    .required('کد ملی الزامی است')
    .test('is-valid', 'کد ملی معتبر نیست', isValidNationalId),

  // OTP
  otp: yup
    .string()
    .required('کد تأیید الزامی است')
    .matches(/^\d{6}$/, 'کد تأیید باید ۶ رقم باشد'),

  // Price
  price: yup
    .number()
    .required('قیمت الزامی است')
    .positive('قیمت باید عدد مثبت باشد')
    .integer('قیمت باید عدد صحیح باشد'),

  // Required string
  requiredString: (label: string) => 
    yup.string().required(`${label} الزامی است`),

  // Required number
  requiredNumber: (label: string, min?: number) => 
    yup
      .number()
      .required(`${label} الزامی است`)
      .positive(`${label} باید عدد مثبت باشد`)
      .min(min || 0, `${label} باید حداقل ${min} باشد`),
};

// Form validation schemas
export const loginSchema = yup.object({
  mobile: validationSchemas.mobile,
  password: yup.string().when('loginMethod', {
    is: 'password',
    then: (schema) => schema.required('رمز عبور الزامی است'),
  }),
  otp: yup.string().when('loginMethod', {
    is: 'otp',
    then: (schema) => validationSchemas.otp,
  }),
});

export const registerSchema = yup.object({
  firstName: validationSchemas.firstName,
  lastName: validationSchemas.lastName,
  mobile: validationSchemas.mobile,
  email: yup.string().email('ایمیل معتبر نیست'),
  password: validationSchemas.password,
  confirmPassword: validationSchemas.confirmPassword,
  acceptTerms: yup
    .boolean()
    .required('پذیرش قوانین الزامی است')
    .oneOf([true], 'پذیرش قوانین الزامی است'),
});

export const listingSchema = yup.object({
  title: yup
    .string()
    .required('عنوان الزامی است')
    .min(10, 'عنوان باید حداقل ۱۰ کاراکتر باشد')
    .max(100, 'عنوان باید حداکثر ۱۰۰ کاراکتر باشد'),
  description: yup
    .string()
    .required('توضیحات الزامی است')
    .min(100, 'توضیحات باید حداقل ۱۰۰ کاراکتر باشد'),
  type: yup
    .string()
    .required('نوع اقامتگاه الزامی است')
    .oneOf(['VILLA', 'APARTMENT', 'COTTAGE', 'ECOTOURISM', 'TRADITIONAL', 'SUITE']),
  province: yup.string().required('استان الزامی است'),
  city: yup.string().required('شهر الزامی است'),
  address: yup.string().required('آدرس الزامی است'),
  latitude: yup
    .number()
    .required('موقعیت جغرافیایی الزامی است')
    .min(-90)
    .max(90),
  longitude: yup
    .number()
    .required('موقعیت جغرافیایی الزامی است')
    .min(-180)
    .max(180),
  area: yup
    .number()
    .required('متراژ الزامی است')
    .positive('متراژ باید عدد مثبت باشد')
    .integer('متراژ باید عدد صحیح باشد'),
  maxGuests: yup
    .number()
    .required('حداکثر تعداد مهمان الزامی است')
    .positive()
    .integer()
    .min(1, 'حداکثر تعداد مهمان باید حداقل ۱ باشد'),
  bedrooms: yup
    .number()
    .required('تعداد اتاق خواب الزامی است')
    .min(0)
    .integer(),
  beds: yup
    .number()
    .required('تعداد تخت الزامی است')
    .positive()
    .integer()
    .min(1, 'تعداد تخت باید حداقل ۱ باشد'),
  bathrooms: yup
    .number()
    .required('تعداد سرویس بهداشتی الزامی است')
    .positive()
    .integer()
    .min(1, 'تعداد سرویس بهداشتی باید حداقل ۱ باشد'),
  pricePerNight: validationSchemas.price,
  checkInTime: yup
    .string()
    .required('ساعت ورود الزامی است')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'ساعت ورود معتبر نیست'),
  checkOutTime: yup
    .string()
    .required('ساعت خروج الزامی است')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'ساعت خروج معتبر نیست'),
  amenities: yup.array().of(yup.string()),
  rules: yup.array().of(yup.string()),
});

export const bookingSchema = yup.object({
  checkIn: yup
    .date()
    .required('تاریخ ورود الزامی است')
    .min(new Date(), 'تاریخ ورود نمی‌تواند در گذشته باشد'),
  checkOut: yup
    .date()
    .required('تاریخ خروج الزامی است')
    .min(yup.ref('checkIn'), 'تاریخ خروج باید بعد از تاریخ ورود باشد'),
  guestCount: yup
    .number()
    .required('تعداد مهمان الزامی است')
    .positive()
    .integer()
    .min(1, 'تعداد مهمان باید حداقل ۱ باشد'),
  guestName: yup
    .string()
    .required('نام مهمان الزامی است')
    .min(3, 'نام مهمان باید حداقل ۳ کاراکتر باشد'),
  guestMobile: validationSchemas.mobile,
  guestEmail: yup.string().email('ایمیل معتبر نیست'),
  specialRequests: yup.string(),
});

// Validation helper functions
export const validateMobile = (mobile: string): boolean => {
  return MOBILE_REGEX.test(mobile);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateNationalId = (nationalId: string): boolean => {
  return isValidNationalId(nationalId);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('رمز عبور باید حداقل ۶ کاراکتر باشد');
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('رمز عبور باید شامل حروف انگلیسی باشد');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('رمز عبور باید شامل عدد باشد');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
