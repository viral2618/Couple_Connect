'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface SecuritySettingsProps {
  user: {
    email: string
    twoFactorEnabled: boolean
    trustedDevices: number
    lastPasswordChange: string
  }
  onUpdate: (setting: string, value: any) => Promise<boolean>
}

export default function SecuritySettings({ user, onUpdate }: SecuritySettingsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)

  const handleToggle2FA = async () => {
    setLoading('2fa')
    const success = await onUpdate('twoFactor', !user.twoFactorEnabled)
    if (success && !user.twoFactorEnabled) {
      setShowQR(true)
    }
    setLoading(null)
  }

  const securityItems = [
    {
      id: 'password',
      icon: '🔑',
      title: 'Password',
      description: `Last changed: ${user.lastPasswordChange}`,
      action: 'Change Password',
      critical: true
    },
    {
      id: '2fa',
      icon: '🔐',
      title: 'Two-Factor Authentication',
      description: user.twoFactorEnabled ? 'Enabled - Your account is protected' : 'Disabled - Enable for better security',
      action: user.twoFactorEnabled ? 'Disable' : 'Enable',
      toggle: true,
      enabled: user.twoFactorEnabled
    },
    {
      id: 'devices',
      icon: '📱',
      title: 'Trusted Devices',
      description: `${user.trustedDevices} devices trusted`,
      action: 'Manage Devices'
    },
    {
      id: 'sessions',
      icon: '🌐',
      title: 'Active Sessions',
      description: 'View and manage your active sessions',
      action: 'View Sessions'
    }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center">
          <span className="text-white text-lg">🛡️</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Security Settings</h2>
          <p className="text-gray-600 text-sm">Keep your account safe and secure</p>
        </div>
      </div>

      <div className="space-y-4">
        {securityItems.map((item) => (
          <motion.div
            key={item.id}
            className="flex items-center justify-between p-4 border border-rose-100 rounded-xl hover:bg-rose-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            
            {item.toggle ? (
              <button
                onClick={handleToggle2FA}
                disabled={loading === '2fa'}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  item.enabled
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                } disabled:opacity-50`}
              >
                {loading === '2fa' ? 'Loading...' : item.action}
              </button>
            ) : (
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  item.critical
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                {item.action}
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Security Score */}
      <div className="mt-6 p-4 bg-rose-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-800">Security Score</span>
          <span className="text-2xl font-bold text-rose-600">
            {user.twoFactorEnabled ? '85' : '60'}/100
          </span>
        </div>
        <div className="w-full bg-rose-200 rounded-full h-2">
          <div 
            className="bg-rose-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${user.twoFactorEnabled ? '85' : '60'}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {user.twoFactorEnabled 
            ? 'Great! Your account is well protected.' 
            : 'Enable 2FA to improve your security score.'
          }
        </p>
      </div>
    </div>
  )
}