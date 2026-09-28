import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IOrderItem {
  productId: Types.ObjectId
  name: string
  price: number // in paise
  quantity: number
  image: string
  variantLabel?: string
}

export interface IOrder extends Document {
  orderNumber: string // e.g., UMM-2026-XXXX
  userId?: Types.ObjectId
  customer: {
    name: string
    email: string
    phone: string
  }
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
  }
  items: IOrderItem[]
  payment: {
    method: 'razorpay' | 'cod'
    status: 'pending' | 'paid' | 'failed'
    razorpayOrderId?: string
    razorpayPaymentId?: string
  }
  totals: {
    subtotal: number
    shippingCharge: number
    discount: number
    total: number
  }
  status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, required: true }, // Not a ref to keep it decoupled
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  variantLabel: { type: String }
})

const orderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  shippingAddress: {
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  items: [orderItemSchema],
  payment: {
    method: { type: String, enum: ['razorpay', 'cod'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String }
  },
  totals: {
    subtotal: { type: Number, required: true },
    shippingCharge: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  status: { 
    type: String, 
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'placed'
  }
}, { timestamps: true })

// Indexes for common queries
orderSchema.index({ orderNumber: 1 })
orderSchema.index({ 'customer.email': 1 })
orderSchema.index({ 'customer.phone': 1 })
orderSchema.index({ userId: 1 })

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema)
