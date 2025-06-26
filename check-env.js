// Environment Variable Checker
console.log('=== Environment Variables Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

if (process.env.DATABASE_URL) {
  console.log('✅ DATABASE_URL is loaded');
} else {
  console.log('❌ DATABASE_URL is NOT loaded');
  console.log('\nTroubleshooting steps:');
  console.log('1. Ensure .env.local is in the project root');
  console.log('2. Restart your development server');
  console.log('3. Check for syntax errors in .env.local');
}

// Test Prisma connection
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  console.log('\n✅ Prisma Client initialized successfully');
  prisma.$disconnect();
} catch (error) {
  console.log('\n❌ Prisma Client initialization failed:');
  console.log(error.message);
}