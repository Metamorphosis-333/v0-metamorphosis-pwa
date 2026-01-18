"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getProfile, isOnboardingComplete } from "@/lib/local-storage"

export default function LandingPage() {
  const router = useRouter()
  const [hasExistingData, setHasExistingData] = useState(false)

  useEffect(() => {
    // Check if user already has data
    const profile = getProfile()
    const onboardingDone = isOnboardingComplete()
    setHasExistingData(!!(profile && onboardingDone))
  }, [])

  const handleGetStarted = () => {
    router.push("/onboarding")
  }

  const handleContinue = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: "#F3E8FF" }}>
      {/* Wispy Milky Way Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main nebula wisps - increased opacity for visibility */}
        <div className="absolute -top-20 left-0 w-[800px] h-[500px] bg-gradient-to-br from-purple-400/40 via-violet-300/30 to-transparent rounded-full blur-[120px] transform -rotate-12" />
        <div className="absolute top-1/4 -right-20 w-[600px] h-[450px] bg-gradient-to-bl from-indigo-400/35 via-purple-300/25 to-transparent rounded-full blur-[100px] transform rotate-6" />
        <div className="absolute -bottom-20 -left-20 w-[700px] h-[500px] bg-gradient-to-tr from-violet-400/35 via-purple-300/25 to-transparent rounded-full blur-[110px] transform rotate-12" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[400px] bg-gradient-to-tl from-indigo-400/30 via-violet-300/20 to-transparent rounded-full blur-[90px]" />
        
        {/* Central glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/10 via-purple-200/5 to-transparent rounded-full blur-[80px]" />
        
        {/* Subtle star-like sparkles - increased size and opacity */}
        <div className="absolute top-[15%] left-[20%] w-1.5 h-1.5 bg-white/60 rounded-full shadow-sm" />
        <div className="absolute top-[25%] right-[30%] w-1 h-1 bg-white/50 rounded-full" />
        <div className="absolute top-[40%] left-[15%] w-1 h-1 bg-white/45 rounded-full" />
        <div className="absolute top-[60%] right-[20%] w-1.5 h-1.5 bg-white/55 rounded-full shadow-sm" />
        <div className="absolute top-[70%] left-[35%] w-1 h-1 bg-white/40 rounded-full" />
        <div className="absolute top-[30%] left-[60%] w-1 h-1 bg-white/50 rounded-full" />
        <div className="absolute top-[80%] right-[40%] w-1.5 h-1.5 bg-white/45 rounded-full" />
        <div className="absolute top-[10%] right-[15%] w-1 h-1 bg-white/55 rounded-full shadow-sm" />
        <div className="absolute top-[50%] left-[80%] w-1 h-1 bg-white/40 rounded-full" />
        <div className="absolute top-[85%] left-[10%] w-1.5 h-1.5 bg-white/50 rounded-full" />
        <div className="absolute top-[5%] left-[50%] w-1 h-1 bg-white/60 rounded-full shadow-sm" />
        <div className="absolute top-[45%] right-[10%] w-1 h-1 bg-white/45 rounded-full" />
        
        {/* Diagonal milky way band - increased visibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-300/15 to-transparent transform -skew-y-12" />
      </div>

      {/* Main container */}
      <div className="relative z-10 max-w-md w-full flex flex-col items-center text-center space-y-8">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <Image
            src="/images/metamorphosis.jpeg"
            alt="Metamorphosis Butterfly Mascot"
            width={192}
            height={192}
            priority
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </div>

        {/* Title with Cursive Font */}
        <div className="space-y-2">
          <h1
            className="text-5xl font-bold text-black"
            style={{
              fontFamily: "Playwrite AU, cursive",
              letterSpacing: "-0.02em",
            }}
          >
            Metamorphosis
          </h1>
          <p className="text-gray-600 text-sm font-medium tracking-wide">Transform your fitness journey</p>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-base leading-relaxed">
          Your AI-powered fitness transformation companion. Track, learn, and evolve with our intelligent coaching
          system.
        </p>

        <div className="w-full space-y-3 pt-4">
          {/* Primary Action: Get Started (solid black) */}
          <button
            onClick={handleGetStarted}
            className="w-full py-3 px-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            Get Started
          </button>

          {/* Secondary Action: Continue (if has data) */}
          {hasExistingData && (
            <button
              onClick={handleContinue}
              className="w-full py-3 px-4 bg-transparent border-2 border-black hover:bg-black/5 text-black font-semibold rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              Continue to Dashboard
            </button>
          )}
        </div>

        {/* Footer text */}
        <div className="pt-6 border-t border-gray-300/30 space-y-2">
          <p className="text-xs text-gray-600">Your data is stored locally on this device.</p>
          <p className="text-xs text-gray-500">No account required. No data leaves your device.</p>
        </div>
      </div>
    </div>
  )
}
