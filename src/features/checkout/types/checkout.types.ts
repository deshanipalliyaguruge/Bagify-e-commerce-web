import type { Order, OrderItem, Address } from '@/types/database'
import type { PaymentMethod } from '@/types/database'

/** Order with items — used on the order detail / history pages */
export type OrderFull = Order & {
  order_items: OrderItem[]
}

/** What the placeOrder server action returns on success */
export type PlaceOrderResult =
  | { success: true;  orderId: string; orderNumber: string }
  | { success: false; error: string }

/** Server-side payload for placing an order */
export type PlaceOrderPayload = {
  shippingAddress: {
    fullName:    string
    phone:       string | null
    line1:       string
    line2:       string | null
    city:        string
    state:       string
    postalCode:  string
    country:     string
  }
  paymentMethod:  PaymentMethod
  customerNotes:  string | null
  saveAddress:    boolean
}

/** Cart item shape passed from client to the server action */
export type CheckoutCartItem = {
  productId:   string
  variantId:   string | null
  name:        string
  price:       number   // cents
  quantity:    number
  image:       string | null
  variantName: string | null
  variantValue: string | null
}

export type CheckoutSummary = {
  subtotal:       number   // cents
  discountAmount: number   // cents
  shippingAmount: number   // cents
  taxAmount:      number   // cents
  total:          number   // cents
  couponCode:     string | null
}

export { type Address }
