// User types
export interface User {
  id: string;
  email: string;
  mobile: string;
  firstName: string;
  lastName: string;
  role: 'GUEST' | 'HOST' | 'ADMIN';
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Listing types
export interface Listing {
  id: string;
  title: string;
  description: string;
  type: 'VILLA' | 'APARTMENT' | 'COTTAGE' | 'ECOTOURISM' | 'TRADITIONAL' | 'SUITE';
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
  province: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  area: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  pricePerNight: number;
  extraGuestFee?: number;
  weekendPricePerNight?: number;
  holidayPricePerNight?: number;
  checkInTime: string;
  checkOutTime: string;
  minStay?: number;
  maxStay?: number;
  instantBooking: boolean;
  amenities: string[];
  rules: string[];
  images: ListingImage[];
  host: User;
  rating?: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListingImage {
  id: string;
  url: string;
  publicId: string;
  order: number;
}

// Booking types
export interface Booking {
  id: string;
  listing: Listing;
  guest: User;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  guestName: string;
  guestMobile: string;
  guestEmail?: string;
  specialRequests?: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REJECTED';
  paymentStatus: 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
}

// Payment types
export interface Payment {
  id: string;
  booking: Booking;
  amount: number;
  type: 'DEPOSIT' | 'FULL_PAYMENT' | 'REFUND';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  method: 'ZARINPAL' | 'CREDIT_CARD' | 'BANK_TRANSFER';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// Review types
export interface Review {
  id: string;
  booking: Booking;
  reviewer: User;
  listing: Listing;
  cleanliness: number;
  accuracy: number;
  communication: number;
  location: number;
  checkIn: number;
  value: number;
  rating: number;
  comment: string;
  hostReply?: string;
  createdAt: string;
  updatedAt: string;
}

// Message types
export interface Message {
  id: string;
  sender: User;
  receiver: User;
  content: string;
  booking?: Booking;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

// Notification types
export interface Notification {
  id: string;
  user: User;
  type: 'BOOKING' | 'PAYMENT' | 'MESSAGE' | 'REVIEW' | 'SYSTEM';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// Search and filter types
export interface SearchFilters {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  type?: string[];
  amenities?: string[];
  instantBooking?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface LoginFormData {
  mobile: string;
  password?: string;
  otp?: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  mobile: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

export interface ListingFormData {
  title: string;
  description: string;
  type: string;
  province: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  area: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  pricePerNight: number;
  extraGuestFee?: number;
  weekendPricePerNight?: number;
  holidayPricePerNight?: number;
  checkInTime: string;
  checkOutTime: string;
  minStay?: number;
  maxStay?: number;
  instantBooking: boolean;
  amenities: string[];
  rules: string[];
}

export interface BookingFormData {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  guestName: string;
  guestMobile: string;
  guestEmail?: string;
  specialRequests?: string;
}

// Utility types
export interface SelectOption {
  value: string;
  label: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface Coordinates {
  lat: number;
  lng: number;
}
