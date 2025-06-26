import { prisma } from '../../../lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req, res) {
  // 获取当前用户会话
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  // 检查用户是否为管理员
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!currentUser || currentUser.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' })
  }

  switch (req.method) {
    case 'GET':
      return handleGetUsers(req, res)
    case 'PUT':
      return handleUpdateUser(req, res)
    case 'DELETE':
      return handleDeleteUser(req, res)
    default:
      return res.status(405).json({ message: 'Method not allowed' })
  }
}

// 获取用户列表
async function handleGetUsers(req, res) {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // 构建查询条件
    const where = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role) {
      where.role = role
    }
    
    if (status) {
      where.status = status
    }

    // 获取用户列表和总数
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          email: true,
          isEmailVerified: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              lists: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    res.status(200).json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// 更新用户信息
async function handleUpdateUser(req, res) {
  try {
    const { userId, role, status, name } = req.body

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    const updateData = {}
    if (role) updateData.role = role
    if (status) updateData.status = status
    if (name !== undefined) updateData.name = name

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true
      }
    })

    res.status(200).json({ user: updatedUser })
  } catch (error) {
    console.error('Update user error:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}

// 删除用户（软删除）
async function handleDeleteUser(req, res) {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    // 软删除：将状态设置为 deleted
    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: 'deleted' },
      select: {
        id: true,
        email: true,
        status: true
      }
    })

    res.status(200).json({ user: deletedUser })
  } catch (error) {
    console.error('Delete user error:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}