import { useEffect } from 'react'

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
}

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
}

export default function MessageList({ messages, currentUserId, isLoading, messagesEndRef }: MessageListProps) {
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, messagesEndRef])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-200 border-t-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-600 font-medium">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">💕</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Start Your Conversation</h3>
          <p className="text-rose-600">Send your first message to begin chatting!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-scroll p-6 space-y-4 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50" style={{scrollbarWidth: 'thin', scrollbarColor: '#f9a8d4 #fdf2f8'}}>
      {messages.map((message) => {
        const isOwn = message.senderId === currentUserId
        
        return (
          <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
              isOwn 
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' 
                : 'bg-white text-gray-800 border border-rose-200/50'
            }`}>
              {message.content.startsWith('[GIF:') && message.content.endsWith(']') ? (
                <img 
                  src={message.content.slice(5, -1)} 
                  alt="GIF" 
                  className="max-w-full h-auto rounded-xl"
                  style={{ maxHeight: '200px' }}
                />
              ) : (
                <p className="text-sm leading-relaxed">{message.content}</p>
              )}
              <p className={`text-xs mt-2 ${isOwn ? 'text-rose-100' : 'text-rose-500'}`}>
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}