'use client'

interface ChatHeaderProps {
  partner: {
    id: string
    name: string
    avatar?: string
  }
  isOnline: boolean
  onVideoCall?: () => void
}

export default function ChatHeader({ partner, isOnline, onVideoCall }: ChatHeaderProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-rose-200/50 p-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
            {partner.avatar ? (
              <img src={partner.avatar} alt={partner.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              partner.name.charAt(0).toUpperCase()
            )}
          </div>
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{partner.name}</h3>
          <p className="text-sm text-rose-600 font-medium">
            {isOnline ? '💕 Online' : '💤 Offline'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onVideoCall}
          className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
          title="Start Video Call"
        >
          📹
        </button>
      </div>
    </div>
  )
}