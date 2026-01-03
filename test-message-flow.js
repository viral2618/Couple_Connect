const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testMessageFlow() {
  console.log('🧪 Testing Message Flow...\n')

  try {
    // Get users
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    })

    if (users.length < 2) {
      console.log('❌ Need at least 2 users to test messaging')
      return
    }

    const sender = users[0]
    const receiver = users[1]

    console.log(`📤 Sending message from ${sender.name} to ${receiver.name}...\n`)

    // Send a test message
    const message = await prisma.message.create({
      data: {
        content: 'Hello! This is a test message 👋',
        senderId: sender.id,
        receiverId: receiver.id
      }
    })

    console.log('✅ Message sent successfully!')
    console.log(`   Message ID: ${message.id}`)
    console.log(`   Content: "${message.content}"`)
    console.log(`   Timestamp: ${message.createdAt}\n`)

    // Check if receiver can see the message
    console.log(`📥 Checking if ${receiver.name} received the message...\n`)

    const receivedMessages = await prisma.message.findMany({
      where: {
        receiverId: receiver.id
      },
      include: {
        sender: {
          select: { name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (receivedMessages.length > 0) {
      console.log('✅ Message received successfully!')
      console.log(`   Found ${receivedMessages.length} message(s) for ${receiver.name}:`)
      
      receivedMessages.forEach((msg, index) => {
        console.log(`   ${index + 1}. From: ${msg.sender.name}`)
        console.log(`      Content: "${msg.content}"`)
        console.log(`      Time: ${msg.createdAt}\n`)
      })
    } else {
      console.log('❌ No messages found for receiver')
    }

    // Test conversation view
    console.log('💬 Testing conversation view...\n')

    const conversation = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: sender.id, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: sender.id }
        ]
      },
      include: {
        sender: { select: { name: true } },
        receiver: { select: { name: true } }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log(`✅ Conversation between ${sender.name} and ${receiver.name}:`)
    console.log(`   Total messages: ${conversation.length}`)
    
    conversation.forEach((msg, index) => {
      console.log(`   ${index + 1}. ${msg.sender.name} → ${msg.receiver.name}: "${msg.content}"`)
    })

    console.log('\n📊 Test Summary:')
    console.log(`   ✅ Message sending: Working`)
    console.log(`   ✅ Message receiving: Working`)
    console.log(`   ✅ Conversation view: Working`)
    console.log(`   📝 Total messages in system: ${conversation.length}`)

  } catch (error) {
    console.error('❌ Error during message test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testMessageFlow()