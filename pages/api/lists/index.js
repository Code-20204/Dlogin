import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/db'
import { processAutoList, validateRule } from '@/lib/automation'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const userId = session.user.id

  switch (req.method) {
    case 'GET':
      try {
        const lists = await prisma.list.findMany({
          where: { userId },
          include: {
            items: {
              orderBy: {
                createdAt: 'desc'
              }
            },
            _count: {
              select: {
                items: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        })

        // 处理自动化列表
        const processedLists = lists.map(list => {
          if (list.type === 'AUTO' && list.rules) {
            // 获取用户所有任务项
            const allItems = lists.flatMap(l => l.items)
            const filteredItems = processAutoList(allItems, list.rules)
            
            return {
              ...list,
              items: filteredItems,
              _count: {
                items: filteredItems.length
              }
            }
          }
          return list
        })

        res.status(200).json(processedLists)
      } catch (error) {
        console.error('Get lists error:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
      break

    case 'POST':
      try {
        const { title, type = 'MANUAL', rules } = req.body

        if (!title) {
          return res.status(400).json({ message: 'Title is required' })
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

        const list = await prisma.list.create({
          data: {
            title,
            type,
            rules: rules || null,
            userId
          },
          include: {
            items: true,
            _count: {
              select: {
                items: true
              }
            }
          }
        })

        res.status(201).json(list)
      } catch (error) {
        console.error('Create list error:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
      break

    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}