'use client'

interface PasswordStrengthProps {
  password: string
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = (password: string) => {
    let score = 0
    let feedback = []
    
    // Length check
    if (password.length >= 12) score += 30
    else if (password.length >= 8) score += 20
    else feedback.push('Use at least 8 characters')
    
    // Character variety
    if (/[a-z]/.test(password)) score += 15
    else feedback.push('Add lowercase letters')
    
    if (/[A-Z]/.test(password)) score += 15
    else feedback.push('Add uppercase letters')
    
    if (/[0-9]/.test(password)) score += 15
    else feedback.push('Add numbers')
    
    if (/[^A-Za-z0-9]/.test(password)) score += 25
    else feedback.push('Add special characters (!@#$%^&*)')
    
    // Common patterns (reduce score)
    if (/123|abc|password|qwerty/i.test(password)) score -= 20
    if (/^[a-zA-Z]+$/.test(password)) score -= 10
    if (/^[0-9]+$/.test(password)) score -= 15
    
    return { score: Math.max(0, Math.min(100, score)), feedback }
  }

  const { score, feedback } = getStrength(password)
  
  const getColor = () => {
    if (score < 40) return 'bg-red-500'
    if (score < 60) return 'bg-orange-500'
    if (score < 80) return 'bg-yellow-500'
    return 'bg-emerald-500'
  }

  const getLabel = () => {
    if (score < 40) return 'Weak'
    if (score < 60) return 'Fair'
    if (score < 80) return 'Good'
    return 'Strong'
  }

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600">Password Strength</span>
        <span className={`text-xs font-medium ${score < 40 ? 'text-red-500' : score < 60 ? 'text-orange-500' : score < 80 ? 'text-yellow-500' : 'text-emerald-500'}`}>
          {getLabel()}
        </span>
      </div>
      <div className="w-full bg-rose-100 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {feedback.length > 0 && score < 80 && (
        <div className="text-xs text-gray-500 space-y-1">
          {feedback.slice(0, 2).map((tip, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="text-rose-400">•</span>
              {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}