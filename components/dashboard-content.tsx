"use client"

import { useState, useEffect } from "react"
import { QuoteBanner } from "@/components/quote-banner"
import { MoodCheckDialog } from "@/components/mood-check-dialog"
import { WeightChart } from "@/components/weight-chart"
import { ProteinProgressRing } from "@/components/protein-progress-ring"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, TrendingDown, TrendingUp, Utensils, LogOut, Activity, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { VoiceTrainer } from "@/components/voice-trainer"
import { type UnitSystem, formatWeight, getProteinMultiplier } from "@/lib/unit-conversion"

interface DashboardContentProps {
  profile: {
    name: string
    age: number
    weight: number
    height: number
    why: string
    id: string
    unit_preference?: UnitSystem
  }
  weightLogs: Array<{
    weight: number
    logged_at: string
  }>
  todayNutrition: {
    protein_grams: number
    calories: number
  } | null
  hasMoodCheck: boolean
}

export function DashboardContent({ profile, weightLogs, todayNutrition, hasMoodCheck }: DashboardContentProps) {
  const [showMoodCheck, setShowMoodCheck] = useState(false)
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

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
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
                <Link href="/recipes">
                  <Button variant="outline" className="w-full justify-start glass bg-transparent">
                    <Utensils className="mr-2 h-4 w-4" />
                    Browse Recipes
                  </Button>
                </Link>
                <Link href="/health-sync">
                  <Button variant="outline" className="w-full justify-start glass bg-transparent">
                    <Activity className="mr-2 h-4 w-4" />
                    Health Sync
                  </Button>
                </Link>
                <Link href="/therapy">
                  <Button variant="outline" className="w-full justify-start glass bg-transparent">
                    <Brain className="mr-2 h-4 w-4" />
                    Therapy Chat
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start glass bg-transparent"
                  onClick={() => setShowMoodCheck(true)}
                >
                  Check Headspace
                </Button>
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

      <VoiceTrainer userId={profile.id} userName={profile.name} />
    </>
  )
}
