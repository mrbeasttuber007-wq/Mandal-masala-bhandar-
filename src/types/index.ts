export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface ProductVariant {
  id: string;
  product_id: string;
  pack_size: string; // e.g. "100g", "250g", "500g", "1kg"
  price: number;
  mrp: number;
  stock_quantity: number;
  sku?: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  category_name?: string;
  variants: ProductVariant[];
}

export interface DeliveryZone {
  id: string;
  zone_name: string;
  pincode: string;
  delivery_charge: number;
  min_order_amount: number;
  free_delivery_above: number;
  is_active: boolean;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  pack_size: string;
  unit_price: number;
  quantity: number;
  item_total: number;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  comment: string;
  changed_by: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  delivery_locality: string;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  delivery_instructions?: string;
  payment_method: 'COD';
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  current_status: OrderStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  history: OrderStatusHistoryItem[];
}

export interface StoreSettings {
  store_name: string;
  store_phone: string;
  store_email: string;
  store_address: string;
  owner_whatsapp_number: string;
  customer_email_enabled: boolean;
  owner_email_enabled: boolean;
  customer_whatsapp_enabled: boolean;
  owner_whatsapp_enabled: boolean;
}

export interface NotificationLog {
  id: string;
  order_id?: string;
  order_number?: string;
  channel: 'EMAIL' | 'WHATSAPP';
  recipient: string;
  message_type: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING_CONFIG';
  details?: string;
  created_at: string;
}

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  packSize: string;
  price: number;
  mrp: number;
  quantity: number;
  imageUrl: string;
  maxStock: number;
}
