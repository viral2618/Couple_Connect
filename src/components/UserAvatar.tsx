'use client'

interface UserAvatarProps {
  name: string
  avatar?: string | null
  size?: number
  className?: string
}

export default function UserAvatar({ name, avatar, size = 32, className = '' }: UserAvatarProps) {
  const initials = name.charAt(0).toUpperCase()

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="text-white font-semibold" style={{ fontSize: size * 0.38 }}>
        {initials}
      </span>
    </div>
  )
}
