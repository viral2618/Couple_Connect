import { useState, useCallback } from 'react'

export interface VideoCallState {
  isCallActive: boolean
  roomId: string | null
  partnerId: string | null
}

export function useVideoCall() {
  const [callState, setCallState] = useState<VideoCallState>({
    isCallActive: false,
    roomId: null,
    partnerId: null
  })

  const startCall = useCallback((roomId: string, partnerId: string) => {
    setCallState({
      isCallActive: true,
      roomId,
      partnerId
    })
  }, [])

  const endCall = useCallback(() => {
    setCallState({
      isCallActive: false,
      roomId: null,
      partnerId: null
    })
  }, [])

  return {
    callState,
    startCall,
    endCall
  }
}