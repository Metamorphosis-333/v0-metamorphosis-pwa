"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getProfile, isOnboardingComplete } from "@/lib/local-storage"

export default function HomePage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if user has completed onboarding via localStorage
    const profile = getProfile()
    const onboardingDone = isOnboardingComplete()

    if (profile && onboardingDone && profile.name && profile.age && profile.weight && profile.height) {
      router.replace("/dashboard")
    } else {
      router.replace("/landing")
    }
    setIsChecking(false)
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F3E8FF" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}
