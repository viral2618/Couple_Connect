// Test socket connection to Railway deployment
const io = require('socket.io-client');

const RAILWAY_URL = 'https://coupleconnect-production-35ae.up.railway.app';

console.log('🔌 Testing socket connection to:', RAILWAY_URL);

const socket = io(RAILWAY_URL, {
  transports: ['websocket', 'polling'],
  timeout: 10000
});

socket.on('connect', () => {
  console.log('✅ Socket connected successfully!');
  console.log('Socket ID:', socket.id);
  
  // Test creating a room
  socket.emit('create_room', {
    playerName: 'TestPlayer',
    gameType: 'couples'
  });
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection failed:', error.message);
});

socket.on('room_created', (data) => {
  console.log('🎉 Room created successfully:', data);
  socket.disconnect();
  process.exit(0);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

// Timeout after 15 seconds
setTimeout(() => {
  console.log('⏰ Connection test timed out');
  socket.disconnect();
  process.exit(1);
}, 15000);