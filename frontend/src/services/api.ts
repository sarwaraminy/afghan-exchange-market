import axios from 'axios';
import type { ApiResponse, AuthResponse, ExchangeRate, GoldRate, Market, Currency, News, ConversionResult, PriceAlert, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
  return data.data!;
};

export const register = async (userData: { username: string; email: string; password: string; full_name?: string; language?: string; preferred_market_id?: number; preferred_currency_id?: number }): Promise<AuthResponse> => {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
  return data.data!;
};

export const getProfile = async (): Promise<User> => {
  const { data } = await api.get<ApiResponse<User>>('/auth/profile');
  return data.data!;
};

export const updateProfile = async (profileData: { full_name?: string; language?: string; current_password?: string; new_password?: string }): Promise<User> => {
  const { data } = await api.put<ApiResponse<User>>('/auth/profile', profileData);
  return data.data!;
};

// Rates
export const getMarkets = async (): Promise<Market[]> => {
  const { data } = await api.get<ApiResponse<Market[]>>('/rates/markets');
  return data.data!;
};

export const getCurrencies = async (): Promise<Currency[]> => {
  const { data } = await api.get<ApiResponse<Currency[]>>('/rates/currencies');
  return data.data!;
};

export const getExchangeRates = async (marketId?: number): Promise<ExchangeRate[]> => {
  const params = marketId ? { market_id: marketId } : {};
  const { data } = await api.get<ApiResponse<ExchangeRate[]>>('/rates/exchange', { params });
  return data.data!;
};

export const getGoldRates = async (): Promise<GoldRate[]> => {
  const { data } = await api.get<ApiResponse<GoldRate[]>>('/rates/gold');
  return data.data!;
};

export const convert = async (from: string, to: string, amount: number, marketId?: number): Promise<ConversionResult> => {
  const params = { from, to, amount, ...(marketId && { market_id: marketId }) };
  const { data } = await api.get<ApiResponse<ConversionResult>>('/rates/convert', { params });
  return data.data!;
};

// Admin - Rates
export const updateExchangeRate = async (id: number, buy_rate: number, sell_rate: number): Promise<void> => {
  await api.put(`/rates/exchange/${id}`, { buy_rate, sell_rate });
};

export const createExchangeRate = async (market_id: number, currency_id: number, buy_rate: number, sell_rate: number): Promise<{ id: number }> => {
  const { data } = await api.post<ApiResponse<{ id: number }>>('/rates/exchange', { market_id, currency_id, buy_rate, sell_rate });
  return data.data!;
};

export const deleteExchangeRate = async (id: number): Promise<void> => {
  await api.delete(`/rates/exchange/${id}`);
};

export const updateGoldRate = async (id: number, price_afn: number, price_usd: number): Promise<void> => {
  await api.put(`/rates/gold/${id}`, { price_afn, price_usd });
};

export const createGoldRate = async (type: string, price_afn: number, price_usd: number, unit?: string): Promise<{ id: number }> => {
  const { data } = await api.post<ApiResponse<{ id: number }>>('/rates/gold', { type, price_afn, price_usd, unit });
  return data.data!;
};

export const deleteGoldRate = async (id: number): Promise<void> => {
  await api.delete(`/rates/gold/${id}`);
};

export const createMarket = async (name: string, name_fa?: string, name_ps?: string, location?: string): Promise<{ id: number }> => {
  const { data } = await api.post<ApiResponse<{ id: number }>>('/rates/markets', { name, name_fa, name_ps, location });
  return data.data!;
};

export const createCurrency = async (code: string, name: string, name_fa?: string, name_ps?: string, symbol?: string, flag_code?: string): Promise<{ id: number }> => {
  const { data } = await api.post<ApiResponse<{ id: number }>>('/rates/currencies', { code, name, name_fa, name_ps, symbol, flag_code });
  return data.data!;
};

// News
export const getNews = async (category?: string, limit = 10, offset = 0): Promise<{ news: News[]; total: number }> => {
  const params = { ...(category && { category }), limit, offset };
  const { data } = await api.get<ApiResponse<{ news: News[]; total: number }>>('/news', { params });
  return data.data!;
};

export const getNewsById = async (id: number): Promise<News> => {
  const { data } = await api.get<ApiResponse<News>>(`/news/${id}`);
  return data.data!;
};

export const getAllNews = async (limit = 50, offset = 0): Promise<{ news: News[]; total: number }> => {
  const { data } = await api.get<ApiResponse<{ news: News[]; total: number }>>('/news/admin/all', { params: { limit, offset } });
  return data.data!;
};

export const createNews = async (newsData: Partial<News>): Promise<{ id: number }> => {
  const { data } = await api.post<ApiResponse<{ id: number }>>('/news', newsData);
  return data.data!;
};

export const updateNews = async (id: number, newsData: Partial<News>): Promise<void> => {
  await api.put(`/news/${id}`, newsData);
};

export const deleteNews = async (id: number): Promise<void> => {
  await api.delete(`/news/${id}`);
};

// User
export const getFavorites = async (): Promise<Currency[]> => {
  const { data } = await api.get<ApiResponse<Currency[]>>('/user/favorites');
  return data.data!;
};

export const addFavorite = async (currency_id: number): Promise<void> => {
  await api.post('/user/favorites', { currency_id });
};

export const removeFavorite = async (currency_id: number): Promise<void> => {
  await api.delete(`/user/favorites/${currency_id}`);
};

export const getAlerts = async (): Promise<PriceAlert[]> => {
  const { data } = await api.get<ApiResponse<PriceAlert[]>>('/user/alerts');
  return data.data!;
};

export const createAlert = async (currency_id: number, target_rate: number, alert_type: 'above' | 'below'): Promise<void> => {
  await api.post('/user/alerts', { currency_id, target_rate, alert_type });
};

export const updateAlert = async (id: number, data: { target_rate?: number; alert_type?: string; is_active?: boolean }): Promise<void> => {
  await api.put(`/user/alerts/${id}`, data);
};

export const deleteAlert = async (id: number): Promise<void> => {
  await api.delete(`/user/alerts/${id}`);
};

export const getDashboard = async (): Promise<{ favorites_count: number; active_alerts_count: number; recent_rates: ExchangeRate[] }> => {
  const { data } = await api.get<ApiResponse<{ favorites_count: number; active_alerts_count: number; recent_rates: ExchangeRate[] }>>('/user/dashboard');
  return data.data!;
};

// Admin - Users
export const getAllUsers = async (): Promise<User[]> => {
  const { data } = await api.get<ApiResponse<User[]>>('/admin/users');
  return data.data!;
};

export const createUser = async (userData: {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  role?: string;
  language?: string;
  preferred_market_id?: number;
  preferred_currency_id?: number;
}): Promise<User> => {
  const { data } = await api.post<ApiResponse<User>>('/admin/users', userData);
  return data.data!;
};

export const updateUser = async (id: number, userData: Partial<User> & { password?: string }): Promise<User> => {
  const { data } = await api.put<ApiResponse<User>>(`/admin/users/${id}`, userData);
  return data.data!;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/admin/users/${id}`);
};

export default api;
