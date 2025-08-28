const fs = require('fs');
const path = require('path');

console.log('🚂 Building for Railway...');

// Verificar que el build de TypeScript se completó
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist/ directory not found. Run "pnpm run build" first.');
  process.exit(1);
}

// Verificar que el archivo principal existe
const mainFile = path.join(distDir, 'index.js');
if (!fs.existsSync(mainFile)) {
  console.error('❌ Error: dist/index.js not found. Run "pnpm run build" first.');
  process.exit(1);
}

// Verificar que Prisma Client se generó
const prismaDir = path.join(__dirname, '../prisma');
if (!fs.existsSync(prismaDir)) {
  console.error('❌ Error: prisma/ directory not found.');
  process.exit(1);
}

console.log('✅ Build verification completed!');
console.log('✅ Ready for Railway deployment');
console.log('');
console.log('📋 Next steps:');
console.log('1. railway login');
console.log('2. railway init');
console.log('3. railway link');
console.log('4. railway variables set DATABASE_URL="your-postgresql-url"');
console.log('5. railway up');
