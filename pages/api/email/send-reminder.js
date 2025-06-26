import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/db'
import { sendTaskReminderEmail } from '../../../lib/email'
import { isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { type = 'overdue' } = req.body
    const userId = session.user.id

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    let tasks = []
    const now = new Date()
    const today = startOfDay(now)
    const endOfToday = endOfDay(now)

    // 根据类型获取不同的任务
    switch (type) {
      case 'overdue':
        // 获取已过期的未完成任务
        tasks = await prisma.listItem.findMany({
          where: {
            list: { userId },
            completed: false,
            dueDate: {
              lt: today
            }
          },
          include: {
            list: { select: { title: true } }
          },
          orderBy: { dueDate: 'asc' }
        })
        break

      case 'today':
        // 获取今天到期的任务
        tasks = await prisma.listItem.findMany({
          where: {
            list: { userId },
            completed: false,
            dueDate: {
              gte: today,
              lte: endOfToday
            }
          },
          include: {
            list: { select: { title: true } }
          },
          orderBy: { dueDate: 'asc' }
        })
        break

      case 'upcoming':
        // 获取未来3天内到期的任务
        const threeDaysLater = new Date()
        threeDaysLater.setDate(threeDaysLater.getDate() + 3)
        
        tasks = await prisma.listItem.findMany({
          where: {
            list: { userId },
            completed: false,
            dueDate: {
              gte: today,
              lte: endOfDay(threeDaysLater)
            }
          },
          include: {
            list: { select: { title: true } }
          },
          orderBy: { dueDate: 'asc' }
        })
        break

      case 'high_priority':
        // 获取高优先级的未完成任务
        tasks = await prisma.listItem.findMany({
          where: {
            list: { userId },
            completed: false,
            priority: 'high'
          },
          include: {
            list: { select: { title: true } }
          },
          orderBy: { createdAt: 'desc' }
        })
        break

      default:
        return res.status(400).json({ message: 'Invalid reminder type' })
    }

    if (tasks.length === 0) {
      return res.status(200).json({ 
        message: 'No tasks found for reminder',
        count: 0
      })
    }

    // 发送提醒邮件
    const emailResult = await sendTaskReminderEmail(
      user.email,
      user.name,
      tasks
    )

    if (emailResult.success) {
      res.status(200).json({
        message: 'Reminder email sent successfully',
        count: tasks.length,
        emailId: emailResult.data.id
      })
    } else {
      res.status(500).json({
        message: 'Failed to send reminder email',
        error: emailResult.error
      })
    }

  } catch (error) {
    console.error('Send reminder error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}