const { io } = require('socket.io-client');

console.log('Testing video call connection...');

// Create two socket connections to simulate two users
const socket1 = io('http://localhost:3000', {
  transports: ['websocket', 'polling']
});

const socket2 = io('http://localhost:3000', {
  transports: ['websocket', 'polling']
});

const roomId = 'test-user-1-test-user-2';
const user1Id = 'test-user-1';
const user2Id = 'test-user-2';

let connectionsReady = 0;

function checkReady() {
  connectionsReady++;
  if (connectionsReady === 2) {
    console.log('Both sockets connected, starting test...');
    startTest();
  }
}

socket1.on('connect', () => {
  console.log('Socket 1 connected:', socket1.id);
  checkReady();
});

socket2.on('connect', () => {
  console.log('Socket 2 connected:', socket2.id);
  checkReady();
});

socket1.on('user-joined-video', (data) => {
  console.log('Socket 1 received user-joined-video:', data);
});

socket2.on('user-joined-video', (data) => {
  console.log('Socket 2 received user-joined-video:', data);
});

socket1.on('video-signal', (data) => {
  console.log('Socket 1 received video-signal:', data.signal.type || 'candidate');
});

socket2.on('video-signal', (data) => {
  console.log('Socket 2 received video-signal:', data.signal.type || 'candidate');
});

socket1.on('video-error', (error) => {
  console.error('Socket 1 video error:', error);
});

socket2.on('video-error', (error) => {
  console.error('Socket 2 video error:', error);
});

function startTest() {
  console.log('\n=== Starting Video Call Test ===');
  
  // User 1 joins room
  console.log('User 1 joining room...');
  socket1.emit('join-video-room', { roomId, userId: user1Id });
  
  setTimeout(() => {
    // User 2 joins room
    console.log('User 2 joining room...');
    socket2.emit('join-video-room', { roomId, userId: user2Id });
    
    setTimeout(() => {
      // Simulate WebRTC signaling
      console.log('Simulating WebRTC offer from User 1...');
      socket1.emit('video-signal', {
        signal: { type: 'offer', sdp: 'mock-offer-sdp' },
        roomId,
        userId: user1Id
      });
      
      setTimeout(() => {
        console.log('Simulating WebRTC answer from User 2...');
        socket2.emit('video-signal', {
          signal: { type: 'answer', sdp: 'mock-answer-sdp' },
          roomId,
          userId: user2Id
        });
        
        setTimeout(() => {
          console.log('\n=== Test Complete ===');
          console.log('If you see user-joined-video and video-signal events above, the signaling is working!');
          process.exit(0);
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}

// Handle errors
socket1.on('connect_error', (error) => {
  console.error('Socket 1 connection error:', error);
});

socket2.on('connect_error', (error) => {
  console.error('Socket 2 connection error:', error);
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\nCleaning up...');
  socket1.disconnect();
  socket2.disconnect();
  process.exit(0);
});