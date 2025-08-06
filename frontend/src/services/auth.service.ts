import { apiClient, setAuthToken } from './api';
import { User, ApiResponse, LoginFormData, RegisterFormData } from '@/types';

interface LoginResponse {
  user: User;
  token: string;
}

interface OtpResponse {
  message: string;
  expiresIn: number;
}

export const authService = {
  // Send OTP
  sendOtp: async (mobile: string) => {
    const response = await apiClient.post<ApiResponse<OtpResponse>>('/auth/send-otp', {
      mobile,
    });
    return response.data;
  },

  // Login with mobile and password/OTP
  login: async (data: LoginFormData) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return response.data;
  },

  // Register new user
  register: async (data: RegisterFormData) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/register', data);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get<ApiResponse<User>>('/users/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: Partial<User>) => {
    const response = await apiClient.put<ApiResponse<User>>('/users/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.put<ApiResponse<{ message: string }>>('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.post<ApiResponse<{ url: string }>>('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete avatar
  deleteAvatar: async () => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>('/users/avatar');
    return response.data;
  },

  // Become a host
  becomeHost: async (data: {
    description?: string;
    bankAccountNumber: string;
    bankAccountName: string;
  }) => {
    const response = await apiClient.post<ApiResponse<User>>('/users/become-host', data);
    return response.data;
  },

  // Logout
  logout: () => {
    setAuthToken(null);
    localStorage.removeItem('auth-storage');
  },

  // Set auth token
  setAuthToken,
};
