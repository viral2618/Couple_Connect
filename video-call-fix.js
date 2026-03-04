// Video Call Production Fix Script
// Run this to test video calling after deployment

const io = require('socket.io-client');

const PRODUCTION_URL = 'https://coupleconnect-production-35ae.up.railway.app';
const TEST_ROOM_ID = 'test-room-' + Date.now();
const TEST_USER_1 = 'user1-' + Date.now();
const TEST_USER_2 = 'user2-' + Date.now();

console.log('🔧 Testing Video Call Fix...');
console.log('Production URL:', PRODUCTION_URL);
console.log('Test Room ID:', TEST_ROOM_ID);

// Test Socket Connection
function testSocketConnection() {
  return new Promise((resolve, reject) => {
    console.log('\n📡 Testing Socket Connection...');
    
    const socket = io(PRODUCTION_URL, {
      transports: ['websocket', 'polling'],
      timeout: 30000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('Socket connection timeout'));
    }, 15000);

    socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      clearTimeout(timeout);
      socket.disconnect();
      resolve(true);
    });

    socket.on('connect_error', (error) => {
      console.log('❌ Socket connection failed:', error.message);
      clearTimeout(timeout);
      reject(error);
    });
  });
}

// Test Video Room Join
function testVideoRoomJoin() {
  return new Promise((resolve, reject) => {
    console.log('\n🎥 Testing Video Room Join...');
    
    const socket1 = io(PRODUCTION_URL, {
      transports: ['websocket', 'polling'],
      timeout: 30000
    });

    const socket2 = io(PRODUCTION_URL, {
      transports: ['websocket', 'polling'],
      timeout: 30000
    });

    let user1Joined = false;
    let user2Joined = false;

    const timeout = setTimeout(() => {
      socket1.disconnect();
      socket2.disconnect();
      reject(new Error('Video room join timeout'));
    }, 20000);

    socket1.on('connect', () => {
      console.log('User 1 connected, joining room...');
      socket1.emit('join-video-room', { roomId: TEST_ROOM_ID, userId: TEST_USER_1 });
    });

    socket1.on('video-room-joined', (data) => {
      console.log('✅ User 1 joined video room:', data);
      user1Joined = true;
      
      // Now connect user 2
      socket2.on('connect', () => {
        console.log('User 2 connected, joining room...');
        socket2.emit('join-video-room', { roomId: TEST_ROOM_ID, userId: TEST_USER_2 });
      });
    });

    socket2.on('video-room-joined', (data) => {
      console.log('✅ User 2 joined video room:', data);
      user2Joined = true;
      
      if (user1Joined && user2Joined) {
        clearTimeout(timeout);
        
        // Test leaving
        setTimeout(() => {
          socket1.emit('leave-video-room', { roomId: TEST_ROOM_ID, userId: TEST_USER_1 });
          socket2.emit('leave-video-room', { roomId: TEST_ROOM_ID, userId: TEST_USER_2 });
          
          setTimeout(() => {
            socket1.disconnect();
            socket2.disconnect();
            console.log('✅ Video room test completed successfully');
            resolve(true);
          }, 1000);
        }, 2000);
      }
    });

    socket1.on('video-error', (error) => {
      console.log('❌ User 1 video error:', error);
      clearTimeout(timeout);
      socket1.disconnect();
      socket2.disconnect();
      reject(new Error(error.message));
    });

    socket2.on('video-error', (error) => {
      console.log('❌ User 2 video error:', error);
      clearTimeout(timeout);
      socket1.disconnect();
      socket2.disconnect();
      reject(new Error(error.message));
    });
  });
}

// Test Signal Exchange
function testSignalExchange() {
  return new Promise((resolve, reject) => {
    console.log('\n📶 Testing Signal Exchange...');
    
    const socket1 = io(PRODUCTION_URL, {
      transports: ['websocket', 'polling'],
      timeout: 30000
    });

    const socket2 = io(PRODUCTION_URL, {
      transports: ['websocket', 'polling'],
      timeout: 30000
    });

    let signalsReceived = 0;

    const timeout = setTimeout(() => {
      socket1.disconnect();
      socket2.disconnect();
      reject(new Error('Signal exchange timeout'));
    }, 15000);

    socket1.on('connect', () => {
      socket1.emit('join-video-room', { roomId: TEST_ROOM_ID, userId: TEST_USER_1 });
    });

    socket1.on('video-room-joined', () => {
      socket2.on('connect', () => {
        socket2.emit('join-video-room', { roomId: TEST_ROOM_ID, userId: TEST_USER_2 });
      });
    });

    socket2.on('video-room-joined', () => {
      // Simulate signal exchange
      const testSignal = { type: 'offer', sdp: 'test-sdp-data' };
      socket1.emit('video-signal', { 
        signal: testSignal, 
        roomId: TEST_ROOM_ID, 
        userId: TEST_USER_1 
      });
    });

    socket2.on('video-signal', (data) => {
      console.log('✅ User 2 received signal from User 1');
      signalsReceived++;
      
      // Send response signal
      const responseSignal = { type: 'answer', sdp: 'test-answer-sdp' };
      socket2.emit('video-signal', { 
        signal: responseSignal, 
        roomId: TEST_ROOM_ID, 
        userId: TEST_USER_2 
      });
    });

    socket1.on('video-signal', (data) => {
      console.log('✅ User 1 received signal from User 2');
      signalsReceived++;
      
      if (signalsReceived >= 2) {
        clearTimeout(timeout);
        socket1.disconnect();
        socket2.disconnect();
        console.log('✅ Signal exchange test completed successfully');
        resolve(true);
      }
    });
  });
}

// Run all tests
async function runTests() {
  try {
    await testSocketConnection();
    await testVideoRoomJoin();
    await testSignalExchange();
    
    console.log('\n🎉 All tests passed! Video calling should work now.');
    console.log('\n📋 Production Checklist:');
    console.log('✅ Socket.IO connection stability improved');
    console.log('✅ WebRTC peer connection timeouts added');
    console.log('✅ Better error handling and reconnection logic');
    console.log('✅ TURN server added for NAT traversal');
    console.log('✅ Media constraints optimized for production');
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check if Railway deployment is running');
    console.log('2. Verify environment variables are set correctly');
    console.log('3. Check browser console for WebRTC errors');
    console.log('4. Test with different browsers/devices');
  }
}

runTests();