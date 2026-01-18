import { useState } from 'react'

interface ChatInputProps {
  newMessage: string
  setNewMessage: (message: string) => void
  sendMessage: () => void
}

export default function ChatInput({ newMessage, setNewMessage, sendMessage }: ChatInputProps) {
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
        <div className={`flex gap-1 transition-all duration-300 ${
          isExpanded ? 'flex-col' : 'flex-row'
        } sm:flex-row`}>
          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker)
              setShowGifPicker(false)
            }}
            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md active:scale-95 ${
              showEmojiPicker 
                ? 'bg-gradient-to-r from-rose-200 to-pink-200 text-rose-700' 
                : 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 hover:from-rose-200 hover:to-pink-200'
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
            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md active:scale-95 ${
              showGifPicker 
                ? 'bg-gradient-to-r from-rose-200 to-pink-200 text-rose-700' 
                : 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 hover:from-rose-200 hover:to-pink-200'
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
            placeholder="Type your message... 💕"
            rows={isExpanded ? 3 : 1}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-rose-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 bg-white/90 placeholder-rose-400 transition-all duration-200 text-sm sm:text-base resize-none"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>
        
        {/* Send Button */}
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          className="p-2 sm:p-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none active:scale-95 flex-shrink-0 min-w-[44px] flex items-center justify-center"
          title="Send Message"
        >
          <span className="text-lg">➤</span>
        </button>
      </div>
    </div>
  )
}