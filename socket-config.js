// Socket.IO Configuration for Production
module.exports = {
  getSocketConfig: (isProduction) => {
    const baseConfig = {
      path: '/socket.io/',
      serveClient: false,
      pingInterval: 25000,
      pingTimeout: 60000,
      upgradeTimeout: 30000,
      maxHttpBufferSize: 1e8,
      allowEIO3: true,
      connectTimeout: 45000
    }

    if (isProduction) {
      return {
        ...baseConfig,
        transports: ['polling', 'websocket'],
        cors: {
          origin: function(origin, callback) {
            if (!origin) return callback(null, true)
            
            const allowedOrigins = [
              process.env.NEXT_PUBLIC_APP_URL,
              'https://coupleconnect-production-35ae.up.railway.app',
              /https:\/\/.*\.up\.railway\.app$/,
              'https://couple-connect.vercel.app',
              /https:\/\/.*\.vercel\.app$/
            ]
            
            const isAllowed = allowedOrigins.some(allowed => {
              if (typeof allowed === 'string') {
                return allowed === origin
              } else if (allowed instanceof RegExp) {
                return allowed.test(origin)
              }
              return false
            })
            
            console.log(`[SOCKET.IO] CORS check - Origin: ${origin}, Allowed: ${isAllowed}`)
            callback(null, isAllowed)
          },
          methods: ['GET', 'POST'],
          credentials: true,
          allowedHeaders: ['*']
        }
      }
    }

    return {
      ...baseConfig,
      transports: ['polling', 'websocket'],
      cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    }
  },

  getClientConfig: (socketUrl) => {
    return {
      path: '/socket.io/',
      transports: ['polling', 'websocket'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      autoConnect: true,
      forceNew: false,
      multiplex: true
    }
  }
}
