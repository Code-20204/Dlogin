import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { prisma } from '@/lib/db'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { listId } = req.query
  const userId = session.user.id

  // 验证列表所有权
  const list = await prisma.list.findFirst({
    where: {
      id: listId,
      userId
    }
  })

  if (!list) {
    return res.status(404).json({ message: 'List not found' })
  }

  switch (req.method) {
    case 'GET':
      try {
        const items = await prisma.listItem.findMany({
          where: { listId },
          orderBy: {
            createdAt: 'desc'
          }
        })

        res.status(200).json(items)
      } catch (error) {
        console.error('Get items error:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
      break

    case 'POST':
      try {
        const { title, description, dueDate, priority = 'medium' } = req.body

        if (!title) {
          return res.status(400).json({ message: 'Title is required' })
        }

        // 自动化列表不允许手动添加项目
        if (list.type === 'AUTO') {
          return res.status(400).json({ 
            message: 'Cannot add items to automated lists' 
          })
        }

        const item = await prisma.listItem.create({
          data: {
            title,
            description,
            dueDate: dueDate ? new Date(dueDate) : null,
            priority,
            listId
          }
        })

        res.status(201).json(item)
      } catch (error) {
        console.error('Create item error:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
      break

    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}