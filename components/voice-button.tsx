"use client"

import { useState } from "react"
import { Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VoiceInput } from "@/lib/voice"
import { useToast } from "@/hooks/use-toast"

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  size?: "default" | "lg" | "icon"
}

export function VoiceButton({ onTranscript, size = "default" }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [voiceInput] = useState(() => new VoiceInput())
  const { toast } = useToast()

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
          toast({
            title: "Voice Input Unavailable",
            description: error,
            variant: "destructive",
          })
          setIsListening(false)
        },
      )
    }
  }

  const isIconMode = size === "icon"

  return (
    <Button
      type="button"
      onClick={handleVoiceInput}
      size={size}
      variant={isListening ? "default" : "secondary"}
      className={`${isListening ? "pulse-ring bg-primary" : "glass-strong"} ${isIconMode ? "flex-shrink-0" : ""}`}
      title={isListening ? "Stop listening" : "Speak"}
    >
      {isListening ? (
        <>
          <MicOff className={isIconMode ? "h-4 w-4" : "h-5 w-5 mr-2"} />
          {!isIconMode && "Listening..."}
        </>
      ) : (
        <>
          <Mic className={isIconMode ? "h-4 w-4" : "h-5 w-5 mr-2"} />
          {!isIconMode && "Speak"}
        </>
      )}
    </Button>
  )
}
