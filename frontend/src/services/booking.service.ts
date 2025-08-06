import { apiClient } from './api';
import { Booking, ApiResponse, PaginatedResponse, BookingFormData, Message } from '@/types';

interface CheckAvailabilityResponse {
  isAvailable: boolean;
  conflicts?: Array<{
    checkIn: string;
    checkOut: string;
  }>;
}

interface PriceCalculation {
  nights: number;
  basePrice: number;
  extraGuestFee: number;
  weekendNights: number;
  weekendExtraCharge: number;
  serviceFee: number;
  totalPrice: number;
  breakdown: Array<{
    date: string;
    price: number;
    isWeekend: boolean;
    isHoliday: boolean;
  }>;
}

export const bookingService = {
  // Check availability
  checkAvailability: async (data: {
    listingId: string;
    checkIn: string;
    checkOut: string;
    guestCount: number;
  }) => {
    const response = await apiClient.post<ApiResponse<CheckAvailabilityResponse>>('/bookings/check-availability', data);
    return response.data;
  },

  // Calculate price
  calculatePrice: async (data: {
    listingId: string;
    checkIn: string;
    checkOut: string;
    guestCount: number;
  }) => {
    const response = await apiClient.post<ApiResponse<PriceCalculation>>('/bookings/calculate-price', data);
    return response.data;
  },

  // Create booking
  create: async (data: BookingFormData) => {
    const response = await apiClient.post<ApiResponse<Booking>>('/bookings', data);
    return response.data;
  },

  // Get booking by ID
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data;
  },

  // Get my bookings (guest)
  getMyBookings: async (filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>(`/bookings/my/bookings?${params}`);
    return response.data;
  },

  // Get host bookings
  getHostBookings: async (filters?: {
    listingId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.listingId) params.append('listingId', filters.listingId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>(`/bookings/host/bookings?${params}`);
    return response.data;
  },

  // Update booking status (host)
  updateStatus: async (id: string, status: 'CONFIRMED' | 'REJECTED', reason?: string) => {
    const response = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, {
      status,
      reason,
    });
    return response.data;
  },

  // Cancel booking
  cancel: async (id: string, reason: string) => {
    const response = await apiClient.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`, {
      reason,
    });
    return response.data;
  },

  // Get booking messages
  getMessages: async (bookingId: string) => {
    const response = await apiClient.get<ApiResponse<Message[]>>(`/bookings/${bookingId}/messages`);
    return response.data;
  },

  // Send message for booking
  sendMessage: async (bookingId: string, content: string) => {
    const response = await apiClient.post<ApiResponse<Message>>(`/bookings/${bookingId}/messages`, {
      content,
    });
    return response.data;
  },
};
