"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"

interface Win {
  id: string
  title: string
  completed: boolean
}

const DEFAULT_WINS: Win[] = [
  { id: "1", title: "Drink 8 glasses of water", completed: false },
  { id: "2", title: "Hit protein goal", completed: false },
  { id: "3", title: "Move for 30 minutes", completed: false },
]

export function DailyWins() {
  const [wins, setWins] = useState<Win[]>(DEFAULT_WINS)

  const toggleWin = (id: string) => {
    setWins(wins.map((win) => (win.id === id ? { ...win, completed: !win.completed } : win)))
  }

  const completedCount = wins.filter((w) => w.completed).length

  return (
    <Card className="glass-strong border-white/20">
      <CardHeader>
        <CardTitle>Top 3 Daily Wins</CardTitle>
        <CardDescription>
          {completedCount} of {wins.length} completed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {wins.map((win) => (
          <button
            key={win.id}
            onClick={() => toggleWin(win.id)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
          >
            {win.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <span className={win.completed ? "line-through text-muted-foreground" : "text-foreground"}>
              {win.title}
            </span>
          </button>
        ))}

        {/* Progress bar */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / wins.length) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
