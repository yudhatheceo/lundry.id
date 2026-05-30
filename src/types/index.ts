// ==================== ENUMS & ENUM-LIKE TYPES ====================
export type MembershipTier = "regular" | "bronze" | "silver" | "gold";
export type OrderStatus = "received" | "processing" | "ready_for_pickup" | "delivered" | "voided";
export type PaymentMethod = "cash" | "qris" | "bank_transfer" | "coin" | "prepaid_balance" | "split";
export type PaymentStatus = "pending" | "success" | "failed";
export type OrderPaymentStatus = "unpaid" | "partial" | "paid" | "refunded";
export type BagStatus = 
  | "received" 
  | "sorting" 
  | "washing" 
  | "drying" 
  | "ironing" 
  | "packing"
  | "ready_for_pickup"
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
  estimated_weight?: number | null; // Sprint 2: planned weight for this bag
  estimated_pcs?: number | null;    // Sprint 2: planned pcs for this bag
  actual_weight?: number | null;    // Sprint 3: confirmed weight after validation
  actual_pcs?: number | null;       // Sprint 3: confirmed pcs after validation
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
  payment_status: OrderPaymentStatus; // unpaid | partial | paid | refunded
  estimated_weight: number;
  estimated_pcs?: number | null;    // Sprint 2: total pcs count at reception
  final_weight: number | null;
  final_pcs?: number | null;        // Sprint 3: confirmed pcs at packing
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  paid_amount: number;
  remaining_amount: number;
  pickup_delivery_method: "self" | "courier";
  estimated_completion_at: string;
  notes: string | null;
  created_at: string;
  items?: OrderItem[];
  qr_bags?: QrBag[];
  customer?: Customer;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transaction_reference: string | null;
  created_at: string;
  order?: Order;
}

export interface TrackingHistoryLog {
  id: string;
  qr_bag_id: string;
  scanned_by: string;
  status_from: BagStatus;
  status_to: BagStatus;
  latitude: string; // Koordinat desimal dari server
  longitude: string;
  created_at: string;
  qr_bag: {
    qr_code_string: string;
    bag_index: number;
  };
  scanned_by_user: {
    name: string;
    role: string;
  };
}

// ==================== SERVICE MODEL ====================
export interface Service {
  id: number;
  category: string;         // Contoh: "Cuci Kering Setrika"
  service_name: string;     // Contoh: "Reguler"
  duration: string;         // Contoh: "2-3 Hari"
  price: number;            // Dalam Rupiah (integer)
  unit: string;             // Contoh: "per Kg", "per Pcs"
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
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
  estimated_pcs?: number | null;    // Sprint 2: total pcs at reception
  discount_amount?: number;
  bags_count?: number;              // Legacy: simple bag count (overridden by bags[] if provided)
  bags?: {                          // Sprint 2: manual split plan [{weight, pcs?}]
    estimated_weight: number;
    estimated_pcs?: number | null;
  }[];
  pickup_delivery_method?: "self" | "courier";
  estimated_completion_at?: string;
  notes?: string | null;
  items: {
    service_id: number;
    quantity: number;
  }[];
}

export interface PaymentPayload {
  payment_method: PaymentMethod;
  amount: number;                      // Jumlah yang harus dibayar
  cash_received?: number;              // Untuk cash: uang yang diserahkan pelanggan
  transaction_reference?: string | null; // Untuk QRIS/transfer: nomor referensi
}

export interface CourierScanPayload {
  qr_code_string: string;
  action_status: BagStatus;
  latitude: number;  // Range: -90.0 s/d 90.0
  longitude: number; // Range: -180.0 s/d 180.0
}

