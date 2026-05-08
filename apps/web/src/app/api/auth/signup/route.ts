import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateOTP, sendOTPEmail } from '@/lib/email/mailer'

export async function POST(request: NextRequest) {
  try {
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL protocol:', process.env.DATABASE_URL?.substring(0, 20))
    
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationOtp: otp,
        otpExpiry,
        isVerified: false,
        verificationAttempts: 0,
      },
    })

    // Try to send email, but don't fail signup if email fails
    try {
      await sendOTPEmail(email, otp, name)
      console.log('OTP email sent successfully')
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError)
      // Continue anyway - user can request resend later
    }

    return NextResponse.json(
      {
        message: 'Signup successful. Please verify your email with the OTP sent.',
        userId: user.id,
        email: user.email,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
