"use client"

import { useEffect, useState } from "react"
import { getRandomQuote } from "@/lib/quotes"

export function QuoteBanner() {
  const [quote, setQuote] = useState(getRandomQuote())

  useEffect(() => {
    const interval = setInterval(() => {
      setQuote(getRandomQuote())
    }, 30000) // Change quote every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass rounded-xl p-4 border border-white/10">
      <p className="text-sm text-muted-foreground italic text-balance">&ldquo;{quote.text}&rdquo;</p>
      <p className="text-xs text-muted-foreground mt-2">— {quote.author}</p>
    </div>
  )
}
