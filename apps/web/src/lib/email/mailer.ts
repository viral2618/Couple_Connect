import emailjs from '@emailjs/nodejs'
import crypto from 'crypto'

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID!
const OTP_TEMPLATE_ID = process.env.EMAILJS_OTP_TEMPLATE_ID!
const RESET_TEMPLATE_ID = process.env.EMAILJS_RESET_TEMPLATE_ID!
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY!
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY!

export async function sendOTPEmail(email: string, otp: string, name: string) {
  const result = await emailjs.send(
    SERVICE_ID,
    OTP_TEMPLATE_ID,
    {
      to_email: email,
      to_name: name,
      otp_code: otp,
    },
    { publicKey: PUBLIC_KEY, privateKey: PRIVATE_KEY }
  )
  console.log('OTP email sent:', result.status)
  return result
}

export async function sendPasswordResetEmail(email: string, resetToken: string, name: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

  const result = await emailjs.send(
    SERVICE_ID,
    RESET_TEMPLATE_ID,
    {
      to_email: email,
      to_name: name,
      reset_url: resetUrl,
    },
    { publicKey: PUBLIC_KEY, privateKey: PRIVATE_KEY }
  )
  console.log('Password reset email sent:', result.status)
  return result
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}
