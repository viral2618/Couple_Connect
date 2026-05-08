const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Production Readiness...\n');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

// Check 1: Environment file exists
if (fs.existsSync('.env.production')) {
  checks.passed.push('✅ .env.production file exists');
  
  const envContent = fs.readFileSync('.env.production', 'utf8');
  
  // Check required variables
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'SESSION_SECRET',
    'MEDIASOUP_ANNOUNCED_IP',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  required.forEach(key => {
    if (envContent.includes(`${key}=`) && !envContent.includes(`${key}="your-`)) {
      checks.passed.push(`✅ ${key} is configured`);
    } else {
      checks.failed.push(`❌ ${key} is missing or not configured`);
    }
  });
} else {
  checks.failed.push('❌ .env.production file not found');
}

// Check 2: Package.json has required scripts
const pkg = require('./package.json');
if (pkg.scripts.start) {
  checks.passed.push('✅ Start script exists');
} else {
  checks.failed.push('❌ Start script missing in package.json');
}

// Check 3: Docker files exist
if (fs.existsSync('Dockerfile.prod')) {
  checks.passed.push('✅ Dockerfile.prod exists');
} else {
  checks.warnings.push('⚠️  Dockerfile.prod not found (needed for Docker deployment)');
}

if (fs.existsSync('docker-compose.prod.yml')) {
  checks.passed.push('✅ docker-compose.prod.yml exists');
} else {
  checks.warnings.push('⚠️  docker-compose.prod.yml not found (needed for Docker deployment)');
}

// Check 4: Prisma schema exists
if (fs.existsSync('packages/database/schema.prisma') || fs.existsSync('prisma/schema.prisma')) {
  checks.passed.push('✅ Prisma schema found');
} else {
  checks.failed.push('❌ Prisma schema not found');
}

// Check 5: Next.js config
if (fs.existsSync('apps/web/next.config.js')) {
  checks.passed.push('✅ Next.js config exists');
} else {
  checks.failed.push('❌ Next.js config not found');
}

// Print results
console.log('📊 RESULTS:\n');

if (checks.passed.length > 0) {
  console.log('✅ PASSED CHECKS:');
  checks.passed.forEach(check => console.log(`   ${check}`));
  console.log('');
}

if (checks.warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  checks.warnings.forEach(check => console.log(`   ${check}`));
  console.log('');
}

if (checks.failed.length > 0) {
  console.log('❌ FAILED CHECKS:');
  checks.failed.forEach(check => console.log(`   ${check}`));
  console.log('');
  console.log('❌ Production deployment NOT ready!\n');
  process.exit(1);
} else {
  console.log('✅ All checks passed! Ready for production deployment.\n');
  console.log('📝 Deployment Options:');
  console.log('   1. Railway:  npm run railway:deploy');
  console.log('   2. Vercel:   vercel --prod');
  console.log('   3. Docker:   docker-compose -f docker-compose.prod.yml up -d');
  console.log('');
}
