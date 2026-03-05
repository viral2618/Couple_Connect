const io = require('socket.io-client')

const PRODUCTION_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://coupleconnect-production-35ae.up.railway.app'

console.log('='.repeat(60))
console.log('Socket.IO Production Connection Test')
console.log('='.repeat(60))
console.log(`Testing connection to: ${PRODUCTION_URL}`)
console.log('')

const socket = io(PRODUCTION_URL, {
  path: '/socket.io/',
  transports: ['polling', 'websocket'],
  timeout: 20000,
  reconnection: true,
  reconnectionAttempts: 3
})

let testsPassed = 0
let testsFailed = 0

socket.on('connect', () => {
  console.log('✅ Socket connected successfully!')
  console.log(`   Socket ID: ${socket.id}`)
  console.log(`   Transport: ${socket.io.engine.transport.name}`)
  testsPassed++
  
  // Test room creation
  console.log('\n📝 Testing room creation...')
  socket.emit('create_room', {
    playerName: 'TestPlayer',
    gameType: 'couples'
  })
})

socket.on('room_created', (data) => {
  console.log('✅ Room created successfully!')
  console.log(`   Room Code: ${data.roomCode}`)
  console.log(`   Room ID: ${data.roomId}`)
  console.log(`   Players: ${data.room.players.length}`)
  testsPassed++
  
  // Test complete
  console.log('\n' + '='.repeat(60))
  console.log(`Tests Passed: ${testsPassed}`)
  console.log(`Tests Failed: ${testsFailed}`)
  console.log('='.repeat(60))
  
  socket.disconnect()
  process.exit(0)
})

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message)
  testsFailed++
})

socket.on('error', (error) => {
  console.error('❌ Socket error:', error)
  testsFailed++
})

socket.on('disconnect', (reason) => {
  console.log(`\n🔌 Disconnected: ${reason}`)
})

// Timeout after 30 seconds
setTimeout(() => {
  console.error('\n❌ Test timeout - connection took too long')
  console.log('\n' + '='.repeat(60))
  console.log(`Tests Passed: ${testsPassed}`)
  console.log(`Tests Failed: ${testsFailed + 1}`)
  console.log('='.repeat(60))
  socket.disconnect()
  process.exit(1)
}, 30000)
