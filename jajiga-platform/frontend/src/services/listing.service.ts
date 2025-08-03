import { apiClient } from './api';
import { Listing, ApiResponse, PaginatedResponse, SearchFilters, ListingFormData } from '@/types';

interface ListingStats {
  totalViews: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  occupancyRate: number;
}

interface AvailabilityDate {
  date: string;
  isAvailable: boolean;
  price?: number;
}

export const listingService = {
  // Search listings
  search: async (filters: SearchFilters, page = 1, limit = 20) => {
    const params = new URLSearchParams();
    
    if (filters.city) params.append('city', filters.city);
    if (filters.checkIn) params.append('checkIn', filters.checkIn);
    if (filters.checkOut) params.append('checkOut', filters.checkOut);
    if (filters.guests) params.append('guests', filters.guests.toString());
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.type?.length) params.append('type', filters.type.join(','));
    if (filters.amenities?.length) params.append('amenities', filters.amenities.join(','));
    if (filters.instantBooking !== undefined) params.append('instantBooking', filters.instantBooking.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Listing>>>(`/listings/search?${params}`);
    return response.data;
  },

  // Get all listings
  getAll: async (page = 1, limit = 20) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Listing>>>(`/listings?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get single listing
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Listing>>(`/listings/${id}`);
    return response.data;
  },

  // Get my listings (host)
  getMyListings: async (page = 1, limit = 20) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Listing>>>(`/listings/my/listings?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Create listing
  create: async (data: ListingFormData) => {
    const response = await apiClient.post<ApiResponse<Listing>>('/listings', data);
    return response.data;
  },

  // Update listing
  update: async (id: string, data: Partial<ListingFormData>) => {
    const response = await apiClient.put<ApiResponse<Listing>>(`/listings/${id}`, data);
    return response.data;
  },

  // Delete listing
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/listings/${id}`);
    return response.data;
  },

  // Toggle listing status
  toggleStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    const response = await apiClient.patch<ApiResponse<Listing>>(`/listings/${id}/status`, { status });
    return response.data;
  },

  // Upload listing images
  uploadImages: async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await apiClient.post<ApiResponse<{ images: string[] }>>(`/listings/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete listing image
  deleteImage: async (listingId: string, imageId: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/listings/${listingId}/images/${imageId}`);
    return response.data;
  },

  // Reorder listing images
  reorderImages: async (listingId: string, imageIds: string[]) => {
    const response = await apiClient.put<ApiResponse<{ message: string }>>(`/listings/${listingId}/images/reorder`, {
      imageIds,
    });
    return response.data;
  },

  // Get availability
  getAvailability: async (id: string, startDate: string, endDate: string) => {
    const response = await apiClient.get<ApiResponse<AvailabilityDate[]>>(
      `/listings/${id}/availability?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },

  // Update availability
  updateAvailability: async (id: string, dates: AvailabilityDate[]) => {
    const response = await apiClient.put<ApiResponse<{ message: string }>>(`/listings/${id}/availability`, {
      dates,
    });
    return response.data;
  },

  // Get listing stats
  getStats: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ListingStats>>(`/listings/${id}/stats`);
    return response.data;
  },

  // Add to favorites
  addToFavorites: async (listingId: string) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/users/favorites/${listingId}`);
    return response.data;
  },

  // Remove from favorites
  removeFromFavorites: async (listingId: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/users/favorites/${listingId}`);
    return response.data;
  },

  // Get favorites
  getFavorites: async () => {
    const response = await apiClient.get<ApiResponse<Listing[]>>('/users/favorites');
    return response.data;
  },
};
