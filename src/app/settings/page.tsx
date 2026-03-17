'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/Logo'
import UserAvatar from '@/components/UserAvatar'

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout, checkAuth } = useAuth()

  const [name, setName] = useState('')

  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user?.name])
  const [savingName, setSavingName] = useState(false)
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [deletingAccount, setDeletingAccount] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!user) return null

  const handleSaveName = async () => {
    if (!name.trim() || name.trim() === user.name) return
    setSavingName(true)
    setNameMsg(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        await checkAuth()
        setNameMsg({ ok: true, text: 'Name updated successfully!' })
      } else {
        setNameMsg({ ok: false, text: data.error || 'Failed to update name' })
      }
    } catch {
      setNameMsg({ ok: false, text: 'Something went wrong' })
    } finally {
      setSavingName(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdMsg({ ok: false, text: 'Please fill all fields' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ ok: false, text: 'New passwords do not match' })
      return
    }
    if (newPassword.length < 8) {
      setPwdMsg({ ok: false, text: 'Password must be at least 8 characters' })
      return
    }
    setSavingPwd(true)
    setPwdMsg(null)
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setPwdMsg({ ok: true, text: 'Password changed successfully!' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPwdMsg({ ok: false, text: data.error || 'Failed to change password' })
      }
    } catch {
      setPwdMsg({ ok: false, text: 'Something went wrong' })
    } finally {
      setSavingPwd(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    try {
      const res = await fetch('/api/user/account', { method: 'DELETE' })
      if (res.ok) {
        await logout()
      }
    } catch {
      setDeletingAccount(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fff0f6 0%, #ffffff 40%, #f0f4ff 100%)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-pink-100/60">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size={32} />
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <UserAvatar name={user.name} avatar={user.avatar} size={56} />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Account Info
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Display Name</label>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="Your name"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName || !name.trim() || name.trim() === user.name}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingName ? 'Saving…' : 'Save'}
              </button>
            </div>
            {nameMsg && (
              <p className={`text-xs mt-1 ${nameMsg.ok ? 'text-green-600' : 'text-red-500'}`}>{nameMsg.text}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
            <div className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-500 select-all">
              {user.email}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className={`w-2 h-2 rounded-full ${user.isVerified ? 'bg-green-500' : 'bg-amber-400'}`} />
            <span className="text-sm text-gray-600">
              {user.isVerified ? 'Email verified' : 'Email not verified'}
            </span>
            {user.isPremium && (
              <span className="ml-auto flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Premium
              </span>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Change Password
          </h2>

          <div className="space-y-3">
            {[
              { label: 'Current Password', value: currentPassword, set: setCurrentPassword },
              { label: 'New Password', value: newPassword, set: setNewPassword },
              { label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword },
            ].map(({ label, value, set }) => (
              <div key={label} className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
                <input
                  type="password"
                  value={value}
                  onChange={e => set(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  placeholder="••••••••"
                />
              </div>
            ))}
          </div>

          {pwdMsg && (
            <p className={`text-xs ${pwdMsg.ok ? 'text-green-600' : 'text-red-500'}`}>{pwdMsg.text}</p>
          )}

          <button
            onClick={handleChangePassword}
            disabled={savingPwd}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingPwd ? 'Updating…' : 'Update Password'}
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-1">
          <h2 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Links
          </h2>
          {[
            { label: 'Edit Profile Photo', href: '/profile', icon: '🖼️' },
            { label: 'Partner Info', href: '/partner', icon: '💕' },
            { label: 'Notifications', href: '/notifications', icon: '🔔' },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700"
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 space-y-3">
          <h2 className="font-bold text-red-600 text-base flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            Danger Zone
          </h2>

          <button
            onClick={() => { logout() }}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full border border-red-200 text-red-600 text-sm font-semibold py-3 rounded-xl hover:bg-red-50 transition-colors"
            >
              Delete Account
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <p className="text-sm text-red-700 font-medium text-center">Are you sure? This cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="flex-1 bg-red-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {deletingAccount ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
