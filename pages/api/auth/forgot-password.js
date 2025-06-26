import { prisma } from '../../../lib/db'
import { sendPasswordResetEmail } from '../../../lib/email'
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
    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // 无论用户是否存在，都返回成功消息（安全考虑）
    if (!user) {
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      })
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1小时后过期

    // 保存重置令牌到数据库
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // 发送重置邮件
    try {
      await sendPasswordResetEmail(user.email, resetToken)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      return res.status(500).json({ 
        message: 'Failed to send password reset email' 
      })
    }

    res.status(200).json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}