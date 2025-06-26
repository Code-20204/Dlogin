import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Plus, List, Calendar, CheckCircle, Clock, AlertTriangle, User, LogOut, Settings } from 'lucide-react'
import AuthGuard from '@/components/AuthGuard'
import ListView from '@/components/ListView'
import AutoListBuilder from '@/components/AutoListBuilder'
import EmailVerificationBanner from '@/components/EmailVerificationBanner'

function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [lists, setLists] = useState([])
  const [selectedList, setSelectedList] = useState(null)
  const [showNewListModal, setShowNewListModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  })

  useEffect(() => {
    fetchUserInfo()
    fetchLists()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    }
  }

  const fetchLists = async () => {
    try {
      const response = await fetch('/api/lists')
      if (response.ok) {
        const data = await response.json()
        setLists(data)
        
        // 计算统计数据
        const allItems = data.flatMap(list => list.items || [])
        const now = new Date()
        
        setStats({
          total: allItems.length,
          completed: allItems.filter(item => item.completed).length,
          pending: allItems.filter(item => !item.completed).length,
          overdue: allItems.filter(item => 
            !item.completed && 
            item.dueDate && 
            new Date(item.dueDate) < now
          ).length
        })
        
        // 默认选择第一个列表
        if (data.length > 0 && !selectedList) {
          setSelectedList(data[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch lists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateList = async (listData) => {
    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listData)
      })

      if (response.ok) {
        const newList = await response.json()
        setLists([...lists, newList])
        setSelectedList(newList)
        setShowNewListModal(false)
      }
    } catch (error) {
      console.error('Failed to create list:', error)
    }
  }

  const handleDeleteList = async (listId) => {
    if (!confirm('确定要删除这个列表吗？')) return

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const updatedLists = lists.filter(list => list.id !== listId)
        setLists(updatedLists)
        
        if (selectedList?.id === listId) {
          setSelectedList(updatedLists[0] || null)
        }
      }
    } catch (error) {
      console.error('Failed to delete list:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">DLogin 任务管理</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{session?.user?.name || session?.user?.email}</span>
              </div>
              
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>退出</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Email Verification Banner */}
        {user && !user.isEmailVerified && (
          <EmailVerificationBanner user={user} onVerificationSent={fetchUserInfo} />
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <List className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总任务</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">待完成</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已过期</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Lists */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">我的列表</h2>
                  <button
                    onClick={() => setShowNewListModal(true)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-2">
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => setSelectedList(list)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedList?.id === list.id
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{list.title}</p>
                          <p className="text-sm text-gray-500">
                            {list._count?.items || 0} 项任务
                            {list.type === 'AUTO' && ' • 自动'}
                          </p>
                        </div>
                        {list.type === 'AUTO' && (
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - List View */}
          <div className="lg:col-span-3">
            {selectedList ? (
              <ListView
                list={selectedList}
                onUpdate={fetchLists}
                onDelete={handleDeleteList}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <List className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">选择一个列表</h3>
                <p className="text-gray-600 mb-6">从左侧选择一个列表来查看和管理任务</p>
                <button
                  onClick={() => setShowNewListModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  创建新列表
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New List Modal */}
      {showNewListModal && (
        <AutoListBuilder
          onSubmit={handleCreateList}
          onCancel={() => setShowNewListModal(false)}
        />
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  )
}