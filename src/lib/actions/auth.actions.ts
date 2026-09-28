'use server'

import dbConnect from '@/lib/db/mongodb'
import redis from '@/lib/db/redis'
import { User } from '@/models/User'
import { createSession, clearSession } from '@/lib/auth/session'
import { sendOTPSchema, verifyOTPSchema } from '@/lib/validations/checkout.schema'
import type { ActionResult } from '@/types'
import { headers } from 'next/headers'
import { authRateLimit, getClientIp } from '@/lib/security/rate-limit'

// Generate a random 6 digit OTP
function generateOTP(): string {
  // Always use '123456' for development/testing ease
  if (process.env.NODE_ENV === 'development') return '123456'
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOTP(formData: FormData): Promise<ActionResult<string>> {
  try {
    const rateLimit = await authRateLimit.limit(getClientIp(await headers()))
    if (!rateLimit.success) {
      return { success: false, error: 'Too many requests. Please try again later.' }
    }

    const rawData = { phone: formData.get('phone') as string }
    const validatedData = sendOTPSchema.safeParse(rawData)

    if (!validatedData.success) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: validatedData.error.flatten().fieldErrors,
      }
    }

    const { phone } = validatedData.data
    const otp = generateOTP()
    
    // Store in Redis with 5 minutes TTL
    const key = `otp:${phone}`
    await redis.set(key, otp, 'EX', 300)

    // TODO: Phase 8 - Integrate MSG91 / SMS Provider
    console.log(`[AUTH] Sent OTP ${otp} to ${phone}`)

    return { success: true, data: 'OTP sent successfully' }
  } catch (error) {
    console.error('[AUTH] Send OTP error:', error)
    return { success: false, error: 'Failed to send OTP. Please try again.' }
  }
}

export async function verifyOTP(formData: FormData): Promise<ActionResult<string>> {
  try {
    const rateLimit = await authRateLimit.limit(getClientIp(await headers()))
    if (!rateLimit.success) {
      return { success: false, error: 'Too many requests. Please try again later.' }
    }

    const rawData = {
      phone: formData.get('phone') as string,
      otp: formData.get('otp') as string,
    }
    const validatedData = verifyOTPSchema.safeParse(rawData)

    if (!validatedData.success) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: validatedData.error.flatten().fieldErrors,
      }
    }

    const { phone, otp } = validatedData.data
    const key = `otp:${phone}`
    
    // Check Redis
    const storedOtp = await redis.get(key)
    
    if (!storedOtp || storedOtp !== otp) {
      return { success: false, error: 'Invalid or expired OTP' }
    }

    // OTP is valid, delete from Redis
    await redis.del(key)

    // Connect to DB
    await dbConnect()

    // Find or create user
    let user = await User.findOne({ phone })
    if (!user) {
      user = await User.create({
        phone,
        isPhoneVerified: true,
      })
    } else if (!user.isPhoneVerified) {
      user.isPhoneVerified = true
      await user.save()
    }

    // Create session
    await createSession(user._id.toString(), user.role)

    return { success: true, data: 'Logged in successfully' }
  } catch (error) {
    console.error('[AUTH] Verify OTP error:', error)
    return { success: false, error: 'Failed to verify OTP. Please try again.' }
  }
}

export async function logout(): Promise<ActionResult<string>> {
  try {
    await clearSession()
    return { success: true, data: 'Logged out successfully' }
  } catch (error) {
    console.error('[AUTH] Logout error:', error)
    return { success: false, error: 'Failed to logout.' }
  }
}
