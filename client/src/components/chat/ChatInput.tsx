import { useState } from 'react'

interface ChatInputProps {
  newMessage: string
  setNewMessage: (message: string) => void
  sendMessage: () => void
}

export default function ChatInput({ newMessage, setNewMessage, sendMessage }: ChatInputProps) {
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

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
    <div className="bg-white/80 backdrop-blur-md border-t border-rose-200/50 p-4 shadow-lg">
      {showGifPicker && (
        <div className="mb-4 p-4 border border-rose-200 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-rose-700 flex items-center">
              <span className="mr-2">🎉</span>Choose a GIF
            </h4>
            <button 
              onClick={() => setShowGifPicker(false)}
              className="text-rose-500 hover:text-rose-700 font-bold text-lg transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {popularGifs.map((gif, index) => (
              <img
                key={index}
                src={gif}
                alt={`GIF ${index + 1}`}
                className="w-full h-20 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={() => handleGifSelect(gif)}
              />
            ))}
          </div>
        </div>
      )}
      
      {showEmojiPicker && (
        <div className="mb-4 p-4 border border-rose-200 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-rose-700 flex items-center">
              <span className="mr-2">😊</span>Choose an Emoji
            </h4>
            <button 
              onClick={() => setShowEmojiPicker(false)}
              className="text-rose-500 hover:text-rose-700 font-bold text-lg transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {popularEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiSelect(emoji)}
                className="text-2xl p-2 rounded-lg hover:bg-rose-100 transition-all duration-200 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex space-x-3">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="px-4 py-3 text-sm bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 rounded-xl hover:from-rose-200 hover:to-pink-200 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          😊 Emoji
        </button>
        <button
          onClick={() => setShowGifPicker(!showGifPicker)}
          className="px-4 py-3 text-sm bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 rounded-xl hover:from-rose-200 hover:to-pink-200 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          🎉 GIF
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... 💕"
          className="flex-1 px-4 py-3 border-2 border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 bg-white/90 placeholder-rose-400 transition-all duration-200"
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
        >
          Send 💕
        </button>
      </div>
    </div>
  )
}