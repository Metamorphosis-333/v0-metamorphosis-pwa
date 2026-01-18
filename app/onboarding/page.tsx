"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { VoiceButton } from "@/components/voice-button"
import { QuoteBanner } from "@/components/quote-banner"
import { Progress } from "@/components/ui/progress"
import { Mic } from "lucide-react"
import { type UnitSystem, getUnitLabels, lbsToKg, kgToLbs, inchesToCm, cmToInches } from "@/lib/unit-conversion"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  const progress = (step / 3) * 100
  const unitLabels = getUnitLabels(unitSystem)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
      } else {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router])

  const handleUnitToggle = (newSystem: UnitSystem) => {
    // Convert existing values to new unit system
    if (weight) {
      const weightNum = Number.parseFloat(weight)
      if (newSystem === "metric" && unitSystem === "imperial") {
        setWeight(lbsToKg(weightNum).toFixed(1))
      } else if (newSystem === "imperial" && unitSystem === "metric") {
        setWeight(kgToLbs(weightNum).toFixed(1))
      }
    }
    if (height) {
      const heightNum = Number.parseFloat(height)
      if (newSystem === "metric" && unitSystem === "imperial") {
        setHeight(inchesToCm(heightNum).toFixed(0))
      } else if (newSystem === "imperial" && unitSystem === "metric") {
        setHeight(cmToInches(heightNum).toFixed(0))
      }
    }
    setUnitSystem(newSystem)
  }

  const handleVoiceInput = (field: "name" | "age" | "weight" | "height") => (transcript: string) => {
    // Parse numbers from voice input
    const extractNumber = (text: string) => {
      const match = text.match(/\d+/)
      return match ? match[0] : text
    }

    switch (field) {
      case "name":
        setName(transcript)
        break
      case "age":
        setAge(extractNumber(transcript))
        break
      case "weight":
        setWeight(extractNumber(transcript))
        break
      case "height":
        setHeight(extractNumber(transcript))
        break
    }
  }

  const handleNext = () => {
    if (step === 1 && !name) return
    if (step === 2 && (!age || !weight || !height)) return

    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const weightInLbs = unitSystem === "metric" ? kgToLbs(Number.parseFloat(weight)) : Number.parseFloat(weight)
      const heightInInches = unitSystem === "metric" ? cmToInches(Number.parseFloat(height)) : Number.parseFloat(height)

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        name,
        age: Number.parseInt(age),
        weight: weightInLbs,
        height: heightInInches,
        unit_preference: unitSystem,
      })

      if (profileError) throw profileError

      // Create initial weight log
      const { error: weightError } = await supabase.from("weight_logs").insert({
        user_id: user.id,
        weight: weightInLbs,
      })

      if (weightError) throw weightError

      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            The Metamorphosis
          </h1>
          <p className="text-muted-foreground">Let&apos;s begin your transformation</p>
        </div>

        <Progress value={progress} className="h-2" />

        <QuoteBanner />

        <Card className="glass-strong border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 && (
                <>
                  <span>Who are you?</span>
                  <Mic className="w-5 h-5 text-primary animate-pulse" />
                </>
              )}
              {step === 2 && "The Numbers"}
              {step === 3 && "Let's Set Your Goals"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us your name"}
              {step === 2 && "Your current biometrics"}
              {step === 3 && "We'll use these to track your metamorphosis"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">What should we call you?</Label>
                    <div className="flex gap-2">
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="glass"
                        autoFocus
                      />
                      <VoiceButton onTranscript={handleVoiceInput("name")} size="icon" />
                    </div>
                    <p className="text-xs text-muted-foreground">Tap the mic or type. We're flexible like that.</p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 p-3 rounded-lg glass">
                    <button
                      type="button"
                      onClick={() => handleUnitToggle("imperial")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        unitSystem === "imperial"
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Imperial (lbs / in)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnitToggle("metric")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        unitSystem === "metric"
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Metric (kg / cm)
                    </button>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="age">Age</Label>
                    <div className="flex gap-2">
                      <Input
                        id="age"
                        type="number"
                        placeholder="30"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="glass"
                        autoFocus
                      />
                      <VoiceButton onTranscript={handleVoiceInput("age")} size="icon" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="weight">Weight ({unitLabels.weight})</Label>
                    <div className="flex gap-2">
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder={unitSystem === "imperial" ? "180" : "82"}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="glass"
                      />
                      <VoiceButton onTranscript={handleVoiceInput("weight")} size="icon" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="height">Height ({unitLabels.height})</Label>
                    <div className="flex gap-2">
                      <Input
                        id="height"
                        type="number"
                        step="0.1"
                        placeholder={unitSystem === "imperial" ? "70" : "178"}
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="glass"
                      />
                      <VoiceButton onTranscript={handleVoiceInput("height")} size="icon" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No judgment. This is just your starting point. Rome wasn&apos;t built in a day.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg glass space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Daily Protein Goal</span>
                      <span className="text-2xl font-bold text-primary">
                        {weight ? Math.round(Number.parseFloat(weight) * (unitSystem === "imperial" ? 0.8 : 1.76)) : 0}g
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {unitSystem === "imperial"
                        ? "Based on 0.8g per lb of body weight"
                        : "Based on 1.76g per kg of body weight"}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg glass space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Starting Weight</span>
                      <span className="text-2xl font-bold">{weight ? `${weight} ${unitLabels.weight}` : "--"}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg glass space-y-2">
                    <p className="text-sm font-medium">What you'll get:</p>
                    <ul className="text-xs text-muted-foreground space-y-2">
                      <li>✓ Daily mood-based recipe recommendations</li>
                      <li>✓ Voice-first nutrition logging</li>
                      <li>✓ Weight tracking & progress charts</li>
                      <li>✓ AI therapy chat when you need it</li>
                      <li>✓ Stoic philosophy delivered with wit</li>
                    </ul>
                  </div>

                  <p className="text-xs text-center text-muted-foreground italic">
                    "The obstacle is the way." — Marcus Aurelius (probably wasn't talking about meal prep, but it still
                    applies)
                  </p>
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 glass">
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    onClick={handleNext}
                    className="flex-1"
                    disabled={(step === 1 && !name) || (step === 2 && (!age || !weight || !height))}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="flex-1" disabled={isLoading}>
                    {isLoading ? "Creating your journey..." : "Begin Metamorphosis"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">Step {step} of 3 · Use voice or keyboard</p>
      </div>
    </div>
  )
}
