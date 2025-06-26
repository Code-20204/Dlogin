import { prisma } from './db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../pages/api/auth/[...nextauth]'

/**
 * 检查用户是否已验证邮箱的中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
export async function requireEmailVerification(req, res, next) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session) {
      return res.status(401).json({ 
        message: 'Unauthorized',
        code: 'UNAUTHORIZED'
      })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        emailTokenExpiry: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }

    // 检查是否已验证邮箱
    if (!user.isEmailVerified) {
      // 检查是否超过24小时未验证
      const daysSinceRegistration = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      
      return res.status(403).json({ 
        message: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED',
        data: {
          email: user.email,
          daysSinceRegistration,
          canResendVerification: true
        }
      })
    }

    // 将用户信息添加到请求对象中
    req.user = user
    
    if (next) {
      return next()
    }
    
    return true
  } catch (error) {
    console.error('Email verification middleware error:', error)
    return res.status(500).json({ 
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    })
  }
}

/**
 * 检查用户是否为管理员的中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
export async function requireAdmin(req, res, next) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session) {
      return res.status(401).json({ 
        message: 'Unauthorized',
        code: 'UNAUTHORIZED'
      })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        role: true,
        status: true
      }
    })

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Admin access required',
        code: 'INSUFFICIENT_PERMISSIONS'
      })
    }

    if (user.status !== 'active') {
      return res.status(403).json({ 
        message: 'Account is not active',
        code: 'ACCOUNT_INACTIVE'
      })
    }

    // 将用户信息添加到请求对象中
    req.user = user
    
    if (next) {
      return next()
    }
    
    return true
  } catch (error) {
    console.error('Admin middleware error:', error)
    return res.status(500).json({ 
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    })
  }
}

/**
 * 组合中间件函数
 * @param {...Function} middlewares - 中间件函数数组
 */
export function combineMiddlewares(...middlewares) {
  return async (req, res) => {
    for (const middleware of middlewares) {
      const result = await middleware(req, res)
      if (result !== true) {
        return // 中间件已经处理了响应
      }
    }
  }
}