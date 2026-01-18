"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { VoiceButton } from "@/components/voice-button"
import { QuoteBanner } from "@/components/quote-banner"
import { Progress } from "@/components/ui/progress"
import { Mic } from "lucide-react"
import { type UnitSystem, getUnitLabels, lbsToKg, kgToLbs, inchesToCm, cmToInches } from "@/lib/unit-conversion"
import { saveProfile, addWeightLog, setOnboardingComplete, getProfile } from "@/lib/local-storage"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [heightFeet, setHeightFeet] = useState("")
  const [heightInches, setHeightInches] = useState("")
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial")
  const [goal, setGoal] = useState<"weight_loss" | "weight_gain" | "muscle_building" | "maintaining" | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()

  const GOALS = [
    { id: "weight_loss", label: "Weight Loss", description: "Shed pounds and feel lighter" },
    { id: "weight_gain", label: "Weight Gain", description: "Build mass and strength" },
    { id: "muscle_building", label: "Muscle Building", description: "Sculpt and define" },
    { id: "maintaining", label: "Maintaining", description: "Stay where you are" },
  ] as const

  const progress = (step / 3) * 100
  const unitLabels = getUnitLabels(unitSystem)

  useEffect(() => {
    // Check if user already has a profile, pre-fill if exists
    const existingProfile = getProfile()
    if (existingProfile) {
      setName(existingProfile.name || "")
      setAge(existingProfile.age?.toString() || "")
      if (existingProfile.unit_preference) {
        setUnitSystem(existingProfile.unit_preference)
      }
    }
setIsReady(true)
  }, [])

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
        // Convert total inches to cm
        setHeight(inchesToCm(heightNum).toFixed(0))
        setHeightFeet("")
        setHeightInches("")
      } else if (newSystem === "imperial" && unitSystem === "metric") {
        // Convert cm to total inches, then split into feet/inches
        const totalInches = cmToInches(heightNum)
        const feet = Math.floor(totalInches / 12)
        const inches = Math.round(totalInches - feet * 12)
        setHeightFeet(feet.toString())
        setHeightInches(inches.toString())
        setHeight("")
      }
    }
    setUnitSystem(newSystem)
  }

  const handleVoiceInput =
    (field: "name" | "age" | "weight" | "height" | "heightFeet" | "heightInches") => (transcript: string) => {
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
        case "heightFeet":
          setHeightFeet(extractNumber(transcript))
          break
        case "heightInches":
          setHeightInches(extractNumber(transcript))
          break
      }
    }

  const getTotalHeight = () => {
    if (unitSystem === "imperial" && heightFeet && heightInches) {
      return (Number.parseFloat(heightFeet) * 12 + Number.parseFloat(heightInches)).toString()
    }
    return height
  }

  const handleNext = () => {
    if (step === 1 && !name) return
    if (step === 2) {
      // Check for valid height input based on unit system
      if (unitSystem === "imperial") {
        if (!age || !weight || !heightFeet || !heightInches) return
      } else {
        if (!age || !weight || !height) return
      }
      const totalHeight = getTotalHeight()
      setHeight(totalHeight)
    }
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const weightInLbs = unitSystem === "metric" ? kgToLbs(Number.parseFloat(weight)) : Number.parseFloat(weight)
      const totalHeight = getTotalHeight()
      const heightInInches =
        unitSystem === "metric" ? cmToInches(Number.parseFloat(totalHeight)) : Number.parseFloat(totalHeight)

// Save profile to localStorage
      saveProfile({
        name,
        age: Number.parseInt(age),
        weight: weightInLbs,
        height: heightInInches,
        unit_preference: unitSystem,
        goal: goal || undefined,
      })

      // Create initial weight log in localStorage
      addWeightLog(weightInLbs)

      // Mark onboarding as complete
      setOnboardingComplete()

      // Navigate to dashboard
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isReady) {
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
                      Imperial (lbs / ft/in)
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

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="age">Age</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="age"
                          type="number"
                          placeholder="30"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="glass flex-1"
                          autoFocus
                          min="13"
                          max="120"
                        />
                        <VoiceButton onTranscript={handleVoiceInput("age")} size="icon" />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="weight">Weight ({unitLabels.weight})</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          placeholder={unitSystem === "imperial" ? "180" : "82"}
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="glass flex-1"
                          min="50"
                          max={unitSystem === "imperial" ? "500" : "227"}
                        />
                        <VoiceButton onTranscript={handleVoiceInput("weight")} size="icon" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {unitSystem === "imperial" ? "Range: 50-500 lbs" : "Range: 23-227 kg"}
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label>Height {unitSystem === "imperial" ? "(Feet & Inches)" : "(Centimeters)"}</Label>
                      {unitSystem === "imperial" ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              placeholder="5"
                              value={heightFeet}
                              onChange={(e) => setHeightFeet(e.target.value)}
                              className="glass flex-1"
                              min="0"
                              max="8"
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">ft</span>
                            <VoiceButton onTranscript={handleVoiceInput("heightFeet")} size="icon" />
                          </div>
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              placeholder="10"
                              value={heightInches}
                              onChange={(e) => setHeightInches(e.target.value)}
                              className="glass flex-1"
                              min="0"
                              max="11"
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">in</span>
                            <VoiceButton onTranscript={handleVoiceInput("heightInches")} size="icon" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            placeholder="178"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="glass flex-1"
                            min="0"
                            max="250"
                          />
                          <span className="text-sm text-muted-foreground whitespace-nowrap">cm</span>
                          <VoiceButton onTranscript={handleVoiceInput("height")} size="icon" />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {unitSystem === "imperial" ? "Range: 0-8 ft, 0-11 in" : "Range: 0-250 cm"}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    No judgment. This is just your starting point. Rome wasn&apos;t built in a day.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  {/* Goal Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">What's your primary goal?</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {GOALS.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setGoal(g.id)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            goal === g.id
                              ? "border-primary bg-primary/10"
                              : "border-border glass hover:border-primary/50"
                          }`}
                        >
                          <div className="font-medium text-sm">{g.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">{g.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

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
                    disabled={
                      (step === 1 && !name) || 
                      (step === 2 && (!age || !weight || (unitSystem === "imperial" ? (!heightFeet || !heightInches) : !height)))
                    }
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
