export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  full_name?: string;
  role: 'user' | 'admin';
  language: 'en' | 'fa' | 'ps';
  preferred_market_id?: number;
  preferred_currency_id?: number;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface Market {
  id: number;
  name: string;
  name_fa?: string;
  name_ps?: string;
  location?: string;
  is_active: number;
  created_at: string;
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
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export interface ExchangeRateWithDetails extends ExchangeRate {
  market_name: string;
  currency_code: string;
  currency_name: string;
  flag_code?: string;
  change_percent?: number;
}

export interface GoldRate {
  id: number;
  type: string;
  price_afn: number;
  price_usd: number;
  previous_price_afn?: number;
  previous_price_usd?: number;
  unit: string;
  updated_by?: number;
  created_at: string;
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
  author_id?: number;
  created_at: string;
  updated_at: string;
}

export interface UserFavorite {
  id: number;
  user_id: number;
  currency_id: number;
  created_at: string;
}

export interface PriceAlert {
  id: number;
  user_id: number;
  currency_id: number;
  target_rate: number;
  alert_type: 'above' | 'below';
  is_active: number;
  triggered_at?: string;
  created_at: string;
}

export interface Province {
  id: number;
  name: string;
  name_fa?: string;
  name_ps?: string;
  code?: string;
  created_at: string;
}

export interface District {
  id: number;
  province_id: number;
  name: string;
  name_fa?: string;
  name_ps?: string;
  code?: string;
  created_at: string;
}

export interface Hawaladar {
  id: number;
  name: string;
  name_fa?: string;
  name_ps?: string;
  phone?: string;
  province_id?: number;
  district_id?: number;
  location: string;
  location_fa?: string;
  location_ps?: string;
  commission_rate: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface HawaladarWithLocation extends Hawaladar {
  province_name?: string;
  district_name?: string;
}

export interface SarafAccount {
  id: number;
  saraf_id: number;
  cash_balance: number;
  currency_id: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  tazkira_number: string;
  phone: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerSavings {
  id: number;
  customer_id: number;
  saraf_id: number;
  balance: number;
  currency_id: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerSavingsWithDetails extends CustomerSavings {
  first_name: string;
  last_name: string;
  tazkira_number: string;
  phone: string;
  currency_code: string;
  currency_name: string;
  saraf_name: string;
}

export interface AccountTransaction {
  id: number;
  account_type: 'saraf_cash' | 'customer_savings';
  account_id: number;
  transaction_type: 'deposit' | 'withdraw' | 'transfer_in' | 'transfer_out' | 'hawala_send' | 'hawala_receive';
  amount: number;
  balance_before: number;
  balance_after: number;
  currency_id: number;
  reference_id?: number;
  notes?: string;
  created_by: number;
  created_at: string;
}

export interface AccountTransactionWithDetails extends AccountTransaction {
  currency_code: string;
  created_by_name: string;
}

export interface HawalaTransaction {
  id: number;
  reference_code: string;
  sender_name: string;
  sender_phone?: string;
  sender_hawaladar_id?: number;
  receiver_name: string;
  receiver_phone?: string;
  receiver_hawaladar_id?: number;
  amount: number;
  currency_id: number;
  commission_rate: number;
  commission_amount: number;
  total_amount: number;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  notes?: string;
  sender_account_transaction_id?: number;
  receiver_account_transaction_id?: number;
  created_by: number;
  completed_by?: number;
  created_at: string;
  completed_at?: string;
}

export interface HawalaTransactionWithDetails extends HawalaTransaction {
  sender_hawaladar_name?: string;
  sender_hawaladar_location?: string;
  receiver_hawaladar_name?: string;
  receiver_hawaladar_location?: string;
  currency_code: string;
  currency_name: string;
  created_by_name: string;
  completed_by_name?: string;
}

export interface JwtPayload {
  userId: number;
  role: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
