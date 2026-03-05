const fs = require('fs')
const path = require('path')

console.log('========================================')
console.log('Video Calling Diagnostics')
console.log('========================================\n')

// Check environment variables
console.log('1. Checking Environment Configuration...')
const envPath = path.join(__dirname, '.env.production')

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  // Check MEDIASOUP_ANNOUNCED_IP
  const ipMatch = envContent.match(/MEDIASOUP_ANNOUNCED_IP=(.*)/)
  if (ipMatch) {
    const ip = ipMatch[1].trim()
    if (!ip || ip === '0.0.0.0' || ip === '') {
      console.log('   ❌ MEDIASOUP_ANNOUNCED_IP is not set correctly')
      console.log('   Current value:', ip || '(empty)')
      console.log('   Action: Run ./setup-video-production.sh to configure')
    } else {
      console.log('   ✓ MEDIASOUP_ANNOUNCED_IP:', ip)
    }
  } else {
    console.log('   ❌ MEDIASOUP_ANNOUNCED_IP not found in .env.production')
  }
  
  // Check port configuration
  const minPort = envContent.match(/MEDIASOUP_MIN_PORT=(.*)/)
  const maxPort = envContent.match(/MEDIASOUP_MAX_PORT=(.*)/)
  
  if (minPort && maxPort) {
    console.log('   ✓ Port range:', minPort[1].trim(), '-', maxPort[1].trim())
  } else {
    console.log('   ⚠ Port range not configured')
  }
} else {
  console.log('   ❌ .env.production file not found')
}

console.log('\n2. Checking Dependencies...')

// Check if mediasoup is installed
try {
  const packageJson = require('./package.json')
  if (packageJson.dependencies['mediasoup']) {
    console.log('   ✓ mediasoup:', packageJson.dependencies['mediasoup'])
  } else {
    console.log('   ❌ mediasoup not found in dependencies')
  }
  
  if (packageJson.dependencies['mediasoup-client']) {
    console.log('   ✓ mediasoup-client:', packageJson.dependencies['mediasoup-client'])
  } else {
    console.log('   ❌ mediasoup-client not found in dependencies')
  }
} catch (err) {
  console.log('   ❌ Error reading package.json:', err.message)
}

console.log('\n3. Checking Server Files...')

const serverFiles = [
  'server.js',
  'mediasoup-server.js',
  'src/components/VideoCall.tsx'
]

serverFiles.forEach(file => {
  const filePath = path.join(__dirname, file)
  if (fs.existsSync(filePath)) {
    console.log('   ✓', file)
  } else {
    console.log('   ❌', file, 'not found')
  }
})

console.log('\n4. Docker Configuration...')

const dockerComposePath = path.join(__dirname, 'docker-compose.prod.yml')
if (fs.existsSync(dockerComposePath)) {
  const dockerContent = fs.readFileSync(dockerComposePath, 'utf8')
  
  // Check if ports are exposed
  if (dockerContent.includes('10000') || dockerContent.includes('10100')) {
    console.log('   ✓ MediaSoup ports configured in docker-compose')
  } else {
    console.log('   ⚠ MediaSoup ports may not be exposed in docker-compose')
  }
  
  console.log('   ✓ docker-compose.prod.yml exists')
} else {
  console.log('   ❌ docker-compose.prod.yml not found')
}

console.log('\n========================================')
console.log('Recommendations:')
console.log('========================================\n')

console.log('For Production Deployment:')
console.log('1. Run: chmod +x setup-video-production.sh')
console.log('2. Run: ./setup-video-production.sh')
console.log('3. Ensure cloud firewall allows ports 10000-10100 (UDP/TCP)')
console.log('4. Restart application: docker-compose -f docker-compose.prod.yml restart')
console.log('5. Check logs: docker-compose -f docker-compose.prod.yml logs -f app')
console.log('\nFor Railway/Vercel:')
console.log('- Set MEDIASOUP_ANNOUNCED_IP environment variable to your deployment IP')
console.log('- Note: Some platforms may not support UDP, limiting video calling')
console.log('')
