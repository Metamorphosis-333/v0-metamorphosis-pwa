"use client"

import { useState } from "react"
import { Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VoiceInput } from "@/lib/voice"

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  size?: "default" | "lg" | "icon"
}

export function VoiceButton({ onTranscript, size = "default" }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [voiceInput] = useState(() => new VoiceInput())

  const handleVoiceInput = () => {
    if (isListening) {
      voiceInput.stop()
      setIsListening(false)
    } else {
      setIsListening(true)
      voiceInput.start(
        (transcript) => {
          onTranscript(transcript)
          setIsListening(false)
        },
        (error) => {
          console.error("[v0] Voice input error:", error)
          setIsListening(false)
        },
      )
    }
  }

  return (
    <Button
      type="button"
      onClick={handleVoiceInput}
      size={size}
      variant={isListening ? "default" : "secondary"}
      className={isListening ? "pulse-ring bg-primary" : "glass-strong"}
    >
      {isListening ? (
        <>
          <MicOff className="h-5 w-5 mr-2" />
          Listening...
        </>
      ) : (
        <>
          <Mic className="h-5 w-5 mr-2" />
          Speak
        </>
      )}
    </Button>
  )
}
