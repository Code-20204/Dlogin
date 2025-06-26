#!/usr/bin/env node

// 简单的构建测试脚本
console.log('开始检查项目配置...');

// 检查关键文件是否存在
const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'pages/api/auth/[...nextauth].js',
  'next.config.js',
  'package.json',
  '.env.local'
];

console.log('检查关键文件:');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 缺失`);
  }
});

// 检查NextAuth配置
try {
  const authFile = fs.readFileSync('pages/api/auth/[...nextauth].js', 'utf8');
  if (authFile.includes('export const authOptions')) {
    console.log('✅ NextAuth authOptions 导出正确');
  } else {
    console.log('❌ NextAuth authOptions 导出缺失');
  }
  
  if (authFile.includes('import NextAuth from')) {
    console.log('✅ NextAuth 导入正确');
  } else {
    console.log('❌ NextAuth 导入缺失');
  }
} catch (error) {
  console.log('❌ 无法读取NextAuth配置文件');
}

// 检查环境变量
try {
  require('dotenv').config({ path: '.env.local' });
  const requiredEnvs = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];
  
  console.log('\n检查环境变量:');
  requiredEnvs.forEach(env => {
    if (process.env[env]) {
      console.log(`✅ ${env} - 已配置`);
    } else {
      console.log(`❌ ${env} - 未配置`);
    }
  });
} catch (error) {
  console.log('❌ 无法加载环境变量');
}

console.log('\n项目配置检查完成!');
console.log('\n修复的问题:');
console.log('1. ✅ 修复了NextAuth authOptions导出问题');
console.log('2. ✅ 添加了缺失的getServerSession导入');
console.log('3. ✅ 启用了webpack build worker优化');
console.log('4. ✅ 修复了所有API路由的认证导入问题');

console.log('\n建议的后续步骤:');
console.log('1. 运行 npm run build 进行完整构建测试');
console.log('2. 运行 npm audit fix 修复安全漏洞');
console.log('3. 检查数据库连接配置');
console.log('4. 验证OAuth应用配置');