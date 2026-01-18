"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { VoiceButton } from "@/components/voice-button"
import { QuoteBanner } from "@/components/quote-banner"
import { AppleHealthImport } from "@/components/apple-health-import"
import { ArrowLeft, Save, User, Activity, Brain, LogOut, AlertTriangle, Download, Upload, Dumbbell } from "lucide-react"
import Link from "next/link"
import { type UnitSystem, getUnitLabels, lbsToKg, kgToLbs, inchesToCm, cmToInches } from "@/lib/unit-conversion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProfileEnhancements } from "@/components/profile-enhancements"
import { saveProfile, addWeightLog, clearAllLocalData, exportAllData, importData } from "@/lib/local-storage"

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
  const initialUnitSystem = initialProfile.unit_preference || "imperial"
  
  // Initialize weight and height based on unit system
  const initialWeight = initialUnitSystem === "metric" 
    ? lbsToKg(initialProfile.weight).toFixed(1) 
    : initialProfile.weight.toFixed(1)
  const initialHeight = initialUnitSystem === "metric" 
    ? inchesToCm(initialProfile.height).toFixed(0) 
    : initialProfile.height.toFixed(0)

  const [name, setName] = useState(initialProfile.name)
  const [age, setAge] = useState(initialProfile.age.toString())
  const [weight, setWeight] = useState(initialWeight)
  const [height, setHeight] = useState(initialHeight)
  const [why, setWhy] = useState(initialProfile.why || "")
  const [currentUnitSystem, setCurrentUnitSystem] = useState<UnitSystem>(initialUnitSystem)
  const [trainerPersonality, setTrainerPersonality] = useState(initialProfile.trainer_personality || "balanced")
  const [psychiatristPersonality, setPsychiatristPersonality] = useState(
    initialProfile.psychiatrist_personality || "philosophical",
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const unitLabels = getUnitLabels(currentUnitSystem)

  const handleUnitToggle = (newSystem: UnitSystem) => {
    // Convert existing values to new unit system
    if (weight) {
      const weightNum = Number.parseFloat(weight)
      if (newSystem === "metric" && currentUnitSystem === "imperial") {
        setWeight(lbsToKg(weightNum).toFixed(1))
      } else if (newSystem === "imperial" && currentUnitSystem === "metric") {
        setWeight(kgToLbs(weightNum).toFixed(1))
      }
    }
    if (height) {
      const heightNum = Number.parseFloat(height)
      if (newSystem === "metric" && currentUnitSystem === "imperial") {
        setHeight(inchesToCm(heightNum).toFixed(0))
      } else if (newSystem === "imperial" && currentUnitSystem === "metric") {
        setHeight(cmToInches(heightNum).toFixed(0))
      }
    }
    setCurrentUnitSystem(newSystem)
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

    try {
      // Convert to imperial for storage
      const weightInLbs = currentUnitSystem === "metric" ? kgToLbs(Number.parseFloat(weight)) : Number.parseFloat(weight)
      const heightInInches = currentUnitSystem === "metric" ? cmToInches(Number.parseFloat(height)) : Number.parseFloat(height)

      // Save to localStorage
      saveProfile({
        name,
        age: Number.parseInt(age),
        weight: weightInLbs,
        height: heightInInches,
        why,
        unit_preference: currentUnitSystem,
        trainer_personality: trainerPersonality,
        psychiatrist_personality: psychiatristPersonality,
      })

      // If weight changed, add a new weight log
      if (weightInLbs !== initialProfile.weight) {
        addWeightLog(weightInLbs)
      }

      setSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = () => {
    const data = exportAllData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `metamorphosis-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (importData(content)) {
        setSuccess(true)
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setError("Failed to import data. Invalid file format.")
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all your data? This cannot be undone.")) {
      clearAllLocalData()
      window.location.href = "/landing"
    }
  }

  const handleLogout = () => {
    // Clear all metamorphosis data
    clearAllLocalData()

    // Clear session storage too
    sessionStorage.clear()

    // Clear all cookies
    const cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i]
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()

      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
    }

    // Hard redirect to landing
    window.location.href = "/landing"
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
              <div className="flex gap-2 items-center">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass flex-1"
                  placeholder="Your name"
                />
                <VoiceButton onTranscript={handleVoiceInput("name")} size="icon" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="age">Age</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="glass flex-1"
                  placeholder="30"
                />
                <VoiceButton onTranscript={handleVoiceInput("age")} size="icon" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Your Why</Label>
              <div className="flex gap-2 items-start">
                <Textarea
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  className="glass min-h-[100px] flex-1"
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
                  currentUnitSystem === "imperial"
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
                  currentUnitSystem === "metric"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Metric (kg / cm)
              </button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="weight">Weight ({unitLabels.weight})</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="glass flex-1"
                  placeholder={currentUnitSystem === "imperial" ? "180" : "82"}
                />
                <VoiceButton onTranscript={handleVoiceInput("weight")} size="icon" />
              </div>
              <p className="text-xs text-muted-foreground">
                Updating weight will create a new log entry for tracking progress
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="height">Height ({unitLabels.height})</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="glass flex-1"
                  placeholder={currentUnitSystem === "imperial" ? "70" : "178"}
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
              <AppleHealthImport userId={initialProfile.id} unitSystem={currentUnitSystem} />
            </div>
          </CardContent>
        </Card>

        {/* Local Storage Warning */}
        <Card className="glass-strong border-yellow-500/30 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Local Storage Only
            </CardTitle>
            <CardDescription>Important information about your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg glass bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-700 leading-relaxed">
                All your data is stored locally on this device only. If you clear your browser data, 
                switch devices, or use a different browser, your progress will not be available.
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-medium">Backup & Restore</p>
              <p className="text-xs text-muted-foreground">
                Export your data to save a backup, or import a previous backup to restore your progress.
              </p>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportData} className="flex-1 bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
                <Label className="flex-1">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Data
                    </span>
                  </Button>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Tracking */}
        <ProfileEnhancements profile={initialProfile} />

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

        <Card className="glass border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Account Actions</CardTitle>
            <CardDescription>Log out of your account to clear all local data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This will clear your session and all local app data
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
