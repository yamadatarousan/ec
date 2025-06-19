/**
 * 注文関連の型定義
 */

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  shippingCost: number;
  taxAmount: number;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
  addressId: string;
  address: Address;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  orderId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    images: { url: string; alt?: string | null }[];
  };
}

export interface Address {
  id: string;
  name: string;
  company?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface CreateOrderRequest {
  addressId: string;
  notes?: string;
}

export interface OrderSummary {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: '注文確認中',
  CONFIRMED: '注文確定',
  PROCESSING: '処理中',
  SHIPPED: '発送済み',
  DELIVERED: '配達完了',
  CANCELLED: 'キャンセル',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'text-yellow-600 bg-yellow-100',
  CONFIRMED: 'text-blue-600 bg-blue-100',
  PROCESSING: 'text-purple-600 bg-purple-100',
  SHIPPED: 'text-orange-600 bg-orange-100',
  DELIVERED: 'text-green-600 bg-green-100',
  CANCELLED: 'text-red-600 bg-red-100',
};
