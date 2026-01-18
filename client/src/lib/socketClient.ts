import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SERVER_URL || window.location.origin
      : 'http://localhost:3000'
    
    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export default getSocket