import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/db'
import { processAutoList, validateRule } from '@/lib/automation'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { listId } = req.query
  const userId = session.user.id

  switch (req.method) {
    case 'GET':
      try {
        const list = await prisma.list.findFirst({
          where: {
            id: listId,
            userId
          },
          include: {
            items: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        })

        if (!list) {
          return res.status(404).json({ message: 'List not found' })
        }

        // 处理自动化列表
        if (list.type === 'AUTO' && list.rules) {
          // 获取用户所有任务项
          const allLists = await prisma.list.findMany({
            where: { userId },
            include: { items: true }
          })
          
          const allItems = allLists.flatMap(l => l.items)
          const filteredItems = processAutoList(allItems, list.rules)
          
          list.items = filteredItems
        }

        res.status(200).json(list)
      } catch (error) {
        console.error('Get list error:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
      break

    case 'PUT':
      try {
        const { title, type, rules } = req.body

        // 验证列表所有权
        const existingList = await prisma.list.findFirst({
          where: {
            id: listId,
            userId
          }
        })

        if (!existingList) {
          return res.status(404).json({ message: 'List not found' })
        }

        // 验证自动化规则
        if (type === 'AUTO' && rules) {
          const invalidRules = rules.filter(rule => !validateRule(rule))
          if (invalidRules.length > 0) {
            return res.status(400).json({ 
              message: 'Invalid automation rules',
              invalidRules 
            })
          }
        }

        const updatedList = await prisma.list.update({
          where: { id: listId },
          data: {
            title: title || existingList.title,
            type: type || existingList.type,
            rules: rules !== undefined ? rules : existingList.rules
          },
          include: {
            items: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        })

        res.status(200).json(updatedList)
      } catch (error) {
        console.error('Update list error:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
      break

    case 'DELETE':
      try {
        // 验证列表所有权
        const existingList = await prisma.list.findFirst({
          where: {
            id: listId,
            userId
          }
        })

        if (!existingList) {
          return res.status(404).json({ message: 'List not found' })
        }

        await prisma.list.delete({
          where: { id: listId }
        })

        res.status(200).json({ message: 'List deleted successfully' })
      } catch (error) {
        console.error('Delete list error:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
      break

    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}