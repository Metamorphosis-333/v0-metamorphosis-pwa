"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QuoteBanner } from "@/components/quote-banner"
import { VoiceButton } from "@/components/voice-button"
import { ArrowLeft, TrendingUp, Target } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { type UnitSystem, getProteinMultiplier } from "@/lib/unit-conversion"

interface HealthSyncContentProps {
  profile: {
    weight: number
    unit_preference?: UnitSystem
  }
  nutritionLogs: Array<{
    protein_grams: number
    calories: number
    logged_at: string
  }>
}

export function HealthSyncContent({ profile, nutritionLogs }: HealthSyncContentProps) {
  const [protein, setProtein] = useState("")
  const [calories, setCalories] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const unitSystem = profile.unit_preference || "imperial"
  const proteinMultiplier = getProteinMultiplier(unitSystem)
  const proteinGoal = Math.round(profile.weight * proteinMultiplier)

  const handleVoiceInput = (field: "protein" | "calories") => (transcript: string) => {
    const match = transcript.match(/\d+/)
    const value = match ? match[0] : transcript

    if (field === "protein") {
      setProtein(value)
    } else {
      setCalories(value)
    }
  }

  const handleLogNutrition = async () => {
    if (!protein && !calories) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const today = new Date().toISOString().split("T")[0]

      // Upsert today's nutrition log
      const { error } = await supabase.from("nutrition_logs").upsert(
        {
          user_id: user.id,
          protein_grams: protein ? Number.parseFloat(protein) : null,
          calories: calories ? Number.parseInt(calories) : null,
          logged_at: today,
        },
        {
          onConflict: "user_id,logged_at",
        },
      )

      if (error) throw error

      setProtein("")
      setCalories("")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error logging nutrition:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Prepare chart data
  const chartData = nutritionLogs.map((log) => ({
    date: new Date(log.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    protein: log.protein_grams || 0,
    goal: proteinGoal,
  }))

  // Calculate averages
  const avgProtein =
    nutritionLogs.length > 0
      ? nutritionLogs.reduce((sum, log) => sum + (log.protein_grams || 0), 0) / nutritionLogs.length
      : 0

  const avgCalories =
    nutritionLogs.length > 0
      ? nutritionLogs.reduce((sum, log) => sum + (log.calories || 0), 0) / nutritionLogs.length
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="glass">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Health Sync</h1>
            <p className="text-muted-foreground">Track your dietary energy and macros</p>
          </div>
        </div>

        {/* Quote Banner */}
        <QuoteBanner />

        {/* Log Nutrition */}
        <Card className="glass-strong border-white/20">
          <CardHeader>
            <CardTitle>Log Today&apos;s Nutrition</CardTitle>
            <CardDescription>
              Sync your data from MyFitnessPal or manually enter your macros. Use voice for quick logging.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="protein">Protein (grams)</Label>
                <div className="flex gap-2">
                  <Input
                    id="protein"
                    type="number"
                    placeholder="150"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="glass"
                  />
                  <VoiceButton onTranscript={handleVoiceInput("protein")} size="icon" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="calories">Calories</Label>
                <div className="flex gap-2">
                  <Input
                    id="calories"
                    type="number"
                    placeholder="2000"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="glass"
                  />
                  <VoiceButton onTranscript={handleVoiceInput("calories")} size="icon" />
                </div>
              </div>
              <Button onClick={handleLogNutrition} disabled={isLoading || (!protein && !calories)} className="w-full">
                {isLoading ? "Logging..." : "Log Nutrition"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Overview */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="glass border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Daily Protein</p>
                  <p className="text-2xl font-bold">{avgProtein.toFixed(0)}g</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Goal: {proteinGoal}g</p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Daily Calories</p>
                  <p className="text-2xl font-bold">{avgCalories.toFixed(0)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Protein Chart */}
        <Card className="glass-strong border-white/20">
          <CardHeader>
            <CardTitle>Protein Intake (Last 7 Days)</CardTitle>
            <CardDescription>Daily protein vs your goal</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer
                config={{
                  protein: {
                    label: "Protein (g)",
                    color: "hsl(var(--primary))",
                  },
                  goal: {
                    label: "Goal",
                    color: "hsl(var(--muted-foreground))",
                  },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="protein" fill="var(--color-protein)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="goal" fill="var(--color-goal)" radius={[4, 4, 0, 0]} opacity={0.3} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Start logging to see your progress</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Apple Health Info */}
        <Card className="glass border-white/10">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Tip:</strong> For automatic syncing, connect your MyFitnessPal to Apple Health, and manually log
              your daily macros here. This dashboard tracks your dietary energy to help optimize your performance and
              recovery.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
