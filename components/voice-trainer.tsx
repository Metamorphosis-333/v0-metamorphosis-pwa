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

// Knowledge Base for Mock AI Responses
const FITNESS_KNOWLEDGE_BASE = {
  // Core muscle groups
  abs: [
    "For abs, focus on planks, hanging leg raises, and cable crunches. Remember: abs are revealed in the kitchen, not just the gym.",
    "The key to visible abs is reducing body fat through a caloric deficit while maintaining muscle with compound movements and direct ab work.",
    "Try hollow body holds for 30 seconds, then progress to 60. Your core will thank you—and so will your posture.",
  ],
  chest: [
    "Build your chest with push-ups, bench press, and dumbbell flyes. Focus on the mind-muscle connection for maximum growth.",
    "Incline pressing targets the upper chest, which creates that full, aesthetic look. Don't neglect it.",
    "For chest development, aim for 10-20 sets per week spread across 2-3 sessions. Quality over quantity.",
  ],
  back: [
    "A strong back is the foundation of athleticism. Pull-ups, rows, and deadlifts are your best friends.",
    "Can't do pull-ups yet? Start with lat pulldowns and inverted rows. Progress is progress.",
    "For a V-taper, focus on wide-grip movements and face pulls for rear delts. Balance is everything.",
  ],
  legs: [
    "Never skip leg day. Squats, lunges, and Romanian deadlifts build functional strength and boost metabolism.",
    "Strong legs = strong foundation. Plus, leg training releases more growth hormone than any other muscle group.",
    "For quad development: front squats and leg press. For hamstrings: Romanian deadlifts and leg curls.",
  ],
  arms: [
    "Biceps respond well to variety—hammer curls, incline curls, and concentration curls all hit different heads.",
    "For triceps, focus on overhead extensions and close-grip pressing. They make up two-thirds of your arm size.",
    "Don't overthink arms. Compound movements build most of the mass; isolation work adds the finishing touches.",
  ],
  shoulders: [
    "Overhead press is king for shoulders. Add lateral raises for width and face pulls for rear delt health.",
    "Shoulder injuries are common. Warm up properly and prioritize rotator cuff health with external rotations.",
    "For boulder shoulders: press heavy, raise light, and never neglect rear delts.",
  ],
  muscle: [
    "Building muscle requires progressive overload, adequate protein (0.8-1g per lb bodyweight), and quality sleep.",
    "Muscle growth happens during recovery, not during the workout. Train hard, rest harder.",
    "Consistency beats perfection. Showing up 3-4 times a week for years beats going hard for 2 weeks then quitting.",
  ],

  // Nutrition keywords
  diet: [
    "The best diet is one you can stick to. Focus on whole foods, adequate protein, and a slight caloric deficit for fat loss.",
    "Don't demonize any macronutrient. Carbs fuel performance, fats support hormones, protein builds muscle.",
    "Meal prep is your secret weapon. Spend 2 hours on Sunday to save 10 hours during the week.",
  ],
  protein: [
    "Aim for 0.8-1 gram of protein per pound of bodyweight. Spread it across 4-5 meals for optimal absorption.",
    "Best protein sources: chicken, fish, eggs, Greek yogurt, cottage cheese, and legumes for plant-based options.",
    "Protein timing matters less than total daily intake. Focus on hitting your target, then optimize timing.",
  ],
  calories: [
    "To lose fat: create a 300-500 calorie deficit. To gain muscle: a 200-300 calorie surplus. Simple math, hard execution.",
    "Track your food for 2 weeks to understand your intake. You can't manage what you don't measure.",
    "Don't slash calories too aggressively. A moderate deficit preserves muscle and keeps your metabolism healthy.",
  ],
  carbs: [
    "Carbs are fuel, not the enemy. Time them around workouts for best performance and recovery.",
    "Low-carb works for some, not others. Experiment and find what keeps your energy stable and workouts strong.",
    "Quality carbs: oats, rice, potatoes, fruits, vegetables. Minimize processed sugars and refined grains.",
  ],
  fat: [
    "Healthy fats support hormone production, including testosterone. Don't fear fat—embrace avocados, nuts, and olive oil.",
    "Aim for 20-35% of calories from fat. Going too low can tank your hormones and energy.",
    "Omega-3s from fish, flax, and walnuts fight inflammation and support brain health. Prioritize them.",
  ],
  water: [
    "Hydration affects everything: performance, recovery, cognitive function. Aim for half your bodyweight in ounces daily.",
    "If your urine is dark yellow, you're already dehydrated. Keep a water bottle with you at all times.",
    "Add electrolytes if you sweat heavily. Sodium, potassium, and magnesium keep your muscles firing properly.",
  ],

  // Training concepts
  cardio: [
    "Cardio doesn't kill gains if programmed smartly. 2-3 sessions of 20-30 minutes supports heart health without sacrificing muscle.",
    "HIIT burns more calories in less time, but steady-state is easier to recover from. Use both strategically.",
    "Walking is underrated. 10,000 steps daily improves recovery, mood, and burns significant calories over time.",
  ],
  strength: [
    "Strength is built in the 1-5 rep range with compound movements. Master the squat, deadlift, bench, and overhead press.",
    "Progressive overload is non-negotiable. Add weight, reps, or sets over time. Small jumps lead to big gains.",
    "Strength training preserves muscle during fat loss and builds it during a surplus. It's the foundation of fitness.",
  ],
  rest: [
    "Rest days are growth days. Your muscles repair and grow while you sleep and recover, not while you train.",
    "Sleep 7-9 hours for optimal recovery. Growth hormone peaks during deep sleep—don't shortchange yourself.",
    "Overtraining is real. If you're constantly sore, fatigued, or getting weaker, take a deload week.",
  ],
  recovery: [
    "Recovery includes sleep, nutrition, stress management, and active rest. Train hard, but recover harder.",
    "Foam rolling, stretching, and light movement on off days can accelerate recovery and reduce soreness.",
    "Listen to your body. Some fatigue is normal; chronic exhaustion means something needs to change.",
  ],
  workout: [
    "A good workout leaves you energized, not destroyed. You should feel challenged but not wrecked.",
    "Full body 3x/week works great for beginners. Upper/lower splits work well for intermediates. Find what fits your schedule.",
    "The best workout is one you'll actually do. Consistency trumps complexity every time.",
  ],

  // Motivation and mindset
  motivation: [
    "Motivation fades; discipline remains. Build habits that don't rely on how you feel that day.",
    "Progress photos beat the scale. Muscle is denser than fat—you might weigh the same but look completely different.",
    "Celebrate small wins. Every workout completed, every healthy meal eaten, is a vote for who you want to become.",
  ],
  tired: [
    "Feeling tired? Sometimes the best workout is a light walk and early bedtime. Recovery is part of the process.",
    "Persistent fatigue might signal overtraining, poor nutrition, or inadequate sleep. Address the root cause.",
    "A bad workout is still better than no workout. Show up, do what you can, and live to train another day.",
  ],
  stressed: [
    "Exercise is a powerful stress reliever. Even 20 minutes of movement can shift your mental state dramatically.",
    "When stressed, prioritize sleep and reduce training intensity. Your body can't recover from both life stress and training stress.",
    "Deep breathing, walking in nature, and journaling complement your physical training. Mind and body are connected.",
  ],
  stuck: [
    "Plateaus happen to everyone. Try changing exercises, rep ranges, or taking a deload week to break through.",
    "If you're stuck, check your recovery first. Sleep, stress, and nutrition often hold the answers.",
    "Progress isn't always linear. Trust the process and stay consistent. The breakthrough is coming.",
  ],

  // Goals
  weight: [
    "Weight loss is about creating a sustainable caloric deficit. Crash diets don't work long-term.",
    "Aim to lose 0.5-1% of bodyweight per week. Faster than that and you risk muscle loss.",
    "Weight fluctuates daily due to water, food, and hormones. Focus on weekly averages, not daily numbers.",
  ],
  lose: [
    "Fat loss requires patience. It took time to gain, it'll take time to lose. Trust the process.",
    "Combine strength training with a moderate deficit to preserve muscle while losing fat.",
    "The scale doesn't tell the whole story. Track measurements, photos, and how your clothes fit too.",
  ],
  gain: [
    "Gaining muscle requires a caloric surplus, progressive overload, and adequate protein. No shortcuts.",
    "Expect to gain some fat during a muscle-building phase. It's part of the process—you can cut later.",
    "For lean gains, aim for 0.5-1 lb per month. Faster weight gain is mostly fat.",
  ],
}

// Generic responses when no keyword matches
const GENERIC_RESPONSES = [
  "That's a great question. Tell me more about your specific situation—what's your current training like and what are you trying to achieve?",
  "I'm here to help you transform. Whether it's nutrition, training, or mindset—let's break it down together. What's your biggest challenge right now?",
  "Every journey is unique. Share more details about your goals and current routine, and I'll give you tailored advice.",
  "Fitness is a marathon, not a sprint. What specific aspect would you like to focus on today—training, nutrition, or recovery?",
  "The best program is one you'll stick to consistently. Tell me about your schedule and preferences, and we'll build something sustainable.",
  "Progress takes time, but with the right approach, results are inevitable. What's on your mind?",
  "I'm listening. Whether you need workout tips, diet advice, or just some motivation—I've got you covered.",
]

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

  const generateTrainerResponse = (input: string): string => {
    const inputLower = input.toLowerCase()
    
    // Search knowledge base for matching keywords
    for (const [keyword, responses] of Object.entries(FITNESS_KNOWLEDGE_BASE)) {
      if (inputLower.includes(keyword)) {
        // Return a random response from the matched keyword category
        const randomIndex = Math.floor(Math.random() * responses.length)
        return responses[randomIndex]
      }
    }
    
    // Check for equipment-related inputs (special case)
    if (inputLower.includes("equipment") || inputLower.includes("gym") || inputLower.includes("have")) {
      if (inputLower.includes("dumbbell") || inputLower.includes("weights")) {
        return `Excellent, ${userName}! Dumbbells are the philosopher's stone of fitness—simple, timeless, effective. What else would you like to know?`
      }
      if (inputLower.includes("barbell")) {
        return `A barbell? Now we're talking. The squat, deadlift, bench, and overhead press—master these and you'll build a powerful physique.`
      }
      if (inputLower.includes("nothing") || inputLower.includes("no equipment") || inputLower.includes("bodyweight")) {
        return `Bodyweight only? Perfect. Push-ups, pull-ups, squats, and planks can build an impressive physique. No excuses needed.`
      }
    }
    
    // Check for greetings
    if (inputLower.includes("hello") || inputLower.includes("hi") || inputLower.includes("hey")) {
      return `Hey ${userName}! Ready to work? Tell me what's on your mind—training, nutrition, or anything fitness-related.`
    }
    
    // Check for thanks
    if (inputLower.includes("thank") || inputLower.includes("thanks")) {
      return `You're welcome, ${userName}! Keep pushing forward. I'm here whenever you need guidance.`
    }
    
    // No keyword matched - return a random generic response
    const randomIndex = Math.floor(Math.random() * GENERIC_RESPONSES.length)
    return GENERIC_RESPONSES[randomIndex]
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
