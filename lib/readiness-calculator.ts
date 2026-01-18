export interface ReadinessFactors {
  sleepHours?: number
  restingHeartRate?: number
  mood?: string
  proteinIntake?: number
  proteinGoal?: number
  workoutsCompleted?: number
  stress?: number
  dayOfWeek?: number
}

export interface ReadinessScore {
  overallScore: number
  sleepScore: number
  recoveryScore: number
  stressScore: number
  activityScore: number
  nutritionScore: number
  recommendations: string[]
}

export function calculateReadinessScore(factors: ReadinessFactors): ReadinessScore {
  let sleepScore = 0
  let recoveryScore = 0
  let stressScore = 0
  let activityScore = 0
  let nutritionScore = 0
  const recommendations: string[] = []

  // Sleep Score (0-100)
  if (factors.sleepHours !== undefined) {
    if (factors.sleepHours >= 7.5 && factors.sleepHours <= 9) {
      sleepScore = 100
    } else if (factors.sleepHours >= 6.5 && factors.sleepHours <= 9.5) {
      sleepScore = 90
    } else if (factors.sleepHours >= 6 && factors.sleepHours <= 10) {
      sleepScore = 80
    } else if (factors.sleepHours < 5) {
      sleepScore = 40
      recommendations.push("Priority: Get more sleep tonight")
    } else {
      sleepScore = 60
    }
  }

  // Recovery Score based on RHR (0-100)
  if (factors.restingHeartRate !== undefined) {
    if (factors.restingHeartRate <= 60) {
      recoveryScore = 100
    } else if (factors.restingHeartRate <= 70) {
      recoveryScore = 90
    } else if (factors.restingHeartRate <= 80) {
      recoveryScore = 75
    } else {
      recoveryScore = 60
      recommendations.push("Consider active recovery or meditation")
    }
  }

  // Stress Score (0-100)
  if (factors.mood !== undefined) {
    const stressMap = {
      stressed: 40,
      "high-energy": 85,
      neutral: 70,
      calm: 95,
    }
    stressScore = stressMap[factors.mood as keyof typeof stressMap] || 70
  }

  // Activity Score based on workouts (0-100)
  if (factors.workoutsCompleted !== undefined) {
    activityScore = Math.min(100, factors.workoutsCompleted * 25)
  }

  // Nutrition Score (0-100)
  if (factors.proteinIntake !== undefined && factors.proteinGoal !== undefined) {
    const proteinRatio = factors.proteinIntake / factors.proteinGoal
    if (proteinRatio >= 0.95 && proteinRatio <= 1.05) {
      nutritionScore = 100
    } else if (proteinRatio >= 0.85 && proteinRatio <= 1.15) {
      nutritionScore = 90
    } else if (proteinRatio >= 0.75) {
      nutritionScore = 75
    } else {
      nutritionScore = 60
      recommendations.push("Increase protein intake")
    }
  }

  // Add recommendations based on readiness
  const overallScore = Math.round((sleepScore + recoveryScore + stressScore + activityScore + nutritionScore) / 5)

  if (overallScore >= 80) {
    recommendations.unshift("You're ready for high-intensity training")
  } else if (overallScore >= 60) {
    recommendations.unshift("Moderate activity recommended today")
  } else {
    recommendations.unshift("Focus on recovery today - low-intensity activities only")
  }

  // Remove duplicates
  const uniqueRecommendations = [...new Set(recommendations)]

  return {
    overallScore,
    sleepScore,
    recoveryScore,
    stressScore,
    activityScore,
    nutritionScore,
    recommendations: uniqueRecommendations,
  }
}

export function getReadinessColor(score: number): string {
  if (score >= 80) return "green"
  if (score >= 60) return "yellow"
  return "red"
}

export function getReadinessLabel(score: number): string {
  if (score >= 85) return "Excellent"
  if (score >= 70) return "Good"
  if (score >= 50) return "Fair"
  return "Poor"
}
