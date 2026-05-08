'use client'

import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import SocketInitializer from '@/components/SocketInitializer'
import { useEffect, useState } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <title>💕 Couple Connect - Stay Connected Forever</title>
        <meta name="description" content="The ultimate long-distance relationship app with real-time chat and video calls. Stay connected with your partner no matter the distance." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#ec4899" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Couple Connect" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ec4899" />
      </head>
      <body className="font-body antialiased bg-gradient-to-br from-love-50 via-pink-50 to-purple-50 min-h-screen">
        <SocketInitializer />
        <AuthProvider>
          <div className="relative min-h-screen">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-pattern-hearts opacity-30 pointer-events-none" />
            
            {/* Main Content */}
            <div className="relative z-10">
              {children}
            </div>
            
            {/* Floating Hearts Animation - Only render on client */}
            {mounted && (
              <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-float text-love-300/20"
                    style={{
                      left: `${(i * 15 + 10) % 90}%`,
                      top: `${(i * 20 + 15) % 80}%`,
                      animationDelay: `${(i * 0.8) % 4}s`,
                      animationDuration: `${4 + (i % 3)}s`,
                      fontSize: `${1.2 + (i % 2) * 0.4}rem`
                    }}
                  >
                    {['💕', '💖', '💗', '💘', '💙', '💜', '🌸', '✨'][i % 8]}
                  </div>
                ))}
              </div>
            )}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
