import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function EmailVerificationBanner({ user, onVerificationSent }) {
  const { data: session } = useSession()
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [dismissed, setDismissed] = useState(false)

  // 如果用户已验证邮箱或横幅已被关闭，不显示
  if (!user || user.isEmailVerified || dismissed) {
    return null
  }

  const handleResendVerification = async () => {
    try {
      setSending(true)
      setMessage('')
      
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: user.email })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || '发送失败')
      }
      
      setMessage('验证邮件已发送，请检查您的邮箱')
      if (onVerificationSent) {
        onVerificationSent()
      }
    } catch (error) {
      setMessage(`发送失败：${error.message}`)
    } finally {
      setSending(false)
    }
  }

  const getDaysSinceRegistration = () => {
    if (!user.createdAt) return 0
    const registrationDate = new Date(user.createdAt)
    const now = new Date()
    return Math.floor((now - registrationDate) / (1000 * 60 * 60 * 24))
  }

  const daysSinceRegistration = getDaysSinceRegistration()
  const isUrgent = daysSinceRegistration >= 1

  return (
    <div className={`border-l-4 p-4 mb-6 ${
      isUrgent 
        ? 'bg-red-50 border-red-400' 
        : 'bg-yellow-50 border-yellow-400'
    }`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {isUrgent ? (
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${
            isUrgent ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {isUrgent ? '⚠️ 紧急：邮箱验证' : '📧 邮箱验证'}
          </h3>
          <div className={`mt-2 text-sm ${
            isUrgent ? 'text-red-700' : 'text-yellow-700'
          }`}>
            <p>
              您的邮箱地址 <strong>{user.email}</strong> 尚未验证。
              {isUrgent && (
                <span className="block mt-1 font-medium">
                  已超过 {daysSinceRegistration} 天未验证，部分功能可能受限。
                </span>
              )}
            </p>
            
            {message && (
              <div className={`mt-2 p-2 rounded text-xs ${
                message.includes('失败') 
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}
            
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={handleResendVerification}
                disabled={sending}
                className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded ${
                  isUrgent
                    ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                    : 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:ring-yellow-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {sending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    发送中...
                  </>
                ) : (
                  '📤 重新发送验证邮件'
                )}
              </button>
              
              <button
                onClick={() => setDismissed(true)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                暂时关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}