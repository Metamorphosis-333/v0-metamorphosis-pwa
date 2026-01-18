"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Brain, Zap, Minus } from "lucide-react"

interface MoodCheckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MoodCheckDialog({ open, onOpenChange }: MoodCheckDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleMoodSelection = async (mood: "stressed" | "high-energy" | "neutral") => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      await supabase.from("mood_checks").insert({
        user_id: user.id,
        mood,
      })

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving mood check:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-white/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Morning Headspace Check</DialogTitle>
          <DialogDescription>How are you feeling today? This helps me personalize your experience.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4 glass-strong hover:bg-orange-500/20 hover:border-orange-500 bg-transparent"
            onClick={() => handleMoodSelection("stressed")}
            disabled={isLoading}
          >
            <Brain className="mr-3 h-5 w-5 text-orange-500" />
            <div className="text-left">
              <p className="font-medium">Stressed / Overwhelmed</p>
              <p className="text-xs text-muted-foreground">I&apos;ll show you easy 15-min recipes</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4 glass-strong hover:bg-green-500/20 hover:border-green-500 bg-transparent"
            onClick={() => handleMoodSelection("high-energy")}
            disabled={isLoading}
          >
            <Zap className="mr-3 h-5 w-5 text-green-500" />
            <div className="text-left">
              <p className="font-medium">High Energy / Ready</p>
              <p className="text-xs text-muted-foreground">Let&apos;s go with performance meals</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4 glass-strong hover:bg-blue-500/20 hover:border-blue-500 bg-transparent"
            onClick={() => handleMoodSelection("neutral")}
            disabled={isLoading}
          >
            <Minus className="mr-3 h-5 w-5 text-blue-500" />
            <div className="text-left">
              <p className="font-medium">Balanced / Neutral</p>
              <p className="text-xs text-muted-foreground">I&apos;ll give you a mix of options</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
