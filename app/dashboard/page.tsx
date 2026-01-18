"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardContent } from "@/components/dashboard-content"
import {
  getProfile,
  getWeightLogsLast30Days,
  getTodayNutrition,
  getTodayMoodCheck,
  isOnboardingComplete,
  type LocalProfile,
  type LocalWeightLog,
  type LocalNutritionLog,
} from "@/lib/local-storage"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<LocalProfile | null>(null)
  const [weightLogs, setWeightLogs] = useState<LocalWeightLog[]>([])
  const [todayNutrition, setTodayNutrition] = useState<LocalNutritionLog | null>(null)
  const [hasMoodCheck, setHasMoodCheck] = useState(false)

  useEffect(() => {
    // Check if user has completed onboarding
    const userProfile = getProfile()
    const onboardingDone = isOnboardingComplete()

    if (!userProfile || !onboardingDone || !userProfile.name || !userProfile.age || !userProfile.weight || !userProfile.height) {
      router.replace("/onboarding")
      return
    }

    // Load data from localStorage
    setProfile(userProfile)
    setWeightLogs(getWeightLogsLast30Days())
    setTodayNutrition(getTodayNutrition())
    setHasMoodCheck(!!getTodayMoodCheck())
    setIsLoading(false)
  }, [router])

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your journey...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardContent
      profile={profile}
      weightLogs={weightLogs}
      todayNutrition={todayNutrition}
      hasMoodCheck={hasMoodCheck}
    />
  )
}
