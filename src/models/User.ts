import mongoose, { Schema, Document, Model } from 'mongoose'
import type { SavedAddress } from '@/types'

export interface IUser extends Document {
  name?: string
  phone?: string
  email?: string
  role: 'customer' | 'admin'
  savedAddresses: SavedAddress[]
  wishlist: mongoose.Types.ObjectId[]
  isPhoneVerified: boolean
  isEmailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema<SavedAddress>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'IN' },
  label: { type: String, default: 'Home' },
  isDefault: { type: Boolean, default: false },
})

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true },
    phone: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    savedAddresses: [AddressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

// Prevent mongoose model overwrite error in development hot-reloads
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
