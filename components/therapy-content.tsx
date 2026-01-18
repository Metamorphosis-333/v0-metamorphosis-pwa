"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QuoteBanner } from "@/components/quote-banner"
import { VoiceButton } from "@/components/voice-button"
import { ArrowLeft, Send, Brain } from "lucide-react"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TherapyContentProps {
  profile: {
    name: string
    why: string
  }
}

interface Message {
  role: "user" | "assistant"
  content: string
}

export function TherapyContent({ profile }: TherapyContentProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hey ${profile.name}. I'm your AI psychiatrist-trainer hybrid. Think of me as the voice that asks "but why?" when you say you're stuck. No judgment, just philosophy and a little dry humor. What's on your mind?`,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const getTherapyResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    // Plateau responses
    if (lowerMessage.includes("plateau") || lowerMessage.includes("stuck") || lowerMessage.includes("not losing")) {
      return "Ah, the plateau. You know what Nietzsche said about the abyss? It stares back. But here's the thing—plateaus aren't failures, they're your body's way of negotiating. Maybe it's time to ask: are you *actually* stuck, or are you just bored with the process? Let's look at your protein intake and sleep. Those are usually the culprits hiding in plain sight."
    }

    // Motivation issues
    if (
      lowerMessage.includes("motivat") ||
      lowerMessage.includes("give up") ||
      lowerMessage.includes("don't want") ||
      lowerMessage.includes("tired")
    ) {
      return `Listen, motivation is overrated. It's like waiting for inspiration to write a novel—it's not coming. What you need is discipline dressed up as routine. Remember your 'why'? "${profile.why}" That's not motivation. That's your north star. The days you don't feel like it? Those are the ones that count. Show up anyway. Even if it's just for 10 minutes.`
    }

    // Diet struggles
    if (
      lowerMessage.includes("diet") ||
      lowerMessage.includes("eating") ||
      lowerMessage.includes("food") ||
      lowerMessage.includes("hungry")
    ) {
      return "Here's a fun fact: your body is basically a very demanding toddler. It wants what it wants *now*. But you're the adult in the relationship. The trick isn't deprivation—that's just setting yourself up for a binge. It's about trading up. Craving sugar? Your body actually wants sustained energy. Check your protein and complex carbs. Are you hitting your targets? Let's look at your Health Sync data."
    }

    // Progress doubts
    if (lowerMessage.includes("progress") || lowerMessage.includes("working") || lowerMessage.includes("results")) {
      return "Results. Everyone wants them yesterday. But transformation isn't linear—it's more like a drunk person walking home. Lots of zigzagging, but you're still heading in the right direction. Look at your Weight Chart. See those fluctuations? That's normal. The trend line is what matters. Rome wasn't built in a day, and neither are abs. Trust the process. It's working even when you can't see it."
    }

    // Comparison to others
    if (
      lowerMessage.includes("everyone else") ||
      lowerMessage.includes("other people") ||
      lowerMessage.includes("compare")
    ) {
      return "Comparison is the thief of joy, but it's also terrible math. You're comparing your Chapter 3 to someone else's Chapter 20. Their highlight reel to your behind-the-scenes. Here's what matters: are you better than *yesterday's you*? That's the only comparison that counts. Everyone else is running their own race. Stay in your lane."
    }

    // Feeling overwhelmed
    if (
      lowerMessage.includes("overwhelm") ||
      lowerMessage.includes("too much") ||
      lowerMessage.includes("hard") ||
      lowerMessage.includes("can't do")
    ) {
      return "Overwhelm is just your brain's way of saying 'I need a smaller task.' You don't have to conquer the mountain today. Just take one step. One meal. One workout. The secret nobody tells you? Transformation happens in tiny, boring increments. Check your mood today—if you're stressed, let's focus on those 15-minute easy recipes. Small wins compound."
    }

    // Injury or setback
    if (lowerMessage.includes("injured") || lowerMessage.includes("hurt") || lowerMessage.includes("setback")) {
      return "Setbacks are plot twists, not endings. Think of this as your body sending a memo: 'Hey, we need to adjust the plan.' Injuries are frustrating, but they're also teachers. What can you do *instead*? Maybe it's time to focus on nutrition, sleep, or mobility work. Progress isn't just about the gym. It's holistic. Use this time to master the other pillars."
    }

    // Sleep issues
    if (lowerMessage.includes("sleep") || lowerMessage.includes("tired") || lowerMessage.includes("exhausted")) {
      return "Sleep is the most underrated performance enhancer. You can out-train a bad diet sometimes, but you can't out-train bad sleep. It's like trying to run software updates on 10% battery. Your body does all its repair work at night. If you're not sleeping, you're not recovering. And if you're not recovering, you're not progressing. Let's talk about your sleep hygiene. What's your evening routine look like?"
    }

    // Success acknowledgment
    if (
      lowerMessage.includes("good") ||
      lowerMessage.includes("great") ||
      lowerMessage.includes("proud") ||
      lowerMessage.includes("progress")
    ) {
      return "Look at you, showing up and celebrating the wins. That's growth right there. You know what most people miss? The importance of acknowledging progress. It rewires your brain to associate effort with positive outcomes. Keep this energy. And remember, the work that got you here won't get you to the next level. Keep evolving."
    }

    // Default philosophical response
    const responses = [
      "That's an interesting perspective. Let's dig deeper—what's the real issue underneath? Sometimes what we think is the problem is just the symptom.",
      "Marcus Aurelius would probably say the obstacle is the way. But let's be practical: what specifically is blocking you right now? Let's break it down.",
      "You know what's wild? Most fitness problems are actually psychology problems wearing gym clothes. What's really going on here?",
      "Here's the thing about transformation: it's uncomfortable by design. Growth lives just outside your comfort zone. The question is, are you ready to lean into that discomfort?",
      `Remember why you started? "${profile.why}" Hold onto that. When the day-to-day grind gets boring, your why is what keeps you moving.`,
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

    // Simulate AI response delay
    setTimeout(() => {
      const response = getTherapyResponse(userMessage)
      setMessages((prev) => [...prev, { role: "assistant", content: response }])
      setIsLoading(false)
    }, 1000)
  }

  const handleVoiceInput = (transcript: string) => {
    setInput(transcript)
  }

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
            <h1 className="text-3xl font-bold">Therapy Chat</h1>
            <p className="text-muted-foreground">Your AI psychiatrist for fitness plateaus</p>
          </div>
        </div>

        {/* Quote Banner */}
        <QuoteBanner />

        {/* Chat Interface */}
        <Card className="glass-strong border-white/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>The Psychiatrist</CardTitle>
                <CardDescription>Witty, philosophical, and here to help you work through mental blocks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <ScrollArea className="h-96 pr-4">
              <div className="space-y-4">
                {messages.map((message, i) => (
                  <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "glass border border-white/10"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="glass border border-white/10 rounded-lg p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="What's on your mind?"
                className="glass"
                disabled={isLoading}
              />
              <VoiceButton onTranscript={handleVoiceInput} size="icon" />
              <Button onClick={handleSend} size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick prompts */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="glass bg-transparent text-xs"
                onClick={() => setInput("I'm feeling stuck with my progress")}
              >
                Feeling stuck
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="glass bg-transparent text-xs"
                onClick={() => setInput("I have no motivation today")}
              >
                No motivation
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="glass bg-transparent text-xs"
                onClick={() => setInput("Why am I not seeing results?")}
              >
                No results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="glass border-white/10">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>About this chat:</strong> This is your safe space to work through mental blocks, plateaus, and
              motivation issues. The responses blend functional psychology, Stoic philosophy, and practical fitness
              wisdom—delivered with a dry sense of humor. No judgment, just real talk.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
