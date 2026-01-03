const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testReply() {
  try {
    const users = await prisma.user.findMany()
    const viral = users.find(u => u.name === 'viral')
    const viruu = users.find(u => u.name === 'viruu')

    // Send reply from viruu to viral
    await prisma.message.create({
      data: {
        content: 'Hi viral! Got your message 😊',
        senderId: viruu.id,
        receiverId: viral.id
      }
    })

    // Check full conversation
    const conversation = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: viral.id, receiverId: viruu.id },
          { senderId: viruu.id, receiverId: viral.id }
        ]
      },
      include: {
        sender: { select: { name: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

    console.log('💬 Full Conversation:')
    conversation.forEach((msg, i) => {
      console.log(`${i + 1}. ${msg.sender.name}: "${msg.content}"`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testReply()