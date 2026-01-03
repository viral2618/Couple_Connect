const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function testChatFunctionality() {
  console.log('🧪 Testing Chat Functionality...\n')

  try {
    // Test 1: Check if users exist and are verified
    console.log('1️⃣ Checking user verification status...')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        partnerId: true
      }
    })
    
    console.log(`Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}): Verified=${user.isVerified}, Partner=${user.partnerId || 'None'}`)
    })

    if (users.length < 2) {
      console.log('❌ Need at least 2 users to test chat functionality')
      return
    }

    // Test 2: Check partnerships
    console.log('\n2️⃣ Checking partnerships...')
    const partnerships = await prisma.partnership.findMany()
    console.log(`Found ${partnerships.length} partnerships:`)
    partnerships.forEach(p => {
      console.log(`  - ${p.user1Id} ↔ ${p.user2Id} (Status: ${p.status})`)
    })

    // Test 3: Check messages
    console.log('\n3️⃣ Checking existing messages...')
    const messages = await prisma.message.findMany({
      include: {
        sender: { select: { name: true } },
        receiver: { select: { name: true } }
      }
    })
    console.log(`Found ${messages.length} messages:`)
    messages.forEach(msg => {
      console.log(`  - ${msg.sender.name} → ${msg.receiver.name}: "${msg.content}"`)
    })

    // Test 4: Test verification code creation and validation
    console.log('\n4️⃣ Testing verification system...')
    if (users.length >= 2) {
      const user1 = users[0]
      const user2 = users[1]
      
      // Create a test verification code
      const testCode = '123456'
      const hashedCode = crypto.createHash('sha256').update(testCode).digest('hex')
      
      await prisma.verificationCode.create({
        data: {
          userId: user1.id,
          partnerId: user2.id,
          code: hashedCode,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        }
      })
      
      console.log(`✅ Created test verification code for ${user1.name} → ${user2.name}`)
      
      // Test verification
      const verification = await prisma.verificationCode.findFirst({
        where: {
          userId: user1.id,
          partnerId: user2.id,
          code: hashedCode,
          expiresAt: { gt: new Date() }
        }
      })
      
      if (verification) {
        console.log('✅ Verification code validation works')
        
        // Clean up test code
        await prisma.verificationCode.delete({
          where: { id: verification.id }
        })
      } else {
        console.log('❌ Verification code validation failed')
      }
    }

    // Test 5: Check database connection
    console.log('\n5️⃣ Testing database connection...')
    const dbTest = await prisma.user.count()
    console.log(`✅ Database connection working - ${dbTest} users in database`)

    // Test 6: Identify potential issues
    console.log('\n6️⃣ Identifying potential issues...')
    const issues = []

    // Check for unverified users
    const unverifiedUsers = users.filter(u => !u.isVerified)
    if (unverifiedUsers.length > 0) {
      issues.push(`${unverifiedUsers.length} users are not verified`)
    }

    // Check for users without partners
    const usersWithoutPartners = users.filter(u => !u.partnerId)
    if (usersWithoutPartners.length > 0) {
      issues.push(`${usersWithoutPartners.length} users don't have partners set`)
    }

    // Check for orphaned verification codes
    const expiredCodes = await prisma.verificationCode.findMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    })
    if (expiredCodes.length > 0) {
      issues.push(`${expiredCodes.length} expired verification codes need cleanup`)
    }

    if (issues.length > 0) {
      console.log('⚠️ Issues found:')
      issues.forEach(issue => console.log(`  - ${issue}`))
    } else {
      console.log('✅ No issues found!')
    }

    console.log('\n📋 Test Summary:')
    console.log(`- Users: ${users.length}`)
    console.log(`- Verified users: ${users.filter(u => u.isVerified).length}`)
    console.log(`- Partnerships: ${partnerships.length}`)
    console.log(`- Messages: ${messages.length}`)
    console.log(`- Issues: ${issues.length}`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to create test partnership
async function createTestPartnership() {
  console.log('\n🔧 Creating test partnership...')
  
  try {
    const users = await prisma.user.findMany({ take: 2 })
    
    if (users.length < 2) {
      console.log('❌ Need at least 2 users to create partnership')
      return
    }

    const [user1, user2] = users

    // Create partnership
    await prisma.partnership.upsert({
      where: {
        id: 'test-partnership'
      },
      update: {},
      create: {
        user1Id: user1.id,
        user2Id: user2.id,
        status: 'VERIFIED'
      }
    })

    // Update users to set each other as partners
    await prisma.user.update({
      where: { id: user1.id },
      data: { partnerId: user2.id }
    })

    await prisma.user.update({
      where: { id: user2.id },
      data: { partnerId: user1.id }
    })

    console.log(`✅ Created partnership between ${user1.name} and ${user2.name}`)
    
  } catch (error) {
    console.error('❌ Failed to create test partnership:', error)
  }
}

// Helper function to verify users
async function verifyAllUsers() {
  console.log('\n✅ Verifying all users...')
  
  try {
    const result = await prisma.user.updateMany({
      data: { isVerified: true }
    })
    
    console.log(`✅ Verified ${result.count} users`)
    
  } catch (error) {
    console.error('❌ Failed to verify users:', error)
  }
}

// Run tests
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--create-partnership')) {
    createTestPartnership()
  } else if (args.includes('--verify-users')) {
    verifyAllUsers()
  } else {
    testChatFunctionality()
  }
}

module.exports = {
  testChatFunctionality,
  createTestPartnership,
  verifyAllUsers
}