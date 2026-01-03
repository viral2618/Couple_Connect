const { MongoClient } = require('mongodb')

const uri = "mongodb+srv://viral:viral12@coupleconnect.crvqwnd.mongodb.net/couple_connect?retryWrites=true&w=majority"

async function testConnection() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  })

  try {
    console.log('🔄 Attempting to connect to MongoDB...')
    await client.connect()
    console.log('✅ Connected successfully!')
    
    const db = client.db('couple_connect')
    const collections = await db.listCollections().toArray()
    
    console.log(`\n📊 Found ${collections.length} collections:`)
    collections.forEach(col => console.log(`  - ${col.name}`))
    
    // Check data in each collection
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments()
      console.log(`\n📋 ${col.name}: ${count} documents`)
      
      if (count > 0) {
        const sample = await db.collection(col.name).findOne()
        console.log(`   Sample data:`, JSON.stringify(sample, null, 2).substring(0, 200) + '...')
      }
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    
    if (error.message.includes('Server selection timeout')) {
      console.log('\n💡 Possible solutions:')
      console.log('1. Check if your MongoDB Atlas cluster is running')
      console.log('2. Verify your IP is whitelisted in Atlas')
      console.log('3. Check your internet connection')
      console.log('4. Verify database credentials')
    }
  } finally {
    await client.close()
  }
}

testConnection()