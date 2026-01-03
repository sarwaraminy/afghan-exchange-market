import axios from 'axios';
import type { ApiResponse, AuthResponse, ExchangeRate, GoldRate, Market, Currency, News, ConversionResult, PriceAlert, User, Province, District, Hawaladar, HawaladarAccount, CustomerAccount, AccountTransaction, HawalaTransaction, HawalaReportSummary, HawalaAgentReport, HawalaCurrencyReport } from '../types';

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

export const updateProfile = async (profileData: {
  full_name?: string;
  language?: string;
  preferred_market_id?: number;
  preferred_currency_id?: number;
  current_password?: string;
  new_password?: string;
}): Promise<User> => {
  const { data } = await api.put<ApiResponse<User>>('/auth/profile', profileData);
  return data.data!;
};

export const uploadProfilePicture = async (file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('picture', file);
  const { data } = await api.post<ApiResponse<User>>('/auth/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data.data!;
};

export const deleteProfilePicture = async (): Promise<User> => {
  const { data } = await api.delete<ApiResponse<User>>('/auth/profile/picture');
  return data.data!;
};

// Helper to get profile picture URL
export const getProfilePictureUrl = (filename?: string): string | null => {
  if (!filename) return null;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Remove /api from the URL if present
  const baseUrl = apiUrl.replace(/\/api$/, '');
  // Use filename hash as cache key (changes when file changes)
  return `${baseUrl}/uploads/profiles/${filename}`;
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

// ==================== HAWALA ====================

// Hawaladars (Agents)
export const getHawaladars = async (activeOnly = false): Promise<Hawaladar[]> => {
  const params = activeOnly ? { active_only: 'true' } : {};
  const { data } = await api.get<ApiResponse<Hawaladar[]>>('/hawala/agents', { params });
  return data.data!;
};

export const getHawaladarById = async (id: number): Promise<Hawaladar> => {
  const { data } = await api.get<ApiResponse<Hawaladar>>(`/hawala/agents/${id}`);
  return data.data!;
};

export const createHawaladar = async (hawaladarData: {
  name: string;
  name_fa?: string;
  name_ps?: string;
  phone?: string;
  location: string;
  location_fa?: string;
  location_ps?: string;
  commission_rate?: number;
}): Promise<Hawaladar> => {
  const { data } = await api.post<ApiResponse<Hawaladar>>('/hawala/agents', hawaladarData);
  return data.data!;
};

export const updateHawaladar = async (id: number, hawaladarData: Partial<Hawaladar>): Promise<Hawaladar> => {
  const { data } = await api.put<ApiResponse<Hawaladar>>(`/hawala/agents/${id}`, hawaladarData);
  return data.data!;
};

export const deleteHawaladar = async (id: number): Promise<void> => {
  await api.delete(`/hawala/agents/${id}`);
};

// Hawala Transactions
export const getHawalaTransactions = async (params?: {
  status?: string;
  sender_hawaladar_id?: number;
  receiver_hawaladar_id?: number;
  limit?: number;
  offset?: number;
}): Promise<{ transactions: HawalaTransaction[]; total: number }> => {
  const { data } = await api.get<ApiResponse<{ transactions: HawalaTransaction[]; total: number }>>('/hawala/transactions', { params });
  return data.data!;
};

export const getHawalaTransactionById = async (id: number): Promise<HawalaTransaction> => {
  const { data } = await api.get<ApiResponse<HawalaTransaction>>(`/hawala/transactions/${id}`);
  return data.data!;
};

export const getHawalaTransactionByCode = async (code: string): Promise<HawalaTransaction> => {
  const { data } = await api.get<ApiResponse<HawalaTransaction>>(`/hawala/transactions/code/${code}`);
  return data.data!;
};

export const createHawalaTransaction = async (transactionData: {
  sender_name: string;
  sender_phone?: string;
  sender_hawaladar_id?: number;
  receiver_name: string;
  receiver_phone?: string;
  receiver_hawaladar_id?: number;
  amount: number;
  currency_id: number;
  commission_rate?: number;
  notes?: string;
}): Promise<HawalaTransaction> => {
  const { data } = await api.post<ApiResponse<HawalaTransaction>>('/hawala/transactions', transactionData);
  return data.data!;
};

export const updateHawalaTransaction = async (id: number, transactionData: Partial<{
  sender_name: string;
  sender_phone?: string;
  sender_hawaladar_id?: number;
  receiver_name: string;
  receiver_phone?: string;
  receiver_hawaladar_id?: number;
  amount: number;
  currency_id: number;
  commission_rate?: number;
  notes?: string;
}>): Promise<HawalaTransaction> => {
  const { data } = await api.put<ApiResponse<HawalaTransaction>>(`/hawala/transactions/${id}`, transactionData);
  return data.data!;
};

export const updateHawalaTransactionStatus = async (id: number, status: 'pending' | 'in_transit' | 'completed' | 'cancelled'): Promise<HawalaTransaction> => {
  const { data } = await api.put<ApiResponse<HawalaTransaction>>(`/hawala/transactions/${id}/status`, { status });
  return data.data!;
};

export const deleteHawalaTransaction = async (id: number): Promise<void> => {
  await api.delete(`/hawala/transactions/${id}`);
};

// Hawala Reports
export const getHawalaReportsSummary = async (): Promise<{ summary: HawalaReportSummary; recent_transactions: HawalaTransaction[] }> => {
  const { data } = await api.get<ApiResponse<{ summary: HawalaReportSummary; recent_transactions: HawalaTransaction[] }>>('/hawala/reports/summary');
  return data.data!;
};

export const getHawalaReportsByAgent = async (): Promise<HawalaAgentReport[]> => {
  const { data } = await api.get<ApiResponse<HawalaAgentReport[]>>('/hawala/reports/by-agent');
  return data.data!;
};

export const getHawalaReportsByCurrency = async (): Promise<HawalaCurrencyReport[]> => {
  const { data } = await api.get<ApiResponse<HawalaCurrencyReport[]>>('/hawala/reports/by-currency');
  return data.data!;
};

// ==================== LOCATIONS ====================

// Provinces
export const getProvinces = async (): Promise<Province[]> => {
  const { data } = await api.get<ApiResponse<Province[]>>('/locations/provinces');
  return data.data!;
};

export const getProvinceById = async (id: number): Promise<Province> => {
  const { data } = await api.get<ApiResponse<Province>>(`/locations/provinces/${id}`);
  return data.data!;
};

export const createProvince = async (provinceData: {
  name: string;
  name_fa?: string;
  name_ps?: string;
  code?: string;
}): Promise<Province> => {
  const { data } = await api.post<ApiResponse<Province>>('/locations/provinces', provinceData);
  return data.data!;
};

export const updateProvince = async (id: number, provinceData: Partial<Province>): Promise<Province> => {
  const { data } = await api.put<ApiResponse<Province>>(`/locations/provinces/${id}`, provinceData);
  return data.data!;
};

export const deleteProvince = async (id: number): Promise<void> => {
  await api.delete(`/locations/provinces/${id}`);
};

// Districts
export const getDistricts = async (provinceId?: number): Promise<District[]> => {
  const params = provinceId ? { province_id: provinceId } : {};
  const { data } = await api.get<ApiResponse<District[]>>('/locations/districts', { params });
  return data.data!;
};

export const getDistrictById = async (id: number): Promise<District> => {
  const { data } = await api.get<ApiResponse<District>>(`/locations/districts/${id}`);
  return data.data!;
};

export const createDistrict = async (districtData: {
  province_id: number;
  name: string;
  name_fa?: string;
  name_ps?: string;
  code?: string;
}): Promise<District> => {
  const { data} = await api.post<ApiResponse<District>>('/locations/districts', districtData);
  return data.data!;
};

export const updateDistrict = async (id: number, districtData: Partial<District>): Promise<District> => {
  const { data } = await api.put<ApiResponse<District>>(`/locations/districts/${id}`, districtData);
  return data.data!;
};

export const deleteDistrict = async (id: number): Promise<void> => {
  await api.delete(`/locations/districts/${id}`);
};

// ==================== ACCOUNTS ====================

// Customer Account
export const getCustomerAccount = async (): Promise<CustomerAccount> => {
  const { data } = await api.get<ApiResponse<CustomerAccount>>('/accounts/customer');
  return data.data!;
};

export const createCustomerAccount = async (currency_id: number): Promise<CustomerAccount> => {
  const { data } = await api.post<ApiResponse<CustomerAccount>>('/accounts/customer', { currency_id });
  return data.data!;
};

export const customerDeposit = async (amount: number, notes?: string): Promise<{ transaction: AccountTransaction; new_balance: number }> => {
  const { data } = await api.post<ApiResponse<{ transaction: AccountTransaction; new_balance: number }>>('/accounts/customer/deposit', { amount, notes });
  return data.data!;
};

export const customerWithdraw = async (amount: number, notes?: string): Promise<{ transaction: AccountTransaction; new_balance: number }> => {
  const { data } = await api.post<ApiResponse<{ transaction: AccountTransaction; new_balance: number }>>('/accounts/customer/withdraw', { amount, notes });
  return data.data!;
};

export const getCustomerTransactions = async (limit?: number, offset?: number): Promise<AccountTransaction[]> => {
  const params = { ...(limit && { limit }), ...(offset && { offset }) };
  const { data } = await api.get<ApiResponse<AccountTransaction[]>>('/accounts/customer/transactions', { params });
  return data.data!;
};

// Hawaladar Account (Admin only)
export const getHawaladarAccount = async (hawaladarId: number): Promise<HawaladarAccount> => {
  const { data } = await api.get<ApiResponse<HawaladarAccount>>(`/accounts/hawaladar/${hawaladarId}`);
  return data.data!;
};

export const createHawaladarAccount = async (hawaladarId: number, currencyId: number, initialBalance?: number): Promise<HawaladarAccount> => {
  const { data } = await api.post<ApiResponse<HawaladarAccount>>('/accounts/hawaladar', {
    hawaladar_id: hawaladarId,
    currency_id: currencyId,
    initial_balance: initialBalance
  });
  return data.data!;
};

export const hawaladarDeposit = async (hawaladarId: number, amount: number, notes?: string): Promise<{ transaction: AccountTransaction; new_balance: number }> => {
  const { data } = await api.post<ApiResponse<{ transaction: AccountTransaction; new_balance: number }>>(`/accounts/hawaladar/${hawaladarId}/deposit`, { amount, notes });
  return data.data!;
};

export const hawaladarWithdraw = async (hawaladarId: number, amount: number, notes?: string): Promise<{ transaction: AccountTransaction; new_balance: number }> => {
  const { data } = await api.post<ApiResponse<{ transaction: AccountTransaction; new_balance: number }>>(`/accounts/hawaladar/${hawaladarId}/withdraw`, { amount, notes });
  return data.data!;
};

export const getHawaladarTransactions = async (hawaladarId: number, limit?: number, offset?: number): Promise<AccountTransaction[]> => {
  const params = { ...(limit && { limit }), ...(offset && { offset }) };
  const { data } = await api.get<ApiResponse<AccountTransaction[]>>(`/accounts/hawaladar/${hawaladarId}/transactions`, { params });
  return data.data!;
};

// Transfers
export const transferBetweenAccounts = async (transferData: {
  from_account_type: 'hawaladar' | 'customer';
  from_account_id: number;
  to_account_type: 'hawaladar' | 'customer';
  to_account_id: number;
  amount: number;
  notes?: string;
}): Promise<{ from_account: { id: number; new_balance: number }; to_account: { id: number; new_balance: number } }> => {
  const { data } = await api.post<ApiResponse<{ from_account: { id: number; new_balance: number }; to_account: { id: number; new_balance: number } }>>('/accounts/transfer', transferData);
  return data.data!;
};

export default api;
