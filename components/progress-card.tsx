"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProgressCardProps {
  stage: string
  stageEmoji: string
  experiencePoints: number
  progress: number
  nextStage?: string
  nextStageEmoji?: string
  achievements: number
  streak: number
}

export function ProgressCard({
  stage,
  stageEmoji,
  experiencePoints,
  progress,
  nextStage,
  nextStageEmoji,
  achievements,
  streak,
}: ProgressCardProps) {
  const { toast } = useToast()
  const [sharing, setSharing] = useState(false)

  const handleShare = async () => {
    setSharing(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Metamorphosis Progress",
          text: `I've reached ${stageEmoji} ${stage} with ${experiencePoints} XP! Join me on my transformation journey in Metamorphosis. 🦋`,
          url: window.location.origin,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `I've reached ${stageEmoji} ${stage} with ${experiencePoints} XP! Join me on my transformation journey in Metamorphosis. 🦋 ${window.location.origin}`,
        )
        toast({
          title: "Copied!",
          description: "Progress card copied to clipboard",
        })
      }
    } catch (error) {
      console.error("Share error:", error)
    } finally {
      setSharing(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-purple-500/30 p-6 space-y-6">
      {/* Stage Display */}
      <div className="text-center space-y-2">
        <div className="text-5xl">{stageEmoji}</div>
        <h2 className="text-2xl font-bold text-white">{stage}</h2>
        <p className="text-sm text-slate-400">Level {Math.floor(experiencePoints / 500) + 1}</p>
      </div>

      {/* Experience Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Progress to Next Stage</span>
          <span className="font-semibold text-white">{progress}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Next Stage Preview */}
      {nextStage && (
        <div className="text-center p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-1">Next Evolution</p>
          <p className="text-lg">
            <span className="text-2xl">{nextStageEmoji}</span> {nextStage}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-slate-700/50">
          <p className="text-xs text-slate-400">Achievements</p>
          <p className="text-2xl font-bold text-blue-400">{achievements}</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-slate-700/50">
          <p className="text-xs text-slate-400">Streak</p>
          <p className="text-2xl font-bold text-purple-400">{streak}</p>
        </div>
      </div>

      {/* Share Button */}
      <Button onClick={handleShare} disabled={sharing} className="w-full bg-transparent" variant="outline">
        <Share2 className="mr-2 h-4 w-4" />
        {sharing ? "Sharing..." : "Share Progress"}
      </Button>
    </Card>
  )
}
