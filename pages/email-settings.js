import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import AuthGuard from '../components/AuthGuard'
import { Bell, Mail, Settings, Check, X } from 'lucide-react'
import { useState } from 'react'

export default function EmailSettings() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  
  const [reminderSettings, setReminderSettings] = useState({
    overdue: true,
    today: true,
    upcoming: false,
    highPriority: false
  })

  const handleSendTestReminder = async (type) => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/email/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage(`测试邮件发送成功！共发送了 ${data.count} 个任务的提醒。`)
        setMessageType('success')
      } else {
        setMessage(data.message || '发送失败')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('发送失败，请稍后重试')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const reminderTypes = [
    {
      key: 'overdue',
      title: '过期任务提醒',
      description: '提醒您处理已过期的未完成任务',
      icon: <X className="w-5 h-5 text-red-500" />
    },
    {
      key: 'today',
      title: '今日到期提醒',
      description: '提醒您今天需要完成的任务',
      icon: <Bell className="w-5 h-5 text-orange-500" />
    },
    {
      key: 'upcoming',
      title: '即将到期提醒',
      description: '提醒您未来3天内到期的任务',
      icon: <Bell className="w-5 h-5 text-blue-500" />
    },
    {
      key: 'high_priority',
      title: '高优先级任务',
      description: '提醒您处理高优先级的未完成任务',
      icon: <Check className="w-5 h-5 text-purple-500" />
    }
  ]

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">邮件设置</h1>
                <p className="text-gray-600">管理您的邮件通知偏好和测试邮件功能</p>
              </div>
            </div>
          </div>

          {/* 消息提示 */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center space-x-2">
                {messageType === 'success' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
                <span>{message}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 邮件测试区域 */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>测试邮件功能</span>
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  测试不同类型的任务提醒邮件
                </p>
              </div>
              <div className="card-body space-y-4">
                {reminderTypes.map((type) => (
                  <div key={type.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {type.icon}
                      <div>
                        <h3 className="font-medium text-gray-900">{type.title}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendTestReminder(type.key)}
                      disabled={loading}
                      className="btn-primary text-sm px-3 py-1.5"
                    >
                      {loading ? '发送中...' : '测试发送'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 邮件配置信息 */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>邮件配置信息</span>
                </h2>
              </div>
              <div className="card-body space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">当前邮箱</span>
                    <span className="text-sm text-gray-900">{session?.user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">发送服务</span>
                    <span className="text-sm text-gray-900">Resend</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">发送邮箱</span>
                    <span className="text-sm text-gray-900">super@studyhard.qzz.io</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">💡 使用提示</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 测试邮件会发送到您的注册邮箱</li>
                    <li>• 只有符合条件的任务才会被包含在提醒中</li>
                    <li>• 如果没有符合条件的任务，会显示相应提示</li>
                    <li>• 邮件发送可能需要几分钟时间</li>
                  </ul>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="btn-secondary w-full"
                  >
                    返回仪表板
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 邮件模板预览 */}
          <div className="mt-8 card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">邮件功能说明</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">欢迎邮件</h3>
                  <p className="text-sm text-gray-600">用户注册成功后自动发送欢迎邮件，介绍系统功能</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">任务提醒</h3>
                  <p className="text-sm text-gray-600">根据任务状态和截止日期发送个性化提醒邮件</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">密码重置</h3>
                  <p className="text-sm text-gray-600">安全的密码重置流程，包含时效性验证</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}