"use client"

interface ProteinProgressRingProps {
  current: number
  goal: number
}

export function ProteinProgressRing({ current, goal }: ProteinProgressRingProps) {
  const safeGoal = goal > 0 ? goal : 1 // Prevent division by zero
  const safeCurrent = current || 0
  const percentage = Math.min((safeCurrent / safeGoal) * 100, 100)
  const circumference = 2 * Math.PI * 70 // radius of 70
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
        {/* Background circle */}
        <circle cx="80" cy="80" r="70" stroke="hsl(var(--muted))" strokeWidth="12" fill="none" className="opacity-20" />
        {/* Progress circle */}
        <circle
          cx="80"
          cy="80"
          r="70"
          stroke="hsl(var(--primary))"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-4xl font-bold">{safeCurrent}g</p>
        <p className="text-sm text-muted-foreground">of {goal}g</p>
        <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(0)}% complete</p>
      </div>
    </div>
  )
}
