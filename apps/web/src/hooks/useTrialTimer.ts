import { useAuth } from '@/contexts/AuthContext'

export function useTrialStatus() {
  const { user } = useAuth()

  if (!user || user.isPremium) {
    return { isOnTrial: false, isExpired: false, daysRemaining: 0 }
  }

  return {
    isOnTrial: user.trial.isActive,
    isExpired: user.trial.isExpired,
    daysRemaining: user.trial.daysRemaining
  }
}
