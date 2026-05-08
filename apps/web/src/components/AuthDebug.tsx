'use client'

import { useAuth } from '@/contexts/AuthContext'

export function AuthDebug() {
  const { user, loading } = useAuth()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm z-50">
      <div className="font-bold mb-2">Auth Debug:</div>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {user ? 'Logged in' : 'Not logged in'}</div>
      {user && (
        <div>
          <div>ID: {user.id}</div>
          <div>Name: {user.name}</div>
          <div>Email: {user.email}</div>
        </div>
      )}
    </div>
  )
}