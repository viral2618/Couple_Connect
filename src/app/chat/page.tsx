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
  
  // Trial session logic - only show if user is not verified
  const shouldShowTrial = user && !user.isVerified
  const { timeRemaining, isExpired } = useTrialTimer(shouldShowTrial ? fingerprint : null)
  const [showTrialModal, setShowTrialModal] = useState(false)

  // Generate device fingerprint for trial users
  useEffect(() => {
    if (shouldShowTrial && typeof window !== 'undefined') {
      generateFingerprint().then(setFingerprint)
    }
  }, [shouldShowTrial])

  // Show trial modal when time is running low or expired
  useEffect(() => {
    if (shouldShowTrial && (timeRemaining <= 300 || isExpired)) { // Show when 5 minutes or less
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
        // Save verified partner to localStorage
        if (user?.id) {
          localStorage.setItem(`verifiedPartner_${user.id}`, JSON.stringify(partner))
        }
        return
      }
      
      setShowVerification(true)
      const code = generateVerificationCode()
      setVerificationCode(code)
      
      // Store verification code in DB
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
        // Save verified partner to localStorage
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

  // Load verified partner from localStorage on mount
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Show full screen chat when partner is verified
  if (verifiedPartner) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        {/* Trial Banner - only show for unverified users */}
        {shouldShowTrial && (
          <TrialBanner 
            timeRemaining={timeRemaining}
            onSignUp={() => router.push('/login')}
          />
        )}
        
        {/* Trial Modal - only show for unverified users */}
        {shouldShowTrial && (
          <TrialModal 
            isOpen={showTrialModal}
            timeRemaining={timeRemaining}
          />
        )}
        
        {/* Minimal Header for Chat */}
        <header className="bg-white/90 backdrop-blur-md border-b border-rose-200/50 z-40 flex-shrink-0">
          <div className="px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-2 sm:py-3">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                <button
                  onClick={() => {
                    setVerifiedPartner(null)
                    if (user?.id) {
                      localStorage.removeItem(`verifiedPartner_${user.id}`)
                    }
                  }}
                  className="text-rose-600 hover:text-rose-700 font-medium p-1 sm:p-2 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Back to partner selection"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {verifiedPartner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-800 font-semibold text-sm sm:text-base truncate">{verifiedPartner.name}</span>
                </div>
              </div>
              <span className="text-gray-600 text-xs sm:text-sm font-medium hidden sm:block">💕 Couple Connect</span>
            </div>
          </div>
        </header>
        
        {/* Full Screen Chat */}
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Trial Banner - only show for unverified users */}
      {shouldShowTrial && (
        <TrialBanner 
          timeRemaining={timeRemaining}
          onSignUp={() => router.push('/login')}
        />
      )}
      
      {/* Trial Modal - only show for unverified users */}
      {shouldShowTrial && (
        <TrialModal 
          isOpen={showTrialModal}
          timeRemaining={timeRemaining}
        />
      )}
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-rose-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <button
                onClick={() => router.push('/home')}
                className="text-rose-600 hover:text-rose-700 font-medium p-1 sm:p-2 hover:bg-rose-50 rounded-lg transition-colors"
                title="Back to Home"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                💕 Chat
              </h1>
            </div>
            
            {/* Search and User Info */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    searchPartners(e.target.value)
                  }}
                  placeholder="Search partner..."
                  className="w-32 sm:w-64 px-3 sm:px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                />
                
                {/* Search Results Dropdown */}
                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-64 overflow-y-auto z-50">
                    {searchResults.map((partner) => (
                      <div
                        key={partner.id}
                        onClick={() => {
                          handlePartnerSelect(partner)
                          setSearchQuery('')
                          setSearchResults([])
                        }}
                        className="p-3 hover:bg-rose-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs sm:text-sm font-semibold">
                              {partner.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm">{partner.name}</p>
                            <p className="text-xs text-gray-500 truncate">{partner.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {searchQuery && !isLoading && searchResults.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <span className="text-2xl mb-2 block">🔍</span>
                        <p className="text-sm">No partners found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <span className="text-gray-600 text-xs sm:text-sm hidden sm:block">Welcome, {user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AuthDebug />
        <div className="h-[calc(100vh-200px)]">
          {/* Chat Area - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden h-full"
          >
            {/* Error Display */}
            {error && (
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            {showVerification ? (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="mb-6">
                    <span className="text-6xl mb-4 block">🔐</span>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Partner Verification</h3>
                    <p className="text-gray-600 mb-4">Share your code with {selectedPartner?.name} and enter their code below:</p>
                  </div>
                  
                  {/* Your Code to Share */}
                  <div className="bg-gradient-to-r from-rose-100 to-pink-100 p-4 rounded-2xl mb-4">
                    <p className="text-sm text-gray-600 mb-2">Your code to share:</p>
                    <div className="text-2xl font-bold text-rose-600 tracking-wider">{verificationCode}</div>
                  </div>
                  
                  {/* Enter Partner's Code */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-center text-lg font-mono"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    {/* Error Display */}
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-600 text-sm text-center">{error}</p>
                      </div>
                    )}
                    
                    <button
                      onClick={verifyPartnership}
                      disabled={isVerifying || !enteredCode.trim()}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-6 rounded-full hover:shadow-lg transition-all duration-300 disabled:opacity-50 font-medium"
                    >
                      {isVerifying ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        'Verify & Start Chat 💕'
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowVerification(false)
                        setSelectedPartner(null)
                        setEnteredCode('')
                      }}
                      className="w-full text-gray-500 hover:text-gray-700 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">💬</span>
                  <h3 className="text-xl font-semibold mb-2">Select a Partner to Chat</h3>
                  <p>Choose someone from the search results to start your conversation</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}