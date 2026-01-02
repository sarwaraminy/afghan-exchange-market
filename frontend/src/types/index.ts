export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: 'user' | 'admin';
  language: 'en' | 'fa' | 'ps';
  preferred_market_id?: number;
  preferred_currency_id?: number;
  profile_picture?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Market {
  id: number;
  name: string;
  name_fa?: string;
  name_ps?: string;
  location?: string;
  is_active: number;
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  name_fa?: string;
  name_ps?: string;
  symbol?: string;
  flag_code?: string;
  is_active: number;
}

export interface ExchangeRate {
  id: number;
  market_id: number;
  currency_id: number;
  buy_rate: number;
  sell_rate: number;
  previous_buy_rate?: number;
  previous_sell_rate?: number;
  market_name: string;
  currency_code: string;
  currency_name: string;
  flag_code?: string;
  change_percent?: number;
  updated_at: string;
}

export interface GoldRate {
  id: number;
  type: string;
  price_afn: number;
  price_usd: number;
  previous_price_afn?: number;
  previous_price_usd?: number;
  unit: string;
  updated_at: string;
}

export interface News {
  id: number;
  title: string;
  title_fa?: string;
  title_ps?: string;
  content: string;
  content_fa?: string;
  content_ps?: string;
  category: string;
  image_url?: string;
  is_published: number;
  author_name?: string;
  created_at: string;
}

export interface PriceAlert {
  id: number;
  currency_id: number;
  target_rate: number;
  alert_type: 'above' | 'below';
  is_active: number;
  code: string;
  name: string;
}

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
