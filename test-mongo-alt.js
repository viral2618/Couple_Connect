const { MongoClient } = require('mongodb')

// Try without SSL verification (for testing only)
const uri = "mongodb+srv://viral:viral12@coupleconnect.crvqwnd.mongodb.net/couple_connect?retryWrites=true&w=majority&ssl=true&tlsAllowInvalidCertificates=true"

async function testConnectionAlt() {
  console.log('🔄 Testing alternative connection...')
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 15000,
  })

  try {
    await client.connect()
    console.log('✅ Alternative connection successful!')
    
    const db = client.db('couple_connect')
    const collections = await db.listCollections().toArray()
    
    console.log(`\n📊 Database has ${collections.length} collections`)
    
    if (collections.length === 0) {
      console.log('📭 Database is empty - no collections found')
    } else {
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments()
        console.log(`📋 ${col.name}: ${count} documents`)
      }
    }
    
  } catch (error) {
    console.error('❌ Still failed:', error.message)
    console.log('\n🔧 Try these steps:')
    console.log('1. Restart your MongoDB Atlas cluster')
    console.log('2. Check Network Access settings in Atlas')
    console.log('3. Verify your cluster is in the correct region')
    console.log('4. Try connecting from MongoDB Compass first')
  } finally {
    await client.close()
  }
}

testConnectionAlt()