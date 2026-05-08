'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface DeviceTrustProps {
  deviceInfo: {
    browser: string
    os: string
    location: string
  }
  onTrust: (remember: boolean) => void
  onDeny: () => void
}

export default function DeviceTrust({ deviceInfo, onTrust, onDeny }: DeviceTrustProps) {
  const [remember, setRemember] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔍</div>
          <h2 className="text-xl font-bold text-gray-800">New Device Detected</h2>
          <p className="text-gray-600 text-sm mt-2">
            We noticed a sign-in from a new device. Is this you?
          </p>
        </div>

        <div className="bg-rose-50 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Browser:</span>
            <span className="font-medium">{deviceInfo.browser}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">OS:</span>
            <span className="font-medium">{deviceInfo.os}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">{deviceInfo.location}</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 text-rose-500 border-rose-300 rounded focus:ring-rose-400"
            />
            <span className="text-sm text-gray-700">Trust this device for 30 days</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDeny}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-all"
          >
            Not Me
          </button>
          <button
            onClick={() => onTrust(remember)}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition-all"
          >
            Yes, It's Me
          </button>
        </div>
      </motion.div>
    </div>
  )
}