'use client'

import { useState, useEffect } from 'react'

interface VideoCallPermissionsProps {
  onPermissionsGranted: () => void
  onPermissionsDenied: (error: string) => void
}

export default function VideoCallPermissions({ 
  onPermissionsGranted, 
  onPermissionsDenied 
}: VideoCallPermissionsProps) {
  const [isChecking, setIsChecking] = useState(true)
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    try {
      setIsChecking(true)
      setError(null)

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support video calls')
      }

      // Check current permissions
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName })
      const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName })

      setPermissions({
        camera: cameraPermission.state === 'granted',
        microphone: microphonePermission.state === 'granted'
      })

      if (cameraPermission.state === 'granted' && microphonePermission.state === 'granted') {
        onPermissionsGranted()
      }

    } catch (error: any) {
      console.error('Permission check failed:', error)
      setError(error.message)
    } finally {
      setIsChecking(false)
    }
  }

  const requestPermissions = async () => {
    try {
      setIsChecking(true)
      setError(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      // Stop the stream immediately as we just needed permissions
      stream.getTracks().forEach(track => track.stop())

      setPermissions({
        camera: true,
        microphone: true
      })

      onPermissionsGranted()

    } catch (error: any) {
      console.error('Permission request failed:', error)
      let errorMessage = 'Failed to access camera and microphone'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera and microphone access denied. Please allow access and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found on your device.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera or microphone is already in use by another application.'
      }
      
      setError(errorMessage)
      onPermissionsDenied(errorMessage)
    } finally {
      setIsChecking(false)
    }
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-rose-200/50 max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-200 border-t-rose-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Checking Permissions</h3>
          <p className="text-gray-600">Verifying camera and microphone access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4">
      <div className="text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-rose-200/50 max-w-md mx-auto">
        <div className="text-6xl mb-6">📹</div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Video Call Permissions</h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📷</span>
              <span className="font-medium">Camera</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              permissions.camera 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {permissions.camera ? 'Granted' : 'Required'}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎤</span>
              <span className="font-medium">Microphone</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              permissions.microphone 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {permissions.microphone ? 'Granted' : 'Required'}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={requestPermissions}
            disabled={isChecking}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-6 rounded-xl hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {isChecking ? 'Requesting...' : 'Allow Camera & Microphone'}
          </button>
          
          <p className="text-xs text-gray-500">
            We need access to your camera and microphone to enable video calls. 
            Your privacy is protected and no data is stored.
          </p>
        </div>
      </div>
    </div>
  )
}