'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/Logo'
import { useTrialStatus } from '@/hooks/useTrialTimer'
import { TrialBanner } from '@/components/TrialBanner'
import { TrialModal } from '@/components/TrialModal'
import FullPageChat from '@/components/FullPageChat'
import UserAvatar from '@/components/UserAvatar'
import { AuthDebug } from '@/components/AuthDebug'

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
  const [error, setError] = useState<string | null>(null)
  const [incomingRequest, setIncomingRequest] = useState<Partner | null>(null)

  const { isOnTrial, isExpired: isTrialExpired, daysRemaining } = useTrialStatus()

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const storeCode = async (partnerId: string, code: string) => {
    await fetch('/api/verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id, partnerId, code })
    })
  }

  const handlePartnerSelect = async (partner: Partner) => {
    setSelectedPartner(partner)
    setIncomingRequest(null)
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

      // Generate and store our code so the partner can see it on their screen
      const code = generateVerificationCode()
      setVerificationCode(code)
      setShowVerification(true)
      await storeCode(partner.id, code)

    } catch (error) {
      console.error('Partnership check failed:', error)
      setError('Failed to connect with partner. Please try again.')
      const code = generateVerificationCode()
      setVerificationCode(code)
      setShowVerification(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Accept an incoming request from a partner who selected us
  const handleAcceptIncoming = async (partner: Partner) => {
    setSelectedPartner(partner)
    setIncomingRequest(null)
    const code = generateVerificationCode()
    setVerificationCode(code)
    setShowVerification(true)
    await storeCode(partner.id, code)
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
        body: JSON.stringify({ userId: user?.id, partnerId: selectedPartner?.id, enteredCode })
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

  // Poll for incoming partner requests (when someone selects us — no search needed)
  useEffect(() => {
    if (!user || verifiedPartner || showVerification) return

    const poll = async () => {
      const res = await fetch('/api/verification')
      if (!res.ok) return
      const data = await res.json()
      if (data.hasPendingRequest && data.requester) {
        setIncomingRequest(data.requester)
      }
    }

    poll() // check immediately on mount
    const interval = setInterval(poll, 4000)
    return () => clearInterval(interval)
  }, [user, verifiedPartner, showVerification])

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-pink-50 border border-pink-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm font-medium">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  if (verifiedPartner) {
    return (
      <div className="h-screen flex flex-col bg-white">
        {(isOnTrial || isTrialExpired) && (
          <TrialBanner daysRemaining={daysRemaining} onUpgrade={() => router.push('/login')} />
        )}
        <TrialModal isOpen={isTrialExpired} />
        <div className="flex-1 min-h-0">
          <FullPageChat
            currentUser={{
              id: user.id,
              name: user.name,
              avatar: user.avatar ?? undefined
            }}
            partner={{
              id: verifiedPartner.id,
              name: verifiedPartner.name,
              avatar: verifiedPartner.avatar || undefined
            }}
            onBack={() => {
              setVerifiedPartner(null)
              if (user?.id) localStorage.removeItem(`verifiedPartner_${user.id}`)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {isOnTrial && (
        <TrialBanner daysRemaining={daysRemaining} onUpgrade={() => router.push('/login')} />
      )}
      <TrialModal isOpen={isTrialExpired} />

      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/home')}
              className="text-gray-500 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <Logo size={32} />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  searchPartners(e.target.value)
                }}
                placeholder="Search partner..."
                className="w-48 sm:w-64 px-4 py-2 pl-9 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all bg-white"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
              </svg>

              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg max-h-64 overflow-y-auto z-50">
                  {searchResults.map((partner) => (
                    <div
                      key={partner.id}
                      onClick={() => {
                        handlePartnerSelect(partner)
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                      className="p-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-semibold">
                            {partner.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{partner.name}</p>
                          <p className="text-xs text-gray-500 truncate">{partner.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchQuery && !isLoading && searchResults.length === 0 && (
                    <div className="text-center py-6 text-gray-400">
                      <p className="text-sm font-medium">No partners found</p>
                      <p className="text-xs mt-1">Try a different name or email</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className="hidden sm:inline text-sm text-gray-500">
              Welcome, <span className="font-semibold text-gray-900">{user.name}</span>
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <AuthDebug />

        <div className="h-[calc(100vh-160px)] bg-white border border-gray-100 rounded-2xl overflow-hidden relative">
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm shadow-sm">
              {error}
            </div>
          )}

          {incomingRequest && !showVerification && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white border border-pink-200 shadow-lg rounded-2xl px-5 py-4 flex items-center gap-4 max-w-sm w-full">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">{incomingRequest.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{incomingRequest.name} wants to connect!</p>
                <p className="text-xs text-gray-500">Accept to exchange verification codes</p>
              </div>
              <button
                onClick={() => handleAcceptIncoming(incomingRequest)}
                className="text-xs font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Accept
              </button>
            </div>
          )}

          {showVerification ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-sm w-full">
                <div className="w-14 h-14 bg-pink-50 border border-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-7 h-7 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Partner Verification</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Share your code with {selectedPartner?.name} and enter their code below
                </p>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Your code to share:</p>
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 tracking-widest">
                    {verificationCode}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 text-left">
                    Enter {selectedPartner?.name}'s code:
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all bg-white"
                  />
                </div>

                <div className="space-y-3">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={verifyPartnership}
                    disabled={isVerifying || !enteredCode.trim()}
                    className="w-full bg-gray-900 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Verifying...
                      </span>
                    ) : 'Verify & Start Chat'}
                  </button>

                  <button
                    onClick={() => {
                      setShowVerification(false)
                      setSelectedPartner(null)
                      setEnteredCode('')
                      setError(null)
                      setIncomingRequest(null)
                    }}
                    className="w-full text-gray-500 hover:text-gray-700 py-2.5 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-50 border border-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Select a partner to chat</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                  Search for your partner using the search box above to start your conversation
                </p>
                <div className="mt-5 inline-flex items-center gap-2 bg-pink-50 border border-pink-100 text-pink-600 text-xs font-medium px-3 py-1.5 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure & Private
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
