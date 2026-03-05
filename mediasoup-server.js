const mediasoup = require('mediasoup')

const workers = []
let nextWorkerIdx = 0

const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000
  }
]

async function createWorker() {
  const worker = await mediasoup.createWorker({
    logLevel: 'warn',
    rtcMinPort: 10000,
    rtcMaxPort: 10100
  })

  worker.on('died', () => {
    console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid)
    setTimeout(() => process.exit(1), 2000)
  })

  return worker
}

async function initializeWorkers() {
  try {
    const numWorkers = Math.max(1, Object.keys(require('os').cpus()).length)
    console.log(`Initializing ${numWorkers} MediaSoup workers...`)
    for (let i = 0; i < numWorkers; i++) {
      const worker = await createWorker()
      workers.push(worker)
      console.log(`MediaSoup worker ${i + 1}/${numWorkers} created [pid:${worker.pid}]`)
    }
    console.log(`All ${numWorkers} MediaSoup workers initialized successfully`)
  } catch (error) {
    console.error('Failed to initialize MediaSoup workers:', error)
    throw error
  }
}

function getNextWorker() {
  if (workers.length === 0) {
    throw new Error('No MediaSoup workers available')
  }
  const worker = workers[nextWorkerIdx]
  nextWorkerIdx = (nextWorkerIdx + 1) % workers.length
  return worker
}

const rooms = new Map()

async function createRoom(roomId) {
  if (rooms.has(roomId)) return rooms.get(roomId)

  const worker = getNextWorker()
  const router = await worker.createRouter({ mediaCodecs })

  const room = {
    id: roomId,
    router,
    peers: new Map(),
    createdAt: Date.now()
  }

  rooms.set(roomId, room)
  return room
}

function setupMediasoupHandlers(io, socket) {
  socket.on('getRouterRtpCapabilities', async ({ roomId }, callback) => {
    try {
      console.log(`[MediaSoup] Getting RTP capabilities for room: ${roomId}`)
      const room = await createRoom(roomId)
      console.log(`[MediaSoup] Room created/retrieved: ${roomId}`)
      callback({ rtpCapabilities: room.router.rtpCapabilities })
    } catch (error) {
      console.error(`[MediaSoup] Error getting RTP capabilities:`, error)
      callback({ error: error.message })
    }
  })

  socket.on('createWebRtcTransport', async ({ roomId, direction }, callback) => {
    try {
      const room = rooms.get(roomId)
      if (!room) throw new Error('Room not found')

      const transport = await room.router.createWebRtcTransport({
        listenIps: [{ 
          ip: '0.0.0.0', 
          announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP 
        }],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true
      })

      if (!room.peers.has(socket.id)) {
        room.peers.set(socket.id, { transports: new Map(), producers: new Map(), consumers: new Map() })
      }

      room.peers.get(socket.id).transports.set(transport.id, transport)

      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters
      })
    } catch (error) {
      callback({ error: error.message })
    }
  })

  socket.on('connectWebRtcTransport', async ({ roomId, transportId, dtlsParameters }, callback) => {
    try {
      const room = rooms.get(roomId)
      const peer = room?.peers.get(socket.id)
      const transport = peer?.transports.get(transportId)

      if (!transport) throw new Error('Transport not found')

      await transport.connect({ dtlsParameters })
      callback({ success: true })
    } catch (error) {
      callback({ error: error.message })
    }
  })

  socket.on('produce', async ({ roomId, transportId, kind, rtpParameters }, callback) => {
    try {
      const room = rooms.get(roomId)
      const peer = room?.peers.get(socket.id)
      const transport = peer?.transports.get(transportId)

      if (!transport) throw new Error('Transport not found')

      const producer = await transport.produce({ kind, rtpParameters })
      peer.producers.set(producer.id, producer)

      // Notify other peers
      socket.to(roomId).emit('newProducer', { producerId: producer.id, peerId: socket.id, kind })

      callback({ id: producer.id })
    } catch (error) {
      callback({ error: error.message })
    }
  })

  socket.on('consume', async ({ roomId, transportId, producerId, rtpCapabilities }, callback) => {
    try {
      const room = rooms.get(roomId)
      const peer = room?.peers.get(socket.id)
      const transport = peer?.transports.get(transportId)

      if (!transport) throw new Error('Transport not found')

      if (!room.router.canConsume({ producerId, rtpCapabilities })) {
        throw new Error('Cannot consume')
      }

      const consumer = await transport.consume({
        producerId,
        rtpCapabilities,
        paused: true
      })

      peer.consumers.set(consumer.id, consumer)

      callback({
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters
      })
    } catch (error) {
      callback({ error: error.message })
    }
  })

  socket.on('resumeConsumer', async ({ roomId, consumerId }, callback) => {
    try {
      const room = rooms.get(roomId)
      const peer = room?.peers.get(socket.id)
      const consumer = peer?.consumers.get(consumerId)

      if (!consumer) throw new Error('Consumer not found')

      await consumer.resume()
      callback({ success: true })
    } catch (error) {
      callback({ error: error.message })
    }
  })

  socket.on('getProducers', async ({ roomId }, callback) => {
    try {
      const room = rooms.get(roomId)
      if (!room) throw new Error('Room not found')

      const producers = []
      for (const [peerId, peer] of room.peers.entries()) {
        if (peerId !== socket.id) {
          for (const [producerId, producer] of peer.producers.entries()) {
            producers.push({ producerId, peerId, kind: producer.kind })
          }
        }
      }

      callback({ producers })
    } catch (error) {
      callback({ error: error.message })
    }
  })

  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms.entries()) {
      const peer = room.peers.get(socket.id)
      if (peer) {
        // Close all transports
        for (const transport of peer.transports.values()) {
          transport.close()
        }
        room.peers.delete(socket.id)

        // Notify other peers
        socket.to(roomId).emit('peerClosed', { peerId: socket.id })

        // Clean up empty rooms
        if (room.peers.size === 0) {
          room.router.close()
          rooms.delete(roomId)
        }
      }
    }
  })
}

module.exports = { initializeWorkers, setupMediasoupHandlers }
