import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { sessionOptions, SessionData } from '@/lib/session'
import { generateOTP, sendOTPEmail } from '@/lib/email/mailer'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!user.isVerified) {
      const otp = generateOTP()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

      await prisma.user.update({
        where: { email },
        data: {
          verificationOtp: otp,
          otpExpiry,
        },
      })

      try {
        await sendOTPEmail(email, otp, user.name)
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError)
      }

      return NextResponse.json(
        { error: 'Please verify your email first. A new OTP has been sent.', requiresVerification: true, email: user.email },
        { status: 403 }
      )
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const session = await getIronSession<SessionData>(cookies(), sessionOptions)
    session.userId = user.id
    session.email = user.email
    session.name = user.name
    session.token = token
    session.isLoggedIn = true
    await session.save()

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
