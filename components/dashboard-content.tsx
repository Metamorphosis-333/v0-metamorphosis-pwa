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
                <Link href="/settings">
                  <Button variant="outline" className="w-full justify-start glass bg-transparent">
                    <Activity className="mr-2 h-4 w-4" />
                    Health Sync
                  </Button>
                </Link>
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

          {/* Your Why Reminder */}
          <Card className="glass border-white/10 border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">Your Why:</p>
              <p className="italic text-balance">&ldquo;{profile.why}&rdquo;</p>
            </CardContent>
          </Card>
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

      <VoiceTrainer userId={profile.id} userName={profile.name} />
    </>
  )
}
