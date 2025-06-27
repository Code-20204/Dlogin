import { prisma } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { token } = req.query

  if (!token) {
    return res.status(400).json({ message: 'Verification token is required' })
  }

  try {
    // 查找具有该令牌的用户
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailTokenExpiry: {
          gt: new Date() // 令牌未过期
        }
      }
    })

    if (!user) {
      // 重定向到验证失败页面
      return res.redirect('/login?error=invalid_token&message=' + encodeURIComponent('验证链接无效或已过期'))
    }

    if (user.isEmailVerified) {
      // 重定向到已验证页面
      return res.redirect('/dashboard?message=' + encodeURIComponent('邮箱已验证'))
    }

    // 更新用户状态为已验证
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailTokenExpiry: null
      }
    })

    // 重定向到成功页面
    res.redirect('/dashboard?message=' + encodeURIComponent('邮箱验证成功！您现在可以使用所有功能了'))
  } catch (error) {
    console.error('Email verification error:', error)
    res.redirect('/login?error=server_error&message=' + encodeURIComponent('验证过程中发生错误'))
  }
}