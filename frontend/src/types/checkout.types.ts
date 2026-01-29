import { CartItem } from './cart.types'

export interface Address {
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
}

export interface PaymentInfo {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardholderName: string
}

export interface CheckoutState {
  step: number
  guestEmail?: string
  shippingAddress: Address
  billingAddress: Address
  billingIsSameAsShipping: boolean
  isGift: boolean
  giftMessage: string
  giftWrap: boolean
  payment: PaymentInfo
}

export interface CheckoutData {
  guest_email?: string
  shipping_address: {
    first_name: string
    last_name: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    zip_code: string
    country: string
    phone?: string
  }
  billing_address: {
    first_name: string
    last_name: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  billing_same_as_shipping: boolean
  is_gift: boolean
  gift_message?: string
  gift_wrap: boolean
  payment_method: string
  card_last_four: string
  card_brand: string
  items: {
    product_id: number
    product_name: string
    product_price: number
    quantity: number
    subtotal: number
  }[]
  subtotal: number
  discount_amount: number
  promo_code?: string
  tax_amount: number
  shipping_amount: number
  total_amount: number
}

export interface CheckoutResponse {
  order_id: number
  order_number: string
  status: string
  total: number
}

export interface Order {
  id: number
  order_number: string
  status: string
  shipping_first_name: string
  shipping_last_name: string
  shipping_address_line1: string
  shipping_address_line2?: string
  shipping_city: string
  shipping_state: string
  shipping_zip_code: string
  shipping_country: string
  is_gift: boolean
  gift_message?: string
  gift_wrap: boolean
  subtotal: number
  discount_amount: number
  promo_code?: string
  tax_amount: number
  shipping_amount: number
  total_amount: number
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
}
