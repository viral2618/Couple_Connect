const fs = require('fs')
const path = require('path')

// Create search index directory in your project
const searchDir = path.join(__dirname, 'search-data')
if (!fs.existsSync(searchDir)) {
  fs.mkdirSync(searchDir, { recursive: true })
}

// Initialize search index file
const indexFile = path.join(searchDir, 'users-index.json')
if (!fs.existsSync(indexFile)) {
  fs.writeFileSync(indexFile, JSON.stringify({
    users: [],
    lastUpdated: new Date().toISOString()
  }, null, 2))
}

console.log('✅ Custom search engine setup completed!')
console.log('📁 Search data directory:', searchDir)
console.log('🔧 Integrated with your existing server - no separate port needed!')
console.log('🚀 Run your server normally with npm run dev')