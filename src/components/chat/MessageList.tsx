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
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-rose-200 border-t-rose-500 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-rose-600 font-medium text-sm sm:text-base">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="text-center p-4 sm:p-8">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">💕</div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Start Your Conversation</h3>
          <p className="text-rose-600 text-sm sm:text-base">Send your first message to begin chatting!</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="h-full overflow-y-auto px-3 sm:px-4 py-2 sm:py-4 space-y-1 sm:space-y-2 bg-gradient-to-br from-rose-50/80 via-pink-50/80 to-purple-50/80" 
      style={{
        scrollbarWidth: 'thin', 
        scrollbarColor: '#f9a8d4 #fdf2f8',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {messages.map((message, index) => {
        const isOwn = message.senderId === currentUserId
        const showAvatar = !isOwn && (index === 0 || messages[index - 1].senderId !== message.senderId)
        const isLastInGroup = index === messages.length - 1 || messages[index + 1].senderId !== message.senderId
        
        return (
          <div key={message.id} className={`flex items-end gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            {/* Avatar for received messages */}
            {!isOwn && (
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                {showAvatar && message.sender.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Message bubble */}
            <div className={`max-w-[80%] sm:max-w-[70%] md:max-w-sm lg:max-w-md px-3 py-2 shadow-sm transition-all duration-200 ${isOwn 
                ? `bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl rounded-br-md` 
                : `bg-white text-gray-800 border border-rose-100 rounded-2xl rounded-bl-md`
            }`}>
              {message.content.startsWith('[GIF:') && message.content.endsWith(']') ? (
                <img 
                  src={message.content.slice(5, -1)} 
                  alt="GIF" 
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxHeight: '120px' }}
                  loading="lazy"
                />
              ) : (
                <p className="text-sm leading-relaxed break-words">{message.content}</p>
              )}
              
              {/* Timestamp */}
              <p className={`text-xs mt-1 opacity-70 text-right ${isOwn ? 'text-rose-100' : 'text-gray-500'}`}>
                {new Date(message.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
                {isOwn && <span className="ml-1">✓</span>}
              </p>
            </div>
            
            {/* Spacer for sent messages */}
            {isOwn && <div className="w-7 sm:w-8" />}
          </div>
        )
      })}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  )
}