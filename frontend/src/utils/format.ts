import { format, formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';

// Format price with Persian numerals and thousand separators
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fa-IR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Format price with currency
export const formatCurrency = (price: number): string => {
  return `${formatPrice(price)} تومان`;
};

// Format date to Persian
export const formatDate = (date: string | Date, formatStr = 'dd MMMM yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: faIR });
};

// Format relative time
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { locale: faIR, addSuffix: true });
};

// Convert English numbers to Persian
export const toPersianNumbers = (str: string | number): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.toString().replace(/[0-9]/g, (w) => persianNumbers[+w]);
};

// Convert Persian numbers to English
export const toEnglishNumbers = (str: string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let result = str;
  for (let i = 0; i < persianNumbers.length; i++) {
    result = result.replace(new RegExp(persianNumbers[i], 'g'), i.toString());
  }
  return result;
};

// Format mobile number
export const formatMobile = (mobile: string): string => {
  // Remove all non-digit characters
  const cleaned = mobile.replace(/\D/g, '');
  
  // Format as 0912 345 6789
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return mobile;
};

// Format area (square meters)
export const formatArea = (area: number): string => {
  return `${formatPrice(area)} متر مربع`;
};

// Format guest count
export const formatGuestCount = (count: number): string => {
  return `${toPersianNumbers(count)} ${count === 1 ? 'نفر' : 'نفر'}`;
};

// Format night count
export const formatNightCount = (nights: number): string => {
  return `${toPersianNumbers(nights)} شب`;
};

// Format rating
export const formatRating = (rating: number): string => {
  return toPersianNumbers(rating.toFixed(1));
};

// Get listing type label
export const getListingTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    VILLA: 'ویلا',
    APARTMENT: 'آپارتمان',
    COTTAGE: 'کلبه',
    ECOTOURISM: 'بوم‌گردی',
    TRADITIONAL: 'سنتی',
    SUITE: 'سوئیت',
  };
  return types[type] || type;
};

// Get booking status label
export const getBookingStatusLabel = (status: string): string => {
  const statuses: Record<string, string> = {
    PENDING: 'در انتظار تأیید',
    CONFIRMED: 'تأیید شده',
    CANCELLED: 'لغو شده',
    COMPLETED: 'تکمیل شده',
    REJECTED: 'رد شده',
  };
  return statuses[status] || status;
};

// Get payment status label
export const getPaymentStatusLabel = (status: string): string => {
  const statuses: Record<string, string> = {
    PENDING: 'در انتظار پرداخت',
    PARTIAL: 'پرداخت جزئی',
    COMPLETED: 'پرداخت شده',
    REFUNDED: 'بازپرداخت شده',
  };
  return statuses[status] || status;
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Get initials from name
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};
