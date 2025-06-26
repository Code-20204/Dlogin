/** @type {import('next').NextConfig} */
const path = require('path')

// 环境变量配置
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// 根据环境设置基础URL
const getBaseUrl = () => {
  if (isDevelopment) {
    return 'http://localhost:3000'
  }
  if (isProduction) {
    return 'https://d.studyhard.qzz.io'
  }
  return process.env.APP_URL || 'http://localhost:3000'
}

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    webpackBuildWorker: true,
  },

  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname)
    return config
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || getBaseUrl(),
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    APP_URL: process.env.APP_URL || getBaseUrl(),
    BASE_URL: getBaseUrl(),
    IS_DEVELOPMENT: isDevelopment.toString(),
    IS_PRODUCTION: isProduction.toString(),
  },
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
    ],
  },
  async redirects() {
    return [
      {
        source: '/auth/signin',
        destination: '/login',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig