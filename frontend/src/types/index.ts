export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: 'user' | 'admin';
  language: 'en' | 'fa' | 'ps';
  preferred_market_id?: number;
  preferred_currency_id?: number;
  hawaladar_id?: number;
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
  province_name?: string;
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
  province_name?: string;
  province_name_fa?: string;
  province_name_ps?: string;
  district_name?: string;
  district_name_fa?: string;
  district_name_ps?: string;
  location: string;
  location_fa?: string;
  location_ps?: string;
  floor_number?: string;
  shop_number?: string;
  commission_rate: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface HawaladarAccount {
  id: number;
  hawaladar_id: number;
  balance: number;
  currency_id: number;
  currency_code?: string;
  currency_name?: string;
  hawaladar_name?: string;
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

export interface CustomerAccount {
  id: number;
  customer_id: number;
  balance: number;
  currency_id: number;
  currency_code?: string;
  currency_name?: string;
  first_name?: string;
  last_name?: string;
  tazkira_number?: string;
  phone?: string;
  saraf_id: number;
  saraf_name?: string;
  saraf_name_fa?: string;
  saraf_name_ps?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountTransaction {
  id: number;
  account_type: 'hawaladar' | 'customer';
  account_id: number;
  transaction_type: 'deposit' | 'withdraw' | 'transfer_in' | 'transfer_out' | 'hawala_send' | 'hawala_receive';
  amount: number;
  balance_before: number;
  balance_after: number;
  currency_id: number;
  currency_code?: string;
  reference_id?: number;
  notes?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
}

export interface HawalaTransaction {
  id: number;
  reference_code: string;
  transaction_direction: 'outgoing' | 'incoming';
  sender_name: string;
  sender_phone?: string;
  sender_hawaladar_id?: number;
  sender_hawaladar_name?: string;
  sender_hawaladar_name_fa?: string;
  sender_hawaladar_name_ps?: string;
  sender_hawaladar_location?: string;
  sender_hawaladar_location_fa?: string;
  sender_hawaladar_location_ps?: string;
  sender_hawaladar_floor_number?: string;
  sender_hawaladar_shop_number?: string;
  sender_hawaladar_phone?: string;
  receiver_name: string;
  receiver_phone?: string;
  receiver_hawaladar_id?: number;
  receiver_hawaladar_name?: string;
  receiver_hawaladar_name_fa?: string;
  receiver_hawaladar_name_ps?: string;
  receiver_hawaladar_location?: string;
  receiver_hawaladar_location_fa?: string;
  receiver_hawaladar_location_ps?: string;
  receiver_hawaladar_floor_number?: string;
  receiver_hawaladar_shop_number?: string;
  amount: number;
  currency_id: number;
  currency_code: string;
  currency_name: string;
  commission_rate: number;
  commission_type: 'add' | 'deduct';
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
  receiver_tazkira_number?: string;
  payout_completed_by?: number;
  payout_completed_by_name?: string;
  payout_completed_at?: string;
  secret_pin?: string;
  expires_at?: string;
  linked_transaction_id?: number;
  is_origin_transaction?: number;
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
  name_fa?: string;
  name_ps?: string;
  location: string;
  location_fa?: string;
  location_ps?: string;
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

export interface HawalaNetPosition {
  hawaladar1_id: number;
  hawaladar1_name: string;
  hawaladar2_id: number;
  hawaladar2_name: string;
  currency_code: string;
  sent_to_h2: number;
  received_from_h2: number;
  net_position: number;
  debtor: string;
}

export interface HawalaUnpaidTransaction {
  id: number;
  reference_code: string;
  sender_name: string;
  receiver_name: string;
  amount: number;
  commission_amount: number;
  currency_code: string;
  sender_hawaladar_name: string;
  receiver_hawaladar_name: string;
  status: string;
  created_at: string;
  expires_at?: string;
  days_pending: number;
}

export interface HawalaCommissionReport {
  hawaladar_id: number;
  hawaladar_name: string;
  total_transactions: number;
  total_commission: number;
  currency_code: string;
}

export interface HawalaDailyCashFlow {
  date: string;
  hawaladar_id: number;
  hawaladar_name: string;
  opening_balance: number;
  cash_in: number;
  cash_out: number;
  closing_balance: number;
  transactions_in_count: number;
  transactions_out_count: number;
  currency_code: string;
}

export interface HawalaTransactionAging {
  age_bracket: string;
  count: number;
  total_amount: number;
  currency_code: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
