import { useEffect, useState } from 'react'

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
  seenAt?: string
  replyTo?: string
  reactions?: { emoji: string; userId: string }[]
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
  onReaction: (messageId: string, emoji: string) => void
  onReply: (message: Message) => void
}

export default function MessageList({ messages, currentUserId, isLoading, messagesEndRef, onReaction, onReply }: MessageListProps) {
  const [showReactions, setShowReactions] = useState<string | null>(null)
  const [visibleMessages, setVisibleMessages] = useState<Set<string>>(new Set())

  const quickReactions = ['❤️', '😂', '👍', '😍', '😮', '😢']

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, messagesEndRef])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showReactions && !(event.target as Element).closest('.reactions-popup')) {
        setShowReactions(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showReactions])

  useEffect(() => {
    // Mark messages as seen when they become visible
    const unseenMessages = messages
      .filter(msg => msg.receiverId === currentUserId && !msg.seenAt && visibleMessages.has(msg.id))
      .map(msg => msg.id)
    
    if (unseenMessages.length > 0) {
      fetch('/api/messages/seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds: unseenMessages })
      })
    }
  }, [visibleMessages, messages, currentUserId])

  const handleReactionClick = (messageId: string, emoji: string) => {
    onReaction(messageId, emoji)
    setShowReactions(null)
  }

  const getReplyMessage = (replyToId: string) => {
    return messages.find(msg => msg.id === replyToId)
  }

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
      className="h-full overflow-y-auto px-3 sm:px-4 py-2 sm:py-4 space-y-1 sm:space-y-2 bg-gradient-to-br from-rose-50/80 via-pink-50/80 to-purple-50/80 chat-scroll" 
      style={{
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {messages.map((message, index) => {
        const isOwn = message.senderId === currentUserId
        const showAvatar = !isOwn && (index === 0 || messages[index - 1].senderId !== message.senderId)
        const isLastInGroup = index === messages.length - 1 || messages[index + 1].senderId !== message.senderId
        const replyMessage = message.replyTo ? getReplyMessage(message.replyTo) : null
        const isUnseen = !isOwn && !message.seenAt
        
        return (
          <div key={message.id} className={`flex items-end gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            {/* Avatar for received messages */}
            {!isOwn && (
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                {showAvatar && message.sender.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Message bubble */}
            <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-lg lg:max-w-xl relative group`}>
              {/* Message actions */}
              <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 bg-white rounded-full shadow-lg p-1 z-10">
                <button
                  onClick={() => onReply(message)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Reply"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="React"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>

              {/* Quick reactions popup */}
              {showReactions === message.id && (
                <div className="reactions-popup absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg p-2 flex gap-1 z-20 border">
                  {quickReactions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReactionClick(message.id, emoji)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
                    >
                      <span className="text-lg">{emoji}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Reply preview */}
              {replyMessage && (
                <div className={`mb-2 p-3 rounded-xl text-sm border-l-4 backdrop-blur-sm transition-all duration-200 ${
                  isOwn 
                    ? 'bg-white/20 border-white/50 text-white/90' 
                    : 'bg-blue-50/80 border-blue-300 text-blue-800'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span className="font-semibold text-xs opacity-80">{replyMessage.sender.name}</span>
                  </div>
                  <div className="truncate font-medium">
                    {replyMessage.content.length > 50 
                      ? `${replyMessage.content.substring(0, 50)}...` 
                      : replyMessage.content
                    }
                  </div>
                </div>
              )}
              
              <div className={`px-4 py-3 shadow-sm transition-all duration-200 relative ${isOwn 
                  ? `bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl rounded-br-md shadow-lg` 
                  : `bg-white text-gray-800 border ${isUnseen ? 'border-rose-300 shadow-rose-200/50 shadow-lg' : 'border-gray-200'} rounded-2xl rounded-bl-md hover:shadow-md`
              }`}>
                {/* Unseen indicator */}
                {isUnseen && (
                  <div className="absolute -top-2 -right-2 flex items-center justify-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                )}
                
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
                
                {/* Timestamp and status */}
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs opacity-70 ${isOwn ? 'text-rose-100' : 'text-gray-500'}`}>
                    {new Date(message.createdAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                  {isOwn && (
                    <div className="flex items-center gap-1">
                      {message.seenAt ? (
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L4 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Reactions - WhatsApp style */}
              {message.reactions && message.reactions.length > 0 && (
                <div className={`absolute -bottom-2 ${isOwn ? 'left-2' : 'right-2'} flex gap-1`}>
                  {Object.entries(
                    message.reactions.reduce((acc, r) => {
                      acc[r.emoji] = (acc[r.emoji] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([emoji, count]) => {
                    const hasUserReacted = message.reactions?.some(r => r.emoji === emoji && r.userId === currentUserId)
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleReactionClick(message.id, emoji)}
                        className={`min-w-[32px] h-6 px-1.5 rounded-full text-xs flex items-center justify-center gap-1 transition-all duration-200 hover:scale-110 shadow-md border ${
                          hasUserReacted
                            ? 'bg-blue-500 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                        title={hasUserReacted ? 'Remove your reaction' : 'Add this reaction'}
                      >
                        <span className="text-sm leading-none">{emoji}</span>
                        {count > 1 && <span className="text-xs font-medium leading-none">{count}</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}