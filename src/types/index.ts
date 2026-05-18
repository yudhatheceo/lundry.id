// ==================== ENUMS & ENUM-LIKE TYPES ====================
export type MembershipTier = "regular" | "bronze" | "silver" | "gold";
export type OrderStatus = "received" | "processing" | "ready_for_pickup" | "delivered" | "voided";
export type PaymentMethod = "cash" | "qris" | "bank_transfer" | "coin" | "prepaid_balance" | "split";
export type PaymentStatus = "pending" | "success" | "failed";
export type BagStatus = 
  | "received" 
  | "sorting" 
  | "washing" 
  | "drying" 
  | "ironing" 
  | "transit_to_outlet" 
  | "received_at_outlet" 
  | "transit_to_customer" 
  | "delivered";

// ==================== DATA MODELS ====================
export interface User {
  id: string; // Format ULID (contoh: 01krxqm6t4cbt4p62p7qd7h2p7)
  outlet_id: string | null;
  name: string;
  email: string;
  phone: string;
  role: "owner" | "manager" | "cashier" | "courier" | "customer";
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  outlet_id: string;
  name: string;
  phone: string;
  address: string | null;
  wash_preference: string | null;
  membership_tier: MembershipTier;
  prepaid_balance: number; // Disimpan sebagai float desimal
  coin_balance: number;    // Jumlah saldo koin loyalitas
  referral_code: string;
  created_at: string;
}

export interface QrBag {
  id: string;
  order_id: string;
  qr_code_string: string; // Format: LND-BAG-<order_no>-<index>-<hash>
  bag_index: number;
  current_status: BagStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  service_name: string;
  price_per_unit: number;
  quantity: number; // Berat (kg) atau kuantitas (satuan)
  subtotal: number;
  created_at: string;
}

export interface Order {
  id: string;
  outlet_id: string;
  customer_id: string;
  drop_point_id: string | null;
  order_number: string; // Format: LND-YYYYMMDD-XXXX
  status: OrderStatus;
  estimated_weight: number;
  final_weight: number | null;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  pickup_delivery_method: "self" | "courier";
  estimated_completion_at: string;
  notes: string | null;
  created_at: string;
  items?: OrderItem[];
  qr_bags?: QrBag[];
  customer?: Customer;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transaction_reference: string | null;
  created_at: string;
}

// ==================== API REQUEST PAYLOADS ====================
export interface OtpRequestPayload {
  phone: string; // Contoh: 628113683131
}

export interface OtpVerifyPayload {
  phone: string;
  otp: string; // 6-digit kode OTP
}

export interface OrderCheckoutPayload {
  outlet_id: string;
  customer_id: string;
  drop_point_id?: string | null;
  estimated_weight: number;
  discount_amount?: number;
  bags_count?: number; // Menentukan berapa QR Bag fisik yang di-generate
  pickup_delivery_method?: "self" | "courier";
  estimated_completion_at?: string; // Format ISO Date String
  notes?: string | null;
  items: {
    service_name: string;
    price_per_unit: number;
    quantity: number;
  }[];
}

export interface PaymentPayload {
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transaction_reference?: string | null;
}

export interface CourierScanPayload {
  qr_code_string: string;
  action_status: BagStatus;
  latitude: number;  // Range: -90.0 s/d 90.0
  longitude: number; // Range: -180.0 s/d 180.0
}

