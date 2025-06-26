import { Resend } from 'resend'
import { getBaseUrl, getVerificationUrl } from './config';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 发送邮件的通用函数
 * @param {Object} options - 邮件选项
 * @param {string} options.to - 收件人邮箱
 * @param {string} options.subject - 邮件主题
 * @param {string} options.html - HTML内容
 * @param {string} options.text - 纯文本内容（可选）
 * @returns {Promise<Object>} 发送结果
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('邮件发送失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 发送邮箱验证邮件
 * @param {string} email - 用户邮箱
 * @param {string} name - 用户名称
 * @param {string} verificationUrl - 验证链接
 */
export async function sendVerificationEmail(email, name, verificationUrl) {
  const subject = '请验证您的邮箱地址 - DLogin 任务管理系统';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background: #0056b3; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📧 邮箱验证</h1>
        <p>DLogin 任务管理系统</p>
      </div>
      <div class="content">
        <h2>您好，${name}！</h2>
        <p>感谢您注册 DLogin 任务管理系统！为了确保您的账户安全，请点击下方按钮验证您的邮箱地址：</p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">✅ 验证邮箱地址</a>
        </div>
        
        <div class="warning">
          <strong>⚠️ 重要提醒：</strong>
          <ul>
            <li>此验证链接将在 <strong>24小时</strong> 后失效</li>
            <li>在验证邮箱之前，您的账户功能将受到限制</li>
            <li>如果按钮无法点击，请复制以下链接到浏览器：<br><code>${verificationUrl}</code></li>
          </ul>
        </div>
        
        <p>如果您没有注册此账户，请忽略此邮件。</p>
      </div>
      <div class="footer">
        <p>© 2024 DLogin 任务管理系统 | 此邮件由系统自动发送，请勿回复</p>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    邮箱验证 - DLogin 任务管理系统
    
    您好，${name}！
    
    感谢您注册 DLogin 任务管理系统！为了确保您的账户安全，请访问以下链接验证您的邮箱地址：
    
    ${verificationUrl}
    
    重要提醒：
    - 此验证链接将在24小时后失效
    - 在验证邮箱之前，您的账户功能将受到限制
    
    如果您没有注册此账户，请忽略此邮件。
    
    © 2024 DLogin 任务管理系统
  `;
  
  return await sendEmail({ to: email, subject, html, text });
}

/**
 * 发送欢迎邮件
 * @param {string} email - 用户邮箱
 * @param {string} name - 用户名称
 */
export async function sendWelcomeEmail(email, name) {
  const subject = '欢迎使用 DLogin 任务管理系统！';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .button:hover { background: #5a67d8; color: #ffffff !important; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 欢迎加入 DLogin！</h1>
        </div>
        <div class="content">
          <h2>你好，${name || '用户'}！</h2>
          <p>感谢您注册 DLogin 任务管理系统！我们很高兴您选择我们来帮助您更好地管理任务和提高效率。</p>
          
          <h3>🚀 您可以开始使用以下功能：</h3>
          <ul>
            <li>📝 创建和管理任务列表</li>
            <li>🤖 使用智能自动化列表</li>
            <li>⏰ 设置任务截止日期和优先级</li>
            <li>📊 查看任务统计和进度</li>
          </ul>
          
          <p>立即开始您的高效任务管理之旅：</p>
          <a href="${getBaseUrl()}/dashboard" class="button">进入仪表板</a>
          
          <p>如果您有任何问题或需要帮助，请随时联系我们的支持团队。</p>
        </div>
        <div class="footer">
          <p>此邮件由 DLogin 任务管理系统自动发送</p>
          <p>如果您没有注册此账户，请忽略此邮件</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    欢迎使用 DLogin 任务管理系统！
    
    你好，${name || '用户'}！
    
    感谢您注册 DLogin 任务管理系统！我们很高兴您选择我们来帮助您更好地管理任务和提高效率。
    
    您可以开始使用以下功能：
    - 创建和管理任务列表
    - 使用智能自动化列表
    - 设置任务截止日期和优先级
    - 查看任务统计和进度
    
    立即访问：${getBaseUrl()}/dashboard
    
    如果您有任何问题或需要帮助，请随时联系我们的支持团队。
    
    此邮件由 DLogin 任务管理系统自动发送
    如果您没有注册此账户，请忽略此邮件
  `;
  
  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * 发送任务提醒邮件
 * @param {string} email - 用户邮箱
 * @param {string} name - 用户名称
 * @param {Array} tasks - 待提醒的任务列表
 */
export async function sendTaskReminderEmail(email, name, tasks) {
  const subject = `📋 您有 ${tasks.length} 个任务需要关注`;
  
  const taskList = tasks.map(task => {
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('zh-CN') : '无截止日期';
    const priority = task.priority === 'high' ? '🔴 高' : task.priority === 'medium' ? '🟡 中' : '🟢 低';
    return `
      <div style="border-left: 4px solid #667eea; padding: 15px; margin: 10px 0; background: #f8f9fa;">
        <h4 style="margin: 0 0 10px 0;">${task.title}</h4>
        <p style="margin: 5px 0; color: #666;">截止日期: ${dueDate}</p>
        <p style="margin: 5px 0; color: #666;">优先级: ${priority}</p>
        ${task.description ? `<p style="margin: 5px 0; color: #666;">描述: ${task.description}</p>` : ''}
      </div>
    `;
  }).join('');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 任务提醒</h1>
        </div>
        <div class="content">
          <h2>你好，${name || '用户'}！</h2>
          <p>您有 <strong>${tasks.length}</strong> 个任务需要关注：</p>
          
          ${taskList}
          
          <p>建议您及时处理这些任务，以保持高效的工作节奏。</p>
          <a href="${process.env.APP_URL}/dashboard" class="button">查看所有任务</a>
        </div>
        <div class="footer">
          <p>此邮件由 DLogin 任务管理系统自动发送</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    任务提醒
    
    你好，${name || '用户'}！
    
    您有 ${tasks.length} 个任务需要关注：
    
    ${tasks.map(task => {
      const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('zh-CN') : '无截止日期';
      const priority = task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低';
      return `- ${task.title}\n  截止日期: ${dueDate}\n  优先级: ${priority}${task.description ? `\n  描述: ${task.description}` : ''}\n`;
    }).join('\n')}
    
    建议您及时处理这些任务，以保持高效的工作节奏。
    
    查看所有任务：${process.env.APP_URL}/dashboard
    
    此邮件由 DLogin 任务管理系统自动发送
  `;
  
  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * 发送密码重置邮件
 * @param {string} email - 用户邮箱
 * @param {string} resetToken - 重置令牌
 */
export async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
  const subject = '🔐 重置您的密码 - DLogin';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 密码重置</h1>
        </div>
        <div class="content">
          <h2>密码重置请求</h2>
          <p>我们收到了您的密码重置请求。如果这是您本人操作，请点击下面的按钮重置密码：</p>
          
          <a href="${resetUrl}" class="button">重置密码</a>
          
          <div class="warning">
            <strong>⚠️ 安全提醒：</strong>
            <ul>
              <li>此链接将在 1 小时后过期</li>
              <li>如果您没有请求重置密码，请忽略此邮件</li>
              <li>请不要将此链接分享给他人</li>
            </ul>
          </div>
          
          <p>如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
          <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">${resetUrl}</p>
        </div>
        <div class="footer">
          <p>此邮件由 DLogin 任务管理系统自动发送</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    密码重置请求
    
    我们收到了您的密码重置请求。如果这是您本人操作，请访问以下链接重置密码：
    
    ${resetUrl}
    
    安全提醒：
    - 此链接将在 1 小时后过期
    - 如果您没有请求重置密码，请忽略此邮件
    - 请不要将此链接分享给他人
    
    此邮件由 DLogin 任务管理系统自动发送
  `;
  
  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}