// Quick Video Call Fix - Test this first
const { io } = require('socket.io-client');

// Test with consistent room ID format
const roomId = 'test-room-123';
const user1Id = 'user1';
const user2Id = 'user2';

console.log('Testing video call fix...');

const socket1 = io('http://localhost:3000');
const socket2 = io('http://localhost:3000');

let step = 0;

socket1.on('connect', () => {
  console.log('✅ User1 connected');
  step++;
  if (step === 2) startTest();
});

socket2.on('connect', () => {
  console.log('✅ User2 connected');
  step++;
  if (step === 2) startTest();
});

function startTest() {
  console.log('\n🚀 Starting video call test...');
  
  // User 1 joins room
  socket1.emit('join-video-room', { roomId, userId: user1Id });
  
  setTimeout(() => {
    // User 2 joins room
    socket2.emit('join-video-room', { roomId, userId: user2Id });
  }, 500);
}

// Listen for events
socket1.on('video-room-joined', (data) => {
  console.log('User1 joined room:', data);
});

socket2.on('video-room-joined', (data) => {
  console.log('User2 joined room:', data);
  
  // Start signaling test
  setTimeout(() => {
    console.log('\n📡 Testing WebRTC signaling...');
    socket1.emit('video-signal', {
      signal: { type: 'offer', sdp: 'test-offer' },
      roomId,
      userId: user1Id
    });
  }, 1000);
});

socket1.on('user-joined-video', (data) => {
  console.log('User1 sees user joined:', data);
});

socket2.on('user-joined-video', (data) => {
  console.log('User2 sees user joined:', data);
});

socket2.on('video-signal', (data) => {
  console.log('✅ User2 received signal:', data.signal.type);
  
  // Send answer back
  socket2.emit('video-signal', {
    signal: { type: 'answer', sdp: 'test-answer' },
    roomId,
    userId: user2Id
  });
});

socket1.on('video-signal', (data) => {
  console.log('✅ User1 received signal:', data.signal.type);
  console.log('\n🎉 Video call signaling working!');
  process.exit(0);
});

socket1.on('video-error', (error) => {
  console.error('❌ User1 error:', error);
});

socket2.on('video-error', (error) => {
  console.error('❌ User2 error:', error);
});

setTimeout(() => {
  console.log('❌ Test timeout');
  process.exit(1);
}, 10000);