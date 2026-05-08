'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatInputProps {
  newMessage: string
  setNewMessage: (message: string) => void
  sendMessage: () => void
  replyingTo?: {
    id: string
    content: string
    sender: { name: string }
  } | null
  onCancelReply?: () => void
}

export default function ChatInput({ newMessage, setNewMessage, sendMessage, replyingTo, onCancelReply }: ChatInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
    'Gestures': ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
    'Celebration': ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🥳', '🎆', '🎇', '✨', '🎃', '🎄', '🎋', '🎍', '🎏', '🎐', '🎑', '🧧'],
    'Symbols': ['💯', '🔥', '⭐', '🌟', '✨', '💫', '💥', '💢', '💦', '💨', '🕳️', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '✅', '❌', '⭕']
  }

  const [activeCategory, setActiveCategory] = useState<keyof typeof emojiCategories>('Smileys')

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(newMessage + emoji)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [newMessage])

  return (
    <div className="bg-white/95 backdrop-blur-xl border-t border-rose-200/50 shadow-2xl">
      {/* Reply Preview */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-3 sm:px-4 pt-3 pb-2"
          >
            <div className="p-3 border-l-4 border-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 rounded-r-xl">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span className="font-semibold text-rose-700 text-xs sm:text-sm">
                    Replying to {replyingTo.sender.name}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onCancelReply}
                  className="text-rose-400 hover:text-rose-600 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 pl-6">
                {replyingTo.content.length > 80 ? `${replyingTo.content.substring(0, 80)}...` : replyingTo.content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-rose-100 bg-gradient-to-br from-white to-rose-50/30 overflow-hidden"
          >
            <div className="p-3 sm:p-4">
              {/* Category Tabs */}
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                {Object.keys(emojiCategories).map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveCategory(category as keyof typeof emojiCategories)}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                      activeCategory === category
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-rose-50 border border-rose-200'
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>

              {/* Emoji Grid */}
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-rose-300 scrollbar-track-rose-50">
                {emojiCategories[activeCategory].map((emoji, index) => (
                  <motion.button
                    key={`${emoji}-${index}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="text-2xl sm:text-3xl p-2 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-3 sm:p-4">
        <div className="flex items-end gap-2">
          {/* Emoji Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 sm:p-3 rounded-xl transition-all flex-shrink-0 ${
              showEmojiPicker
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
            }`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={replyingTo ? `Reply to ${replyingTo.sender.name}...` : "Type a message..."}
              rows={1}
              className="w-full px-4 py-3 pr-12 border-2 border-rose-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent bg-white placeholder-rose-300 text-sm sm:text-base resize-none transition-all"
              style={{ maxHeight: '120px' }}
            />
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-3 sm:p-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex-shrink-0"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  )
}