#!/usr/bin/env node

/**
 * Test Script - Verify Game Backend Setup
 * 
 * This script checks if your game backend is properly configured
 * and can communicate with the frontend.
 */

const http = require('http');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkServer(host, port, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      path: '/health',
      method: 'GET',
      timeout: 3000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ success: true, data });
        } else {
          resolve({ success: false, error: `Status ${res.statusCode}` });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Connection timeout' });
    });

    req.end();
  });
}

async function runTests() {
  log('\n🔍 Couple Connect - Backend Verification\n', colors.cyan);
  log('━'.repeat(50), colors.blue);

  // Test 1: Check Backend Server
  log('\n📡 Test 1: Checking Backend Server (Port 4000)...', colors.yellow);
  const backendResult = await checkServer('localhost', 4000, 'Backend');
  
  if (backendResult.success) {
    log('✅ Backend server is running!', colors.green);
    log(`   Response: ${backendResult.data}`, colors.cyan);
  } else {
    log('❌ Backend server is NOT running!', colors.red);
    log(`   Error: ${backendResult.error}`, colors.red);
    log('\n💡 Solution: Run "npm run dev:api" in a terminal', colors.yellow);
  }

  // Test 2: Check Frontend Server
  log('\n📡 Test 2: Checking Frontend Server (Port 3000)...', colors.yellow);
  const frontendResult = await checkServer('localhost', 3000, 'Frontend');
  
  if (frontendResult.success) {
    log('✅ Frontend server is running!', colors.green);
  } else {
    log('❌ Frontend server is NOT running!', colors.red);
    log(`   Error: ${frontendResult.error}`, colors.red);
    log('\n💡 Solution: Run "npm run dev:web" in a terminal', colors.yellow);
  }

  // Test 3: Check Environment Variables
  log('\n📡 Test 3: Checking Environment Configuration...', colors.yellow);
  const fs = require('fs');
  const path = require('path');

  const webEnvPath = path.join(__dirname, 'apps', 'web', '.env');
  const apiEnvPath = path.join(__dirname, 'apps', 'api', '.env');

  let webEnvExists = fs.existsSync(webEnvPath);
  let apiEnvExists = fs.existsSync(apiEnvPath);

  if (webEnvExists) {
    log('✅ Frontend .env file exists', colors.green);
    const webEnv = fs.readFileSync(webEnvPath, 'utf8');
    if (webEnv.includes('NEXT_PUBLIC_SOCKET_URL=http://localhost:4000')) {
      log('✅ NEXT_PUBLIC_SOCKET_URL is correctly set to port 4000', colors.green);
    } else {
      log('⚠️  NEXT_PUBLIC_SOCKET_URL might not be set correctly', colors.yellow);
      log('   Expected: NEXT_PUBLIC_SOCKET_URL=http://localhost:4000', colors.cyan);
    }
  } else {
    log('❌ Frontend .env file not found!', colors.red);
    log('   Expected at: apps/web/.env', colors.cyan);
  }

  if (apiEnvExists) {
    log('✅ Backend .env file exists', colors.green);
    const apiEnv = fs.readFileSync(apiEnvPath, 'utf8');
    if (apiEnv.includes('PORT=4000')) {
      log('✅ Backend PORT is correctly set to 4000', colors.green);
    } else {
      log('⚠️  Backend PORT might not be set correctly', colors.yellow);
      log('   Expected: PORT=4000', colors.cyan);
    }
    if (apiEnv.includes('ALLOWED_ORIGINS')) {
      log('✅ ALLOWED_ORIGINS is configured', colors.green);
    } else {
      log('⚠️  ALLOWED_ORIGINS not found', colors.yellow);
      log('   Expected: ALLOWED_ORIGINS=http://localhost:3000', colors.cyan);
    }
  } else {
    log('❌ Backend .env file not found!', colors.red);
    log('   Expected at: apps/api/.env', colors.cyan);
  }

  // Summary
  log('\n━'.repeat(50), colors.blue);
  log('\n📊 Summary:', colors.cyan);
  
  const allGood = backendResult.success && frontendResult.success && webEnvExists && apiEnvExists;
  
  if (allGood) {
    log('\n🎉 All checks passed! Your setup is ready!', colors.green);
    log('\n✅ Backend running on http://localhost:4000', colors.green);
    log('✅ Frontend running on http://localhost:3000', colors.green);
    log('✅ Environment variables configured', colors.green);
    log('\n🚀 You can now test the game features!', colors.cyan);
    log('   1. Open http://localhost:3000', colors.cyan);
    log('   2. Go to Games page', colors.cyan);
    log('   3. Create a room', colors.cyan);
    log('   4. Open another browser window and join', colors.cyan);
  } else {
    log('\n⚠️  Some checks failed. Please fix the issues above.', colors.yellow);
    
    if (!backendResult.success) {
      log('\n🔧 To start backend:', colors.cyan);
      log('   npm run dev:api', colors.cyan);
    }
    
    if (!frontendResult.success) {
      log('\n🔧 To start frontend:', colors.cyan);
      log('   npm run dev:web', colors.cyan);
    }
    
    if (!backendResult.success && !frontendResult.success) {
      log('\n🔧 Or start both together:', colors.cyan);
      log('   npm run dev', colors.cyan);
    }
    
    if (!webEnvExists || !apiEnvExists) {
      log('\n🔧 To fix environment files:', colors.cyan);
      log('   See GAME_BACKEND_SETUP.md for configuration', colors.cyan);
    }
  }

  log('\n━'.repeat(50), colors.blue);
  log('\n📚 Documentation:', colors.cyan);
  log('   • QUICKSTART.md - Quick start guide', colors.cyan);
  log('   • GAME_BACKEND_SETUP.md - Detailed setup', colors.cyan);
  log('   • VERIFICATION_CHECKLIST.md - Full checklist', colors.cyan);
  log('   • ARCHITECTURE.md - Architecture diagrams', colors.cyan);
  log('\n');
}

// Run the tests
runTests().catch((error) => {
  log(`\n❌ Error running tests: ${error.message}`, colors.red);
  process.exit(1);
});
