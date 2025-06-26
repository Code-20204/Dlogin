import { prisma } from '../../../lib/db'
import bcrypt from 'bcryptjs'
import { sendWelcomeEmail, sendVerificationEmail } from '../../../lib/email'
import { getVerificationUrl } from '../../../lib/config'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password, name } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  try {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // 哈希密码
    const hashedPassword = bcrypt.hashSync(password, 12)

    // 生成邮箱验证令牌
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    const emailTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        emailVerificationToken,
        emailTokenExpiry
      }
    })

    // 创建默认列表
    await prisma.list.create({
      data: {
        title: '我的任务',
        type: 'MANUAL',
        userId: user.id
      }
    })

    // 创建一些自动化列表
    const autoLists = [
      {
        title: '本周到期',
        type: 'AUTO',
        rules: [{
          field: 'dueDate',
          operator: '<=',
          value: 'endOfWeek'
        }],
        userId: user.id
      },
      {
        title: '已过期',
        type: 'AUTO',
        rules: [{
          field: 'dueDate',
          operator: '<',
          value: 'now'
        }, {
          field: 'completed',
          operator: '=',
          value: false
        }],
        userId: user.id
      },
      {
        title: '高优先级',
        type: 'AUTO',
        rules: [{
          field: 'priority',
          operator: '=',
          value: 'high'
        }],
        userId: user.id
      }
    ]

    await prisma.list.createMany({
      data: autoLists
    })

    // 发送邮箱验证邮件
    try {
      const verificationUrl = getVerificationUrl(emailVerificationToken)
      await sendVerificationEmail(user.email, user.name, verificationUrl)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // 不影响注册流程，只记录错误
    }

    // 发送欢迎邮件
    try {
      await sendWelcomeEmail(user.email, user.name)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // 不影响注册流程，只记录错误
    }

    res.status(201).json({ 
      message: 'User created successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified
      },
      requiresVerification: true
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}