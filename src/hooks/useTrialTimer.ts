import { useState, useEffect, useCallback } from 'react'
import { usePageVisibility } from './usePageVisibility'

const TRIAL_DURATION = 20 * 60
const UPDATE_INTERVAL = 10000 // 10 seconds

export function useTrialTimer(fingerprint: string | null, resetTimer = false) {
  const [timeRemaining, setTimeRemaining] = useState(TRIAL_DURATION)
  const [isExpired, setIsExpired] = useState(false)
  const [trialExhausted, setTrialExhausted] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [localTimeRemaining, setLocalTimeRemaining] = useState(TRIAL_DURATION)
  const isVisible = usePageVisibility()

  const syncWithServer = useCallback(async (secondsToAdd = 0) => {
    if (!fingerprint) return

    try {
      if (secondsToAdd > 0) {
        // Update server with time used
        const response = await fetch('/api/trial/session', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fingerprint, secondsUsed: secondsToAdd })
        })
        const data = await response.json()
        setTimeRemaining(data.timeRemaining)
        setLocalTimeRemaining(data.timeRemaining)
        setIsExpired(data.isExpired)
        setTrialExhausted(data.trialExhausted || false)
      } else {
        // Get current session state
        const response = await fetch('/api/trial/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fingerprint, resetTimer })
        })
        const data = await response.json()
        setTimeRemaining(data.timeRemaining)
        setLocalTimeRemaining(data.timeRemaining)
        setIsExpired(data.isExpired)
        setTrialExhausted(data.trialExhausted || false)
      }
    } catch (error) {
      console.error('Trial sync error:', error)
    }
  }, [fingerprint, resetTimer])

  // Local countdown timer for UI updates
  useEffect(() => {
    if (!fingerprint || isExpired || !isVisible || trialExhausted) return

    const countdownInterval = setInterval(() => {
      setLocalTimeRemaining(prev => {
        const newTime = Math.max(0, prev - 1)
        if (newTime === 0) {
          setIsExpired(true)
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [fingerprint, isExpired, isVisible, trialExhausted])

  useEffect(() => {
    if (!fingerprint) return

    // Initial sync
    syncWithServer()

    let intervalId: NodeJS.Timeout

    if (isVisible && !isExpired && !trialExhausted) {
      intervalId = setInterval(() => {
        const now = Date.now()
        const secondsElapsed = Math.floor((now - lastUpdate) / 1000)
        
        if (secondsElapsed >= 10) { // Sync every 10 seconds
          syncWithServer(secondsElapsed)
          setLastUpdate(now)
        }
      }, UPDATE_INTERVAL)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
        // Final sync on cleanup
        const now = Date.now()
        const secondsElapsed = Math.floor((now - lastUpdate) / 1000)
        if (secondsElapsed > 0) {
          syncWithServer(secondsElapsed)
        }
      }
    }
  }, [fingerprint, isVisible, isExpired, lastUpdate, syncWithServer, resetTimer, trialExhausted])

  return { timeRemaining: localTimeRemaining, isExpired, trialExhausted }
}