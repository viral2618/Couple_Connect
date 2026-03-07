import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

  const [seenMessages, setSeenMessages] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Mark received messages as seen without reload
    const unseenMessages = messages.filter(msg => msg.receiverId === currentUserId && !msg.seenAt && !seenMessages.has(msg.id))
    if (unseenMessages.length > 0) {
      const partnerId = unseenMessages[0].senderId
      const messageIds = unseenMessages.map(m => m.id)
      
      // Mark locally first
      setSeenMessages(prev => new Set([...Array.from(prev), ...messageIds]))
      
      // Then update server
      fetch('/api/messages/mark-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId })
      })
    }
  }, [messages, currentUserId, seenMessages])

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
      className="h-full overflow-y-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3 bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50" 
      style={{
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {messages.map((message, index) => {
        const isOwn = message.senderId === currentUserId
        const showAvatar = !isOwn && (index === 0 || messages[index - 1].senderId !== message.senderId)
        const isLastInGroup = index === messages.length - 1 || messages[index + 1].senderId !== message.senderId
        const replyMessage = message.replyTo ? getReplyMessage(message.replyTo) : null
        const isUnseen = !isOwn && !message.seenAt && !seenMessages.has(message.id)
        const isSeen = isOwn && (message.seenAt || seenMessages.has(message.id))
        
        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            {/* Avatar for received messages */}
            {!isOwn && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: showAvatar ? 1 : 0 }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0 shadow-lg ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                {showAvatar && message.sender.name.charAt(0).toUpperCase()}
              </motion.div>
            )}
            
            {/* Message bubble */}
            <div className={`max-w-[80%] sm:max-w-[70%] md:max-w-md lg:max-w-lg relative group`}>
              {/* Message actions */}
              <div className="absolute -top-10 right-0 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-1.5 z-10 border border-rose-100">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onReply(message)}
                  className="p-2 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Reply"
                >
                  <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                  className="p-2 hover:bg-rose-50 rounded-xl transition-colors"
                  title="React"
                >
                  <span className="text-lg">😊</span>
                </motion.button>
              </div>

              {/* Quick reactions popup */}
              <AnimatePresence>
                {showReactions === message.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className="reactions-popup absolute -top-14 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-2 flex gap-1 z-20 border-2 border-rose-200"
                  >
                    {quickReactions.map((emoji) => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReactionClick(message.id, emoji)}
                        className="p-2 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <span className="text-xl">{emoji}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reply preview */}
              {replyMessage && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`mb-2 p-2.5 rounded-xl text-xs sm:text-sm border-l-4 backdrop-blur-sm ${
                    isOwn 
                      ? 'bg-white/20 border-white/50 text-white/90' 
                      : 'bg-rose-50/80 border-rose-400 text-rose-900'
                  }`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span className="font-bold text-xs">{replyMessage.sender.name}</span>
                  </div>
                  <div className="truncate opacity-90">
                    {replyMessage.content.length > 50 
                      ? `${replyMessage.content.substring(0, 50)}...` 
                      : replyMessage.content
                    }
                  </div>
                </motion.div>
              )}
              
              <div className={`px-3 sm:px-4 py-2.5 sm:py-3 shadow-lg transition-all duration-200 relative ${isOwn 
                  ? `bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-2xl rounded-br-sm` 
                  : `bg-white text-gray-800 border-2 ${isUnseen ? 'border-rose-400 shadow-rose-300/50' : 'border-gray-100'} rounded-2xl rounded-bl-sm hover:shadow-xl`
              }`}>
                {/* Unseen indicator */}
                {isUnseen && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2"
                  >
                    <div className="w-5 h-5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse shadow-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </motion.div>
                )}
                
                <p className="text-sm sm:text-base leading-relaxed break-words">{message.content}</p>
                
                {/* Timestamp and status */}
                <div className="flex items-center justify-between mt-2 gap-2">
                  <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                    {new Date(message.createdAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                  {isOwn && (
                    <div className="flex items-center gap-1">
                      {isSeen ? (
                        <div className="flex items-center gap-0.5">
                          <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <svg className="w-3 h-3 text-blue-400 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex items-center gap-0.5">
                          <svg className="w-3 h-3 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <svg className="w-3 h-3 text-white/30 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className={`absolute -bottom-3 ${isOwn ? 'left-2' : 'right-2'} flex gap-1`}>
                  {Object.entries(
                    message.reactions.reduce((acc, r) => {
                      acc[r.emoji] = (acc[r.emoji] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([emoji, count]) => {
                    const hasUserReacted = message.reactions?.some(r => r.emoji === emoji && r.userId === currentUserId)
                    return (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReactionClick(message.id, emoji)}
                        className={`min-w-[36px] h-7 px-2 rounded-full text-xs flex items-center justify-center gap-1 transition-all shadow-lg border-2 ${
                          hasUserReacted
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300'
                        }`}
                        title={hasUserReacted ? 'Remove your reaction' : 'Add this reaction'}
                      >
                        <span className="text-base leading-none">{emoji}</span>
                        {count > 1 && <span className="text-xs font-bold leading-none">{count}</span>}
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}