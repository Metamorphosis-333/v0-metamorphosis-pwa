"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mic, MicOff, Volume2, VolumeX, Keyboard, X } from "lucide-react"

interface VoiceTrainerProps {
  userId: string
  userName: string
}

export function VoiceTrainer({ userId, userName }: VoiceTrainerProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [showTypeMode, setShowTypeMode] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis

      // Initialize Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex
          const transcriptText = event.results[current][0].transcript
          setTranscript(transcriptText)
          setIsListening(false)
          handleUserInput(transcriptText)
        }

        recognitionRef.current.onerror = () => {
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript("")
      setResponse("")
      recognitionRef.current.start()
      setIsListening(true)
      setIsExpanded(true)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speak = (text: string) => {
    if (synthRef.current && !isMuted) {
      synthRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      synthRef.current.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const handleUserInput = async (input: string) => {
    // Generate AI response based on input
    const aiResponse = await generateTrainerResponse(input)
    setResponse(aiResponse)
    speak(aiResponse)

    // Save equipment data if mentioned
    if (input.toLowerCase().includes("equipment") || input.toLowerCase().includes("gym")) {
      await saveEquipmentData(input)
    }
  }

  const generateTrainerResponse = async (input: string): Promise<string> => {
    const inputLower = input.toLowerCase()

    // Equipment-related responses
    if (inputLower.includes("equipment") || inputLower.includes("gym") || inputLower.includes("have")) {
      if (inputLower.includes("dumbbell") || inputLower.includes("weights")) {
        return `Excellent, ${userName}! Dumbbells are the philosopher's stone of fitness—simple, timeless, effective. I'll tailor your program to make those weights your best friends. What else have you got?`
      }
      if (inputLower.includes("barbell")) {
        return `A barbell? Now we're talking. As the Stoics would say, "The obstacle is the way"—and that bar is your path to greatness. Let's build some serious strength.`
      }
      if (inputLower.includes("nothing") || inputLower.includes("no equipment") || inputLower.includes("bodyweight")) {
        return `Bodyweight only? Perfect. Remember: you are the equipment. Calisthenics built warriors for millennia. We'll make it work beautifully.`
      }
      return `Got it, ${userName}. I've noted your equipment. Tell me more—what are your fitness goals right now?`
    }

    // Goal-related responses
    if (
      inputLower.includes("goal") ||
      inputLower.includes("want to") ||
      inputLower.includes("lose") ||
      inputLower.includes("gain") ||
      inputLower.includes("build")
    ) {
      if (inputLower.includes("lose weight") || inputLower.includes("fat loss")) {
        return `Fat loss, huh? Here's the truth: it's not about punishment, it's about patience. Small daily wins compound. Let's focus on protein, slight deficit, and consistent movement.`
      }
      if (inputLower.includes("muscle") || inputLower.includes("gain") || inputLower.includes("build")) {
        return `Building muscle is an art, ${userName}. Progressive overload, protein timing, and recovery. We'll turn you into a masterpiece—one rep at a time.`
      }
      return `I hear you. Goals are dreams with deadlines. Let's break yours down into actionable steps. What's your current training frequency?`
    }

    // Motivation/mood responses
    if (inputLower.includes("tired") || inputLower.includes("unmotivated") || inputLower.includes("stuck")) {
      return `Feeling stuck? That's not failure, that's data. Your body is talking. Maybe we need a deload week, or maybe you need a therapy chat. Remember: rest is not retreat—it's strategic regrouping.`
    }

    if (inputLower.includes("stressed") || inputLower.includes("anxious")) {
      return `Stress, the modern plague. Here's your prescription: a 15-minute walk, some deep breathing, and a simple meal. Training isn't always about intensity—sometimes it's about showing up gently.`
    }

    // Default response
    return `I'm listening, ${userName}. Tell me more about what's on your mind—equipment, goals, struggles, whatever you need. I'm here to help you transform.`
  }

  const saveEquipmentData = (equipment: string) => {
    // Save to localStorage
    console.log("[v0] Equipment saved:", equipment)
  }

  const handleTypeSubmit = () => {
    if (textInput.trim()) {
      setTranscript(textInput)
      handleUserInput(textInput)
      setTextInput("")
      setShowTypeMode(false)
      setIsExpanded(true)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded ? (
        <Card className="glass-strong border-white/20 w-80 shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">AI Trainer</CardTitle>
                <CardDescription className="text-xs">Your hybrid fitness guide</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Transcript */}
            {transcript && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium mb-1">You said:</p>
                <p className="text-sm italic">&ldquo;{transcript}&rdquo;</p>
              </div>
            )}

            {/* Response */}
            {response && (
              <div className="p-3 rounded-lg bg-accent/50 border border-accent/20">
                <p className="text-sm font-medium mb-1">Trainer says:</p>
                <p className="text-sm">{response}</p>
              </div>
            )}

            {/* Type Mode */}
            {showTypeMode ? (
              <div className="space-y-2">
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[80px] glass"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleTypeSubmit()
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button onClick={handleTypeSubmit} className="flex-1" size="sm">
                    Send
                  </Button>
                  <Button onClick={() => setShowTypeMode(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    size="lg"
                    className={`relative h-16 w-16 rounded-full ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 animate-pulse"
                        : "bg-gradient-to-br from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                    } shadow-lg shadow-primary/50`}
                  >
                    {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>

                  <Button
                    onClick={() => setShowTypeMode(true)}
                    variant="outline"
                    size="icon"
                    className="glass border-white/20"
                  >
                    <Keyboard className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={() => {
                      if (isSpeaking) {
                        stopSpeaking()
                      } else {
                        setIsMuted(!isMuted)
                      }
                    }}
                    variant="outline"
                    size="icon"
                    className="glass border-white/20"
                  >
                    {isMuted || isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  {isListening
                    ? "Listening... Speak now"
                    : isSpeaking
                      ? "Trainer is speaking..."
                      : "Tap mic to speak or keyboard to type"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsExpanded(true)}
          size="lg"
          className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-2xl shadow-primary/50 animate-pulse-slow"
        >
          <Mic className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-primary"></span>
          </span>
        </Button>
      )}
    </div>
  )
}
