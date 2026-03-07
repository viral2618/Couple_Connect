'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useTrialTimer } from '@/hooks/useTrialTimer'
import { TrialBanner } from '@/components/TrialBanner'
import { TrialModal } from '@/components/TrialModal'
import FullPageChat from '@/components/FullPageChat'
import { AuthDebug } from '@/components/AuthDebug'
import { generateFingerprint } from '@/lib/fingerprint'

interface Partner {
  id: string
  name: string
  email: string
  username?: string
  avatar?: string
}

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Partner[]>([])
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [enteredCode, setEnteredCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [verifiedPartner, setVerifiedPartner] = useState<Partner | null>(null)
  const [fingerprint, setFingerprint] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const shouldShowTrial = user && !user.isVerified
  const { timeRemaining, isExpired } = useTrialTimer(shouldShowTrial ? fingerprint : null)
  const [showTrialModal, setShowTrialModal] = useState(false)

  useEffect(() => {
    if (shouldShowTrial && typeof window !== 'undefined') {
      generateFingerprint().then(setFingerprint)
    }
  }, [shouldShowTrial])

  useEffect(() => {
    if (shouldShowTrial && (timeRemaining <= 300 || isExpired)) {
      setShowTrialModal(true)
    }
  }, [shouldShowTrial, timeRemaining, isExpired])

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const handlePartnerSelect = async (partner: Partner) => {
    setSelectedPartner(partner)
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/partnership/check?partnerId=${partner.id}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.canChat === true) {
        setVerifiedPartner(partner)
        setShowVerification(false)
        setIsLoading(false)
        if (user?.id) {
          localStorage.setItem(`verifiedPartner_${user.id}`, JSON.stringify(partner))
        }
        return
      }
      
      setShowVerification(true)
      const code = generateVerificationCode()
      setVerificationCode(code)
      
      const storeResponse = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          partnerId: partner.id,
          code
        })
      })
      
      if (!storeResponse.ok) {
        throw new Error('Failed to store verification code')
      }
      
    } catch (error) {
      console.error('Partnership check failed:', error)
      setError('Failed to connect with partner. Please try again.')
      setShowVerification(true)
      const code = generateVerificationCode()
      setVerificationCode(code)
    } finally {
      setIsLoading(false)
    }
  }

  const verifyPartnership = async () => {
    if (!enteredCode.trim()) {
      setError('Please enter the verification code from your partner')
      return
    }
    
    if (enteredCode.length !== 6) {
      setError('Verification code must be 6 digits')
      return
    }
    
    setIsVerifying(true)
    setError(null)
    
    try {
      const response = await fetch('/api/verification', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          partnerId: selectedPartner?.id,
          enteredCode
        })
      })
      
      const result = await response.json()
      
      if (result.verified) {
        setVerifiedPartner(selectedPartner)
        setShowVerification(false)
        setEnteredCode('')
        setError(null)
        if (user?.id && selectedPartner) {
          localStorage.setItem(`verifiedPartner_${user.id}`, JSON.stringify(selectedPartner))
        }
      } else {
        setError(result.message || 'Invalid verification code. Please try again.')
      }
    } catch (error) {
      console.error('Verification failed:', error)
      setError('Verification failed. Please check your connection and try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      const savedPartner = localStorage.getItem(`verifiedPartner_${user.id}`)
      if (savedPartner) {
        try {
          const partner = JSON.parse(savedPartner)
          setVerifiedPartner(partner)
        } catch (error) {
          console.error('Failed to parse saved partner:', error)
          localStorage.removeItem(`verifiedPartner_${user.id}`)
        }
      }
    }
  }, [user])

  const searchPartners = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      
      if (response.ok) {
        const users = await response.json()
        const filteredUsers = users.filter((u: Partner) => u.id !== user?.id)
        setSearchResults(filteredUsers)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-love-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-love-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-2xl">💕</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (verifiedPartner) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-love-50 via-pink-50 to-purple-50">
        {shouldShowTrial && (
          <TrialBanner 
            timeRemaining={timeRemaining}
            onSignUp={() => router.push('/login')}
          />
        )}
        
        {shouldShowTrial && (
          <TrialModal 
            isOpen={showTrialModal}
            timeRemaining={timeRemaining}
          />
        )}
        
        <div className="flex-1 overflow-hidden">
          <FullPageChat 
            currentUser={user}
            partner={{
              id: verifiedPartner.id,
              name: verifiedPartner.name,
              avatar: verifiedPartner.avatar || verifiedPartner.name.charAt(0).toUpperCase()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-love-50 via-pink-50 to-purple-50">
      {shouldShowTrial && (
        <TrialBanner 
          timeRemaining={timeRemaining}
          onSignUp={() => router.push('/login')}
        />
      )}
      
      {shouldShowTrial && (
        <TrialModal 
          isOpen={showTrialModal}
          timeRemaining={timeRemaining}
        />
      )}
      
      <header className="glass backdrop-blur-xl border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push('/home')}
                className="text-love-600 hover:text-love-700 p-2 hover:bg-love-50 rounded-xl transition-all duration-200"
                title="Back to Home"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-love-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-love">
                  <span className="text-xl animate-heartbeat">💬</span>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold gradient-text">
                    Chat
                  </h1>
                  <p className="text-xs text-gray-600 hidden sm:block">Connect with your partner</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      searchPartners(e.target.value)
                    }}
                    placeholder="Search partner..."
                    className="w-48 sm:w-64 px-4 py-2 pl-10 glass backdrop-blur-sm border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-love-400 focus:border-transparent text-sm transition-all duration-300"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </div>
                </div>
                
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-full left-0 right-0 mt-2 card-glass backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl max-h-64 overflow-y-auto z-50"
                  >
                    {searchResults.map((partner) => (
                      <motion.div
                        key={partner.id}
                        whileHover={{ backgroundColor: "rgba(236, 72, 153, 0.05)" }}
                        onClick={() => {
                          handlePartnerSelect(partner)
                          setSearchQuery('')
                          setSearchResults([])
                        }}
                        className="p-4 cursor-pointer transition-all duration-200 border-b border-white/10 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-love-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-love">
                            <span className="text-white text-sm font-semibold">
                              {partner.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{partner.name}</p>
                            <p className="text-sm text-gray-600 truncate">{partner.email}</p>
                          </div>
                          <div className="text-love-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {searchQuery && !isLoading && searchResults.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <span className="text-4xl mb-3 block">🔍</span>
                        <p className="font-medium">No partners found</p>
                        <p className="text-sm">Try searching with a different name or email</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
              
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <span>Welcome,</span>
                <span className="font-semibold text-love-600">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AuthDebug />
        
        <div className="h-[calc(100vh-200px)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card-glass backdrop-blur-xl border border-white/30 overflow-hidden h-full relative"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl shadow-lg"
              >
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </motion.div>
            )}
            
            {showVerification ? (
              <div className="h-full flex items-center justify-center p-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center max-w-md w-full"
                >
                  <div className="mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-love-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-love animate-pulse">
                      <span className="text-3xl">🔐</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Partner Verification</h3>
                    <p className="text-gray-600 leading-relaxed">Share your code with {selectedPartner?.name} and enter their code below:</p>
                  </div>
                  
                  <div className="glass-love p-6 rounded-2xl mb-6 border border-love-200">
                    <p className="text-sm text-gray-600 mb-3 font-medium">Your code to share:</p>
                    <div className="text-3xl font-bold gradient-text-love tracking-wider">{verificationCode}</div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Enter {selectedPartner?.name}'s verification code:
                    </label>
                    <input
                      type="text"
                      value={enteredCode}
                      onChange={(e) => {
                        setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                        setError(null)
                      }}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full px-4 py-4 glass backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-love-400 focus:border-transparent text-center text-xl font-mono tracking-wider transition-all duration-300"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl"
                      >
                        <p className="text-red-600 text-sm text-center font-medium">{error}</p>
                      </motion.div>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(236, 72, 153, 0.3)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={verifyPartnership}
                      disabled={isVerifying || !enteredCode.trim()}
                      className="w-full btn-love py-4 text-lg relative overflow-hidden group disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          💕 Verify & Start Chat
                        </span>
                      )}
                    </motion.button>
                    
                    <button
                      onClick={() => {
                        setShowVerification(false)
                        setSelectedPartner(null)
                        setEnteredCode('')
                        setError(null)
                      }}
                      className="w-full text-gray-500 hover:text-gray-700 py-3 font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-love-200 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">💬</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-700">Select a Partner to Chat</h3>
                  <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                    Search for your partner using the search box above to start your conversation
                  </p>
                  <div className="mt-6 flex justify-center">
                    <div className="glass-love px-4 py-2 rounded-full border border-love-200">
                      <span className="text-love-600 text-sm font-medium">✨ Secure & Private ✨</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}