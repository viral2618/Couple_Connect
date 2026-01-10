'use client'

import { useState } from 'react'
import CouplesGame from '@/components/CouplesGame'

export default function CouplesGamePage() {
  const [userId] = useState(() => Math.random().toString(36).substring(2, 15))
  const [userName] = useState(() => `Player_${Math.random().toString(36).substring(2, 8)}`)

  return <CouplesGame userId={userId} userName={userName} />
}