"use client"

import { useState, useEffect } from "react"
import { QuoteBanner } from "@/components/quote-banner"
import { MoodCheckDialog } from "@/components/mood-check-dialog"
import { WeightChart } from "@/components/weight-chart"
import { ProteinProgressRing } from "@/components/protein-progress-ring"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, TrendingDown, TrendingUp, Utensils, LogOut, Activity, Settings, Sparkles, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { VoiceTrainer } from "@/components/voice-trainer"
import { type UnitSystem, formatWeight, getProteinMultiplier } from "@/lib/unit-conversion"
import { ReadinessScore } from "@/components/readiness-score"
import { DailyWins } from "@/components/daily-wins"
import { clearAllLocalData } from "@/lib/local-storage"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DashboardContentProps {
  profile: {
    name: string
    age: number
    weight: number
    height: number
    why?: string
    id: string
    unit_preference?: UnitSystem
  }
  weightLogs: Array<{
    weight: number
    logged_at: string
  }>
  todayNutrition: {
    protein?: number
    calories?: number
  } | null
  hasMoodCheck: boolean
}

export function DashboardContent({ profile, weightLogs, todayNutrition, hasMoodCheck }: DashboardContentProps) {
  const [showMoodCheck, setShowMoodCheck] = useState(false)
  const [showRecipeDialog, setShowRecipeDialog] = useState(false)
  const [showHealthSyncDialog, setShowHealthSyncDialog] = useState(false)
  const [ingredients, setIngredients] = useState("")
  const router = useRouter()

  const unitSystem = profile.unit_preference || "imperial"

  useEffect(() => {
    // Show mood check dialog on first load if not checked today
    const timer = setTimeout(() => {
      if (!hasMoodCheck) {
        setShowMoodCheck(true)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [hasMoodCheck])

  const handleLogout = () => {
    clearAllLocalData()
    sessionStorage.clear()
    window.location.href = "/landing"
  }

  const handleRecipeSearch = () => {
    if (ingredients.trim()) {
      const searchQuery = encodeURIComponent(`simple healthy meal recipes with ${ingredients.trim()}`)
      window.open(`https://www.google.com/search?q=${searchQuery}`, "_blank")
      setShowRecipeDialog(false)
      setIngredients("")
    }
  }

  const proteinMultiplier = getProteinMultiplier(unitSystem)
  const proteinGoal = Math.round(profile.weight * proteinMultiplier)
  const proteinProgress = todayNutrition?.protein_grams || 0

  // Calculate weight change
  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : profile.weight
  const earliestWeight = weightLogs.length > 0 ? weightLogs[0].weight : profile.weight
  const weightChange = latestWeight - earliestWeight

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {profile.name}</h1>
              <p className="text-muted-foreground">Let&apos;s track your transformation</p>
            </div>
            <div className="flex gap-2">
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="glass">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="glass">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quote Banner */}
          <QuoteBanner />

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Weight</p>
                    <p className="text-2xl font-bold">{formatWeight(latestWeight, unitSystem)}</p>
                  </div>
                  {weightChange !== 0 && (
                    <div
                      className={`flex items-center gap-1 ${weightChange < 0 ? "text-green-500" : "text-orange-500"}`}
                    >
                      {weightChange < 0 ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                      <span className="text-sm font-medium">{formatWeight(Math.abs(weightChange), unitSystem)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Protein Today</p>
                    <p className="text-2xl font-bold">
                      {proteinProgress}g / {proteinGoal}g
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Readiness Score and Daily Wins */}
          <div className="grid md:grid-cols-2 gap-6">
            <ReadinessScore score={78} sleep={7.5} rhr={58} mood="energized" activity={65} />
            <DailyWins />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Weight Chart */}
            <Card className="glass-strong border-white/20 md:col-span-2">
              <CardHeader>
                <CardTitle>Weight Progress</CardTitle>
                <CardDescription>Your transformation over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <WeightChart data={weightLogs} unitSystem={unitSystem} />
              </CardContent>
            </Card>

            {/* Protein Progress Ring */}
            <Card className="glass-strong border-white/20">
              <CardHeader>
                <CardTitle>Daily Protein Goal</CardTitle>
                <CardDescription>Track your macros</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-8">
                <ProteinProgressRing current={proteinProgress} goal={proteinGoal} />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-strong border-white/20">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>What do you need today?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start glass bg-transparent"
                  onClick={() => setShowRecipeDialog(true)}
                >
                  <Utensils className="mr-2 h-4 w-4" />
                  Browse Recipes
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start glass bg-transparent"
                  onClick={() => setShowHealthSyncDialog(true)}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Health Sync
                </Button>
                <a 
                  href="https://gemini.google.com/app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full justify-between glass bg-transparent">
                    <span className="flex items-center">
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI Therapy Chat
                    </span>
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </Button>
                </a>
                <a 
                  href="https://www.calm.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full justify-between glass bg-transparent">
                    <span className="flex items-center">
                      <Brain className="mr-2 h-4 w-4" />
                      Check Headspace
                    </span>
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <MoodCheckDialog open={showMoodCheck} onOpenChange={setShowMoodCheck} />

      {/* Recipe Ingredients Dialog */}
      <Dialog open={showRecipeDialog} onOpenChange={setShowRecipeDialog}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>What ingredients do you have?</DialogTitle>
            <DialogDescription>
              Enter the ingredients you have available and we&apos;ll find simple healthy recipes for you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="ingredients">Available Ingredients</Label>
              <Input
                id="ingredients"
                placeholder="e.g., chicken, broccoli, rice, garlic..."
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRecipeSearch()}
                className="glass"
              />
              <p className="text-xs text-muted-foreground">
                Separate ingredients with commas for better results
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 bg-transparent" 
                onClick={() => setShowRecipeDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleRecipeSearch}
                disabled={!ingredients.trim()}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Search Recipes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Health Sync QR Code Dialog */}
      <Dialog open={showHealthSyncDialog} onOpenChange={setShowHealthSyncDialog}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Sync Your Health Data
            </DialogTitle>
            <DialogDescription>
              Scan the QR code with your phone to connect Apple Health or Google Fit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* QR Code Display */}
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-xl">
                {/* QR Code pattern */}
                <svg width="160" height="160" viewBox="0 0 160 160" className="text-black">
                  <rect x="0" y="0" width="160" height="160" fill="white" />
                  {/* Corner squares */}
                  <rect x="10" y="10" width="40" height="40" fill="black" />
                  <rect x="15" y="15" width="30" height="30" fill="white" />
                  <rect x="20" y="20" width="20" height="20" fill="black" />
                  
                  <rect x="110" y="10" width="40" height="40" fill="black" />
                  <rect x="115" y="15" width="30" height="30" fill="white" />
                  <rect x="120" y="20" width="20" height="20" fill="black" />
                  
                  <rect x="10" y="110" width="40" height="40" fill="black" />
                  <rect x="15" y="115" width="30" height="30" fill="white" />
                  <rect x="20" y="120" width="20" height="20" fill="black" />
                  
                  {/* Data pattern */}
                  <rect x="60" y="10" width="10" height="10" fill="black" />
                  <rect x="80" y="10" width="10" height="10" fill="black" />
                  <rect x="60" y="30" width="10" height="10" fill="black" />
                  <rect x="70" y="20" width="10" height="10" fill="black" />
                  <rect x="90" y="20" width="10" height="10" fill="black" />
                  
                  <rect x="60" y="60" width="10" height="10" fill="black" />
                  <rect x="70" y="70" width="10" height="10" fill="black" />
                  <rect x="80" y="60" width="10" height="10" fill="black" />
                  <rect x="90" y="70" width="10" height="10" fill="black" />
                  <rect x="80" y="80" width="10" height="10" fill="black" />
                  
                  <rect x="10" y="60" width="10" height="10" fill="black" />
                  <rect x="30" y="70" width="10" height="10" fill="black" />
                  <rect x="10" y="80" width="10" height="10" fill="black" />
                  <rect x="40" y="60" width="10" height="10" fill="black" />
                  
                  <rect x="110" y="60" width="10" height="10" fill="black" />
                  <rect x="130" y="70" width="10" height="10" fill="black" />
                  <rect x="120" y="80" width="10" height="10" fill="black" />
                  <rect x="140" y="90" width="10" height="10" fill="black" />
                  
                  <rect x="60" y="110" width="10" height="10" fill="black" />
                  <rect x="80" y="120" width="10" height="10" fill="black" />
                  <rect x="70" y="130" width="10" height="10" fill="black" />
                  <rect x="90" y="110" width="10" height="10" fill="black" />
                  
                  <rect x="110" y="110" width="10" height="10" fill="black" />
                  <rect x="130" y="120" width="10" height="10" fill="black" />
                  <rect x="120" y="140" width="10" height="10" fill="black" />
                  <rect x="140" y="130" width="10" height="10" fill="black" />
                </svg>
              </div>
              <p className="text-sm font-medium text-center">Scan with your phone camera</p>
            </div>

            {/* Platform options */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg glass text-center space-y-2">
                <svg className="h-8 w-8 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <p className="text-sm font-medium">Apple Health</p>
                <p className="text-xs text-muted-foreground">iOS 15+</p>
              </div>
              <div className="p-4 rounded-lg glass text-center space-y-2">
                <svg className="h-8 w-8 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <p className="text-sm font-medium">Google Fit</p>
                <p className="text-xs text-muted-foreground">Android</p>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Your health data stays on your device and is never uploaded to external servers.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <VoiceTrainer userId={profile.id} userName={profile.name} />
    </>
  )
}
