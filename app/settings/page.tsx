"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SettingsContent } from "@/components/settings-content"
import { getProfile, isOnboardingComplete, type LocalProfile } from "@/lib/local-storage"

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<LocalProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userProfile = getProfile()
    const onboardingDone = isOnboardingComplete()

    if (!userProfile || !onboardingDone) {
      router.replace("/onboarding")
      return
    }

    setProfile(userProfile)
    setIsLoading(false)
  }, [router])

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return <SettingsContent profile={profile} />
}
