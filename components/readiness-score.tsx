"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Moon, Activity, Utensils } from "lucide-react"

interface ReadinessScoreProps {
  score: number
  sleep?: number
  rhr?: number
  mood?: string
  activity?: number
}

export function ReadinessScore({
  score = 78,
  sleep = 7.5,
  rhr = 58,
  mood = "energized",
  activity = 65,
}: ReadinessScoreProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-500"
    if (value >= 60) return "text-blue-500"
    if (value >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBgColor = (value: number) => {
    if (value >= 80) return "from-green-500/20 to-green-500/5"
    if (value >= 60) return "from-blue-500/20 to-blue-500/5"
    if (value >= 40) return "from-yellow-500/20 to-yellow-500/5"
    return "from-red-500/20 to-red-500/5"
  }

  return (
    <Card className={`glass-strong border-white/20 bg-gradient-to-br ${getScoreBgColor(score)}`}>
      <CardHeader>
        <CardTitle>Readiness Score</CardTitle>
        <CardDescription>Your daily preparation level</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Readiness Circle */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${(score / 100) * 282.7} 282.7`}
                strokeLinecap="round"
                className={getScoreColor(score)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</div>
                <div className="text-xs text-muted-foreground">/ 100</div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Factors */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
            <Moon className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">Sleep</p>
              <p className="text-sm font-semibold">{sleep}h</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
            <Heart className="h-4 w-4 text-red-400" />
            <div>
              <p className="text-xs text-muted-foreground">RHR</p>
              <p className="text-sm font-semibold">{rhr} bpm</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
            <Activity className="h-4 w-4 text-green-400" />
            <div>
              <p className="text-xs text-muted-foreground">Activity</p>
              <p className="text-sm font-semibold">{activity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
            <Utensils className="h-4 w-4 text-yellow-400" />
            <div>
              <p className="text-xs text-muted-foreground">Mood</p>
              <p className="text-sm font-semibold capitalize">{mood}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
