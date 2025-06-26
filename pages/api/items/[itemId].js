import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/db'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { itemId } = req.query
  const userId = session.user.id

  switch (req.method) {
    case 'GET':
      try {
        const item = await prisma.listItem.findFirst({
          where: {
            id: itemId,
            list: {
              userId
            }
          },
          include: {
            list: true
          }
        })

        if (!item) {
          return res.status(404).json({ message: 'Item not found' })
        }

        res.status(200).json(item)
      } catch (error) {
        console.error('Get item error:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
      break

    case 'PUT':
      try {
        const { title, description, dueDate, completed, priority } = req.body

        // 验证项目所有权
        const existingItem = await prisma.listItem.findFirst({
          where: {
            id: itemId,
            list: {
              userId
            }
          },
          include: {
            list: true
          }
        })

        if (!existingItem) {
          return res.status(404).json({ message: 'Item not found' })
        }

        const updatedItem = await prisma.listItem.update({
          where: { id: itemId },
          data: {
            title: title !== undefined ? title : existingItem.title,
            description: description !== undefined ? description : existingItem.description,
            dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existingItem.dueDate,
            completed: completed !== undefined ? completed : existingItem.completed,
            priority: priority !== undefined ? priority : existingItem.priority
          }
        })

        res.status(200).json(updatedItem)
      } catch (error) {
        console.error('Update item error:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
      break

    case 'DELETE':
      try {
        // 验证项目所有权
        const existingItem = await prisma.listItem.findFirst({
          where: {
            id: itemId,
            list: {
              userId
            }
          }
        })

        if (!existingItem) {
          return res.status(404).json({ message: 'Item not found' })
        }

        await prisma.listItem.delete({
          where: { id: itemId }
        })

        res.status(200).json({ message: 'Item deleted successfully' })
      } catch (error) {
        console.error('Delete item error:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
      break

    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}