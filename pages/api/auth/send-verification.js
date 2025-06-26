import { prisma } from '../../../lib/db'
import { sendVerificationEmail } from '../../../lib/email'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' })
    }

    // 生成验证令牌
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期

    // 更新用户的验证令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailTokenExpiry: tokenExpiry
      }
    })

    // 发送验证邮件
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`
    
    const emailResult = await sendVerificationEmail(email, user.name || email.split('@')[0], verificationUrl)
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      return res.status(500).json({ message: 'Failed to send verification email' })
    }

    res.status(200).json({ 
      message: 'Verification email sent successfully',
      expiresAt: tokenExpiry
    })
  } catch (error) {
    console.error('Send verification error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}