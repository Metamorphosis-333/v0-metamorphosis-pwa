"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { VoiceButton } from "@/components/voice-button"
import { QuoteBanner } from "@/components/quote-banner"
import { AppleHealthImport } from "@/components/apple-health-import"
import { ArrowLeft, Save, User, Activity, Brain, Dumbbell, Shield, Fingerprint, Loader2 } from "lucide-react"
import Link from "next/link"
import { type UnitSystem, getUnitLabels, lbsToKg, kgToLbs, inchesToCm, cmToInches } from "@/lib/unit-conversion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isWebAuthnSupported, isPlatformAuthenticatorAvailable } from "@/lib/webauthn"
import { startRegistration } from "@simplewebauthn/browser"

interface SettingsContentProps {
  profile: {
    id: string
    name: string
    age: number
    weight: number
    height: number
    why: string
    unit_preference?: UnitSystem
    trainer_personality?: string
    psychiatrist_personality?: string
  }
}

export function SettingsContent({ profile: initialProfile }: SettingsContentProps) {
  const [name, setName] = useState(initialProfile.name)
  const [age, setAge] = useState(initialProfile.age.toString())
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [why, setWhy] = useState(initialProfile.why || "")
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(initialProfile.unit_preference || "imperial")
  const [trainerPersonality, setTrainerPersonality] = useState(initialProfile.trainer_personality || "balanced")
  const [psychiatristPersonality, setPsychiatristPersonality] = useState(
    initialProfile.psychiatrist_personality || "philosophical",
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasPasskey, setHasPasskey] = useState(false)
  const [isEnablingPasskey, setIsEnablingPasskey] = useState(false)
  const [passkeyError, setPasskeyError] = useState<string | null>(null)
  const [passkeySuccess, setPasskeySuccess] = useState(false)
  const [isBiometricSupported, setIsBiometricSupported] = useState(false)
  const router = useRouter()

  const unitLabels = getUnitLabels(unitSystem)

  // Initialize weight and height in current unit system
  useState(() => {
    if (unitSystem === "metric") {
      setWeight(lbsToKg(initialProfile.weight).toFixed(1))
      setHeight(inchesToCm(initialProfile.height).toFixed(0))
    } else {
      setWeight(initialProfile.weight.toFixed(1))
      setHeight(initialProfile.height.toFixed(0))
    }
  })

  useState(() => {
    const checkPasskeyAndSupport = async () => {
      try {
        // Check device support
        const supported = isWebAuthnSupported() && (await isPlatformAuthenticatorAvailable())
        setIsBiometricSupported(supported)

        // Check if user has passkey
        const supabase = createClient()
        const { data } = await supabase.from("passkeys").select("id").eq("user_id", initialProfile.id).limit(1)

        setHasPasskey((data?.length || 0) > 0)
      } catch (error) {
        console.error("Error checking passkey:", error)
      }
    }
    checkPasskeyAndSupport()
  })

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

  const handleVoiceInput = (field: "name" | "age" | "weight" | "height" | "why") => (transcript: string) => {
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
      case "why":
        setWhy(transcript)
        break
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    const supabase = createClient()

    try {
      // Convert to imperial for storage
      const weightInLbs = unitSystem === "metric" ? kgToLbs(Number.parseFloat(weight)) : Number.parseFloat(weight)
      const heightInInches = unitSystem === "metric" ? cmToInches(Number.parseFloat(height)) : Number.parseFloat(height)

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name,
          age: Number.parseInt(age),
          weight: weightInLbs,
          height: heightInInches,
          why,
          unit_preference: unitSystem,
          trainer_personality: trainerPersonality,
          psychiatrist_personality: psychiatristPersonality,
        })
        .eq("id", initialProfile.id)

      if (updateError) throw updateError

      // If weight changed, add a new weight log
      if (weightInLbs !== initialProfile.weight) {
        const { error: weightError } = await supabase.from("weight_logs").insert({
          user_id: initialProfile.id,
          weight: weightInLbs,
        })

        if (weightError) throw weightError
      }

      setSuccess(true)
      router.refresh()

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnableBiometric = async () => {
    setIsEnablingPasskey(true)
    setPasskeyError(null)
    setPasskeySuccess(false)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.email) {
        throw new Error("User email not found")
      }

      // Start registration
      const optionsResponse = await fetch("/api/passkey/register/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: initialProfile.name,
        }),
      })

      if (!optionsResponse.ok) {
        throw new Error("Failed to start passkey registration")
      }

      const options = await optionsResponse.json()

      // Create credential
      const credential = await startRegistration(options)

      // Finish registration
      const finishResponse = await fetch("/api/passkey/register/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          credential,
          challenge: options.challenge,
          deviceName: navigator.userAgent.includes("iPhone")
            ? "iPhone"
            : navigator.userAgent.includes("Mac")
              ? "Mac"
              : "Device",
        }),
      })

      if (!finishResponse.ok) {
        throw new Error("Failed to complete passkey registration")
      }

      setHasPasskey(true)
      setPasskeySuccess(true)

      setTimeout(() => setPasskeySuccess(false), 3000)
    } catch (err) {
      console.error("[v0] Passkey registration error:", err)
      setPasskeyError(err instanceof Error ? err.message : "Failed to enable biometric login")
    } finally {
      setIsEnablingPasskey(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="glass">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Customize your Metamorphosis experience</p>
          </div>
        </div>

        <QuoteBanner />

        {/* Profile Information */}
        <Card className="glass-strong border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass"
                  placeholder="Your name"
                />
                <VoiceButton onTranscript={handleVoiceInput("name")} size="icon" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="age">Age</Label>
              <div className="flex gap-2">
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="glass"
                  placeholder="30"
                />
                <VoiceButton onTranscript={handleVoiceInput("age")} size="icon" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Your Why</Label>
              <div className="flex gap-2">
                <Textarea
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  className="glass min-h-[100px]"
                  placeholder="What drives your transformation?"
                />
                <VoiceButton onTranscript={handleVoiceInput("why")} size="icon" />
              </div>
              <p className="text-xs text-muted-foreground">
                This reminder will appear on your dashboard to keep you motivated
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Biometrics */}
        <Card className="glass-strong border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Biometrics
            </CardTitle>
            <CardDescription>Track your physical measurements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label htmlFor="weight">Weight ({unitLabels.weight})</Label>
              <div className="flex gap-2">
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="glass"
                  placeholder={unitSystem === "imperial" ? "180" : "82"}
                />
                <VoiceButton onTranscript={handleVoiceInput("weight")} size="icon" />
              </div>
              <p className="text-xs text-muted-foreground">
                Updating weight will create a new log entry for tracking progress
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="height">Height ({unitLabels.height})</Label>
              <div className="flex gap-2">
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="glass"
                  placeholder={unitSystem === "imperial" ? "70" : "178"}
                />
                <VoiceButton onTranscript={handleVoiceInput("height")} size="icon" />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <div className="space-y-2 mb-4">
                <h3 className="text-base font-medium">Data Sync</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Import weight, height, and heart rate data from Apple Health. Accepts both export.zip and export.xml
                  files.
                </p>
              </div>
              <AppleHealthImport userId={initialProfile.id} unitSystem={unitSystem} />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="glass-strong border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your authentication methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-primary" />
                    <Label className="text-base">FaceID / Biometric Login</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {hasPasskey
                      ? "Biometric authentication is enabled on this device"
                      : "Use Face ID, Touch ID, or other device biometrics for quick, secure login"}
                  </p>
                </div>
              </div>

              {!isBiometricSupported ? (
                <div className="p-4 rounded-lg glass bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-sm text-muted-foreground">
                    Passkeys are not supported on this device or browser. Try using Safari on iPhone or Mac.
                  </p>
                </div>
              ) : hasPasskey ? (
                <div className="p-4 rounded-lg glass bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-green-500 font-medium">Biometric login is active</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    You can now use Face ID or Touch ID to sign in on this device
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleEnableBiometric}
                  disabled={isEnablingPasskey}
                  className="w-full h-14 text-base"
                  size="lg"
                >
                  {isEnablingPasskey ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Setting up biometrics...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-5 w-5" />
                      Enable FaceID / Biometric Login
                    </>
                  )}
                </Button>
              )}

              {passkeyError && (
                <div className="p-4 rounded-lg glass bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{passkeyError}</p>
                </div>
              )}

              {passkeySuccess && (
                <div className="p-4 rounded-lg glass bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-500">Biometric login enabled successfully!</p>
                </div>
              )}

              <div className="p-4 rounded-lg glass bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your biometric data never leaves your device. Passkeys use Face ID or Touch ID to securely
                  authenticate without passwords. You can enable biometric login on multiple devices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Personalities */}
        <Card className="glass-strong border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Personalities
            </CardTitle>
            <CardDescription>Customize how your AI coaches interact with you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                <Label>Trainer Personality</Label>
              </div>
              <Select value={trainerPersonality} onValueChange={setTrainerPersonality}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motivational">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Motivational</span>
                      <span className="text-xs text-muted-foreground">
                        Enthusiastic and encouraging - "You got this!"
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="balanced">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Balanced</span>
                      <span className="text-xs text-muted-foreground">
                        Professional with warmth - Evidence-based encouragement
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="scientific">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Scientific</span>
                      <span className="text-xs text-muted-foreground">
                        Data-driven and analytical - "Let's look at the numbers"
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="tough-love">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Tough Love</span>
                      <span className="text-xs text-muted-foreground">
                        Direct and challenging - "No excuses, let's work"
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <Label>Psychiatrist Personality</Label>
              </div>
              <Select value={psychiatristPersonality} onValueChange={setPsychiatristPersonality}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="philosophical">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Philosophical</span>
                      <span className="text-xs text-muted-foreground">
                        Stoic wisdom with dry humor - "Marcus Aurelius would approve"
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="empathetic">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Empathetic</span>
                      <span className="text-xs text-muted-foreground">
                        Warm and understanding - "Let's explore that feeling"
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="direct">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Direct</span>
                      <span className="text-xs text-muted-foreground">
                        Straightforward insights - "Here's what I'm seeing"
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="humorous">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Humorous</span>
                      <span className="text-xs text-muted-foreground">
                        Witty with a side of therapy - "Let's laugh through this"
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-lg glass bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground">
                These personality settings affect how the Voice Trainer and Therapy Chat respond to you. Choose what
                resonates with your style.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full glass bg-transparent">
              Cancel
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={isLoading} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {error && (
          <Card className="glass border-destructive/50">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="glass border-green-500/50 bg-green-500/10">
            <CardContent className="pt-6">
              <p className="text-sm text-green-500">Settings saved successfully!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
