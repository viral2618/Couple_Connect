import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: '💕 Couple Connect - Stay Connected Forever',
  description: 'The ultimate long-distance relationship app with real-time chat, video calls, and couple games. Stay connected with your partner no matter the distance.',
  keywords: 'couple app, long distance relationship, video chat, couple games, relationship app',
  authors: [{ name: 'Couple Connect Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#ec4899',
  openGraph: {
    title: '💕 Couple Connect - Stay Connected Forever',
    description: 'The ultimate long-distance relationship app with real-time chat, video calls, and couple games.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: '💕 Couple Connect - Stay Connected Forever',
    description: 'The ultimate long-distance relationship app with real-time chat, video calls, and couple games.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Couple Connect" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ec4899" />
        <meta name="theme-color" content="#ec4899" />
      </head>
      <body className="font-body antialiased bg-gradient-to-br from-love-50 via-pink-50 to-purple-50 min-h-screen">
        <AuthProvider>
          <div className="relative min-h-screen">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-pattern-hearts opacity-30 pointer-events-none" />
            
            {/* Main Content */}
            <div className="relative z-10">
              {children}
            </div>
            
            {/* Floating Hearts Animation */}
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
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
