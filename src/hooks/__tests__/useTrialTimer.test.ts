import { renderHook, act } from '@testing-library/react'
import { useTrialTimer } from '../useTrialTimer'
import { usePageVisibility } from '../usePageVisibility'

// Mock the usePageVisibility hook
jest.mock('../usePageVisibility')
const mockUsePageVisibility = usePageVisibility as jest.MockedFunction<typeof usePageVisibility>

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// Mock Date.now for consistent testing
const mockDateNow = jest.spyOn(Date, 'now')

describe('useTrialTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePageVisibility.mockReturnValue(true)
    mockDateNow.mockReturnValue(1000000) // Fixed timestamp
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should initialize with full trial duration for new user', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    const { result } = renderHook(() => useTrialTimer('test-fingerprint'))
    
    expect(result.current.timeRemaining).toBe(1200) // 20 minutes
    expect(result.current.isExpired).toBe(false)
  })

  it('should restore existing trial data for returning user', () => {
    const existingData = {
      fingerprint: 'test-fingerprint',
      startTime: 999000,
      elapsedTime: 300, // 5 minutes elapsed
      lastUpdate: 999500
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData))
    
    const { result } = renderHook(() => useTrialTimer('test-fingerprint'))
    
    expect(result.current.timeRemaining).toBe(900) // 15 minutes remaining
    expect(result.current.isExpired).toBe(false)
  })

  it('should mark trial as expired when time runs out', () => {
    const expiredData = {
      fingerprint: 'test-fingerprint',
      startTime: 999000,
      elapsedTime: 1200, // Full 20 minutes elapsed
      lastUpdate: 999500
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredData))
    
    const { result } = renderHook(() => useTrialTimer('test-fingerprint'))
    
    expect(result.current.timeRemaining).toBe(0)
    expect(result.current.isExpired).toBe(true)
  })

  it('should ignore data from different fingerprint', () => {
    const differentFingerprintData = {
      fingerprint: 'different-fingerprint',
      startTime: 999000,
      elapsedTime: 300,
      lastUpdate: 999500
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(differentFingerprintData))
    
    const { result } = renderHook(() => useTrialTimer('test-fingerprint'))
    
    expect(result.current.timeRemaining).toBe(1200) // Full duration for new user
    expect(result.current.isExpired).toBe(false)
  })

  it('should handle corrupted localStorage data gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json')
    
    const { result } = renderHook(() => useTrialTimer('test-fingerprint'))
    
    expect(result.current.timeRemaining).toBe(1200)
    expect(result.current.isExpired).toBe(false)
  })

  it('should not run when fingerprint is null', () => {
    const { result } = renderHook(() => useTrialTimer(null))
    
    expect(result.current.timeRemaining).toBe(1200)
    expect(result.current.isExpired).toBe(false)
    expect(mockLocalStorage.getItem).not.toHaveBeenCalled()
  })

  it('should pause timer when page is not visible', async () => {
    jest.useFakeTimers()
    mockUsePageVisibility.mockReturnValue(false) // Page not visible
    mockLocalStorage.getItem.mockReturnValue(null)
    
    const { result } = renderHook(() => useTrialTimer('test-fingerprint'))
    
    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(5000) // 5 seconds
    })
    
    // Time should not have decreased since page is not visible
    expect(result.current.timeRemaining).toBe(1200)
  })

  it('should resume timer when page becomes visible', async () => {
    jest.useFakeTimers()
    let isVisible = true
    mockUsePageVisibility.mockImplementation(() => isVisible)
    mockLocalStorage.getItem.mockReturnValue(null)
    
    const { result, rerender } = renderHook(() => useTrialTimer('test-fingerprint'))
    
    // Make page invisible
    isVisible = false
    rerender()
    
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    
    // Make page visible again
    isVisible = true
    mockDateNow.mockReturnValue(1004000) // 4 seconds later
    rerender()
    
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    
    // Timer should resume and update
    expect(result.current.timeRemaining).toBeLessThan(1200)
  })

  it('should save trial data to localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    renderHook(() => useTrialTimer('test-fingerprint'))
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'trial_data',
      expect.stringContaining('"fingerprint":"test-fingerprint"')
    )
  })

  it('should update elapsed time correctly', async () => {
    jest.useFakeTimers()
    mockLocalStorage.getItem.mockReturnValue(null)
    
    const { result } = renderHook(() => useTrialTimer('test-fingerprint'))
    
    // Simulate 10 seconds passing
    mockDateNow.mockReturnValue(1010000)
    
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    
    expect(result.current.timeRemaining).toBe(1190) // 1200 - 10 seconds
  })
})