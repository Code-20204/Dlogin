/**
 * 环境配置管理
 * 根据当前环境自动选择合适的配置
 */

// 环境检测
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
export const isTest = process.env.NODE_ENV === 'test'

// 基础URL配置
export const getBaseUrl = () => {
  // 客户端环境变量
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
  }
  
  // 服务端环境变量
  if (isDevelopment) {
    return 'http://localhost:3000'
  }
  
  if (isProduction) {
    return 'https://d.studyhard.qzz.io'
  }
  
  return process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

// API基础URL
export const getApiUrl = () => {
  return `${getBaseUrl()}/api`
}

// 环境配置对象
export const config = {
  // 环境信息
  env: {
    isDevelopment,
    isProduction,
    isTest,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  
  // URL配置
  urls: {
    base: getBaseUrl(),
    api: getApiUrl(),
    auth: process.env.NEXTAUTH_URL || getBaseUrl(),
  },
  
  // 应用配置
  app: {
    name: process.env.APP_NAME || 'DLogin Task Manager',
    version: process.env.npm_package_version || '0.1.0',
  },
  
  // 数据库配置
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // 认证配置
  auth: {
    secret: process.env.NEXTAUTH_SECRET,
    github: {
      id: process.env.GITHUB_ID,
      secret: process.env.GITHUB_SECRET,
    },
    google: {
      id: process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  
  // 邮件配置
  email: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || 'super@studyhard.qzz.io',
  },
}

// 导出默认配置
export default config

// 环境检查函数
export const checkEnvironment = () => {
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'RESEND_API_KEY',
  ]
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '))
    return false
  }
  
  console.log('✅ Environment configuration is valid')
  console.log(`🌍 Running in ${process.env.NODE_ENV} mode`)
  console.log(`🔗 Base URL: ${getBaseUrl()}`)
  
  return true
}

// 获取完整的验证URL
export const getVerificationUrl = (token) => {
  return `${getBaseUrl()}/api/auth/verify-email?token=${token}`
}

// 获取重置密码URL
export const getResetPasswordUrl = (token) => {
  return `${getBaseUrl()}/reset-password?token=${token}`
}