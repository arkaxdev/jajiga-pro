import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { toast } from '@/components/ui/use-toast';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = localStorage.getItem('auth-token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Handle specific error statuses
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('auth-token');
          window.location.href = '/login';
          break;
        case 403:
          toast({
            title: 'دسترسی ممنوع',
            description: 'شما دسترسی به این بخش را ندارید',
            variant: 'destructive',
          });
          break;
        case 404:
          toast({
            title: 'یافت نشد',
            description: 'مورد درخواستی یافت نشد',
            variant: 'destructive',
          });
          break;
        case 422:
          // Validation error - handled by individual requests
          break;
        case 500:
          toast({
            title: 'خطای سرور',
            description: 'خطایی در سرور رخ داده است',
            variant: 'destructive',
          });
          break;
        default:
          toast({
            title: 'خطا',
            description: error.response.data?.message || 'خطایی رخ داده است',
            variant: 'destructive',
          });
      }
    } else if (error.request) {
      // Network error
      toast({
        title: 'خطای شبکه',
        description: 'لطفا اتصال اینترنت خود را بررسی کنید',
        variant: 'destructive',
      });
    }
    
    return Promise.reject(error);
  }
);

// Helper functions for common HTTP methods
export const apiClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    api.get<T>(url, config),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.post<T>(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.put<T>(url, data, config),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.patch<T>(url, data, config),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    api.delete<T>(url, config),
};

// Set auth token
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('auth-token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth-token');
  }
};

export default api;
