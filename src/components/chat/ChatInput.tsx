import { useState } from 'react'

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
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleGifSelect = (gifUrl: string) => {
    setNewMessage(`[GIF:${gifUrl}]`)
    setShowGifPicker(false)
  }

  const popularGifs = [
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif',
    'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif'
  ]

  const popularEmojis = [
    '😀', '😂', '🥰', '😍', '🤗', '😘', '😊', '😉',
    '❤️', '💕', '💖', '💗', '💙', '💜', '🧡', '💛',
    '👍', '👏', '🙌', '👋', '🤝', '💪', '🙏', '✨',
    '🎉', '🎊', '🔥', '⭐', '💯', '✅', '❌', '💔'
  ]

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(newMessage + emoji)
    setShowEmojiPicker(false)
  }

  return (
    <div className="bg-white/95 backdrop-blur-md border-t border-rose-200/50 p-2 sm:p-3 shadow-lg">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="mb-3 p-4 border-2 border-blue-200 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg animate-slideUp backdrop-blur-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-full">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
              <h4 className="font-bold text-blue-700 text-sm">
                Replying to {replyingTo.sender.name}
              </h4>
            </div>
            <button 
              onClick={onCancelReply}
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1.5 rounded-full transition-all duration-200 group"
              title="Cancel reply"
            >
              <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-sm text-gray-700 bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-blue-100 shadow-sm">
            <div className="font-medium text-blue-800 mb-1 text-xs uppercase tracking-wide opacity-75">Original Message</div>
            <div className="line-clamp-2">
              {replyingTo.content.length > 100 
                ? `${replyingTo.content.substring(0, 100)}...` 
                : replyingTo.content
              }
            </div>
          </div>
        </div>
      )}
      {/* GIF Picker */}
      {showGifPicker && (
        <div className="mb-3 p-3 border border-rose-200 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 shadow-lg animate-slideUp">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-rose-700 flex items-center text-sm">
              <span className="mr-2">🎉</span>Choose a GIF
            </h4>
            <button 
              onClick={() => setShowGifPicker(false)}
              className="text-rose-500 hover:text-rose-700 font-bold text-lg transition-colors p-1 hover:bg-rose-100 rounded-full"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {popularGifs.map((gif, index) => (
              <img
                key={index}
                src={gif}
                alt={`GIF ${index + 1}`}
                className="w-full h-16 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                onClick={() => handleGifSelect(gif)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="mb-3 p-3 border border-rose-200 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 shadow-lg animate-slideUp">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-rose-700 flex items-center text-sm">
              <span className="mr-2">😊</span>Choose an Emoji
            </h4>
            <button 
              onClick={() => setShowEmojiPicker(false)}
              className="text-rose-500 hover:text-rose-700 font-bold text-lg transition-colors p-1 hover:bg-rose-100 rounded-full"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-8 gap-1">
            {popularEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiSelect(emoji)}
                className="text-xl p-2 rounded-lg hover:bg-rose-100 transition-all duration-200 cursor-pointer active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Input Area */}
      <div className="flex items-end gap-2">
        {/* Action Buttons - Mobile: Stack vertically when expanded */}
        <div className={`flex gap-2 transition-all duration-300 ${
          isExpanded ? 'flex-col' : 'flex-row'
        } sm:flex-row`}>
          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker)
              setShowGifPicker(false)
            }}
            className={`p-2.5 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md active:scale-95 ${
              showEmojiPicker 
                ? 'bg-gradient-to-r from-amber-200 to-yellow-200 text-amber-700 scale-105' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-amber-100 hover:to-yellow-100 hover:text-amber-600'
            }`}
            title="Add Emoji"
          >
            <span className="text-lg">😊</span>
          </button>
          
          <button
            onClick={() => {
              setShowGifPicker(!showGifPicker)
              setShowEmojiPicker(false)
            }}
            className={`p-2.5 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md active:scale-95 ${
              showGifPicker 
                ? 'bg-gradient-to-r from-purple-200 to-pink-200 text-purple-700 scale-105' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-purple-100 hover:to-pink-100 hover:text-purple-600'
            }`}
            title="Add GIF"
          >
            <span className="text-lg">🎉</span>
          </button>
        </div>
        
        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              setIsExpanded(e.target.value.length > 50)
            }}
            onKeyPress={handleKeyPress}
            placeholder={replyingTo ? `Reply to ${replyingTo.sender.name}...` : "Type your message... 💕"}
            rows={isExpanded ? 3 : 1}
            className="w-full px-4 py-3 border-2 border-rose-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 bg-white/90 placeholder-rose-400 transition-all duration-200 text-sm sm:text-base resize-none shadow-sm focus:shadow-md"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>
        
        {/* Send Button */}
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none active:scale-95 flex-shrink-0 min-w-[48px] flex items-center justify-center group"
          title={replyingTo ? `Reply to ${replyingTo.sender.name}` : "Send Message"}
        >
          {replyingTo ? (
            <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          ) : (
            <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}