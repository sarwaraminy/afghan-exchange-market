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

export interface Hawaladar {
  id: number;
  name: string;
  name_fa?: string;
  name_ps?: string;
  phone?: string;
  location: string;
  location_fa?: string;
  location_ps?: string;
  commission_rate: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface HawalaTransaction {
  id: number;
  reference_code: string;
  sender_name: string;
  sender_phone?: string;
  sender_hawaladar_id?: number;
  sender_hawaladar_name?: string;
  sender_hawaladar_location?: string;
  receiver_name: string;
  receiver_phone?: string;
  receiver_hawaladar_id?: number;
  receiver_hawaladar_name?: string;
  receiver_hawaladar_location?: string;
  amount: number;
  currency_id: number;
  currency_code: string;
  currency_name: string;
  commission_rate: number;
  commission_amount: number;
  total_amount: number;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  notes?: string;
  created_by: number;
  created_by_name: string;
  completed_by?: number;
  completed_by_name?: string;
  created_at: string;
  completed_at?: string;
}

export interface HawalaReportSummary {
  total_transactions: number;
  pending_count: number;
  in_transit_count: number;
  completed_count: number;
  cancelled_count: number;
  total_amount: number;
  total_commission: number;
  completed_amount: number;
  completed_commission: number;
}

export interface HawalaAgentReport {
  id: number;
  name: string;
  location: string;
  sent_count: number;
  received_count: number;
  sent_amount: number;
  received_amount: number;
  commission_earned: number;
}

export interface HawalaCurrencyReport {
  id: number;
  code: string;
  name: string;
  transaction_count: number;
  total_amount: number;
  total_commission: number;
  completed_amount: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
