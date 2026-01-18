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
    <div className="bg-white/95 backdrop-blur-md border-b border-rose-200/50 px-3 sm:px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-10">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-white">
            {partner.avatar ? (
              <img src={partner.avatar} alt={partner.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-sm sm:text-base">{partner.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full animate-pulse shadow-sm"></div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{partner.name}</h3>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <p className="text-xs sm:text-sm font-medium ${
              isOnline ? 'text-green-600' : 'text-gray-500'
            }">
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
        <button
          onClick={onVideoCall}
          className="p-2 sm:p-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:from-rose-600 hover:to-pink-600"
          title="Start Video Call"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        </button>
      </div>
    </div>
  )
}