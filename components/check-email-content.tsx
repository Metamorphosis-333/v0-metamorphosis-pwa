"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSearchParams } from "next/navigation"

export function CheckEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [resendError, setResendError] = useState<string | null>(null)

  const handleResend = async () => {
    if (!email) {
      setResendError("Email address not found. Please return to sign up.")
      return
    }

    setIsResending(true)
    setResendMessage(null)
    setResendError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/onboarding`,
        },
      })

      if (error) throw error

      setResendMessage("Confirmation email resent! Check your inbox.")
    } catch (error: unknown) {
      setResendError(error instanceof Error ? error.message : "Failed to resend email")
    } finally {
      setIsResending(false)
    }
  }

  if (!email) return null

  return (
    <div className="pt-4 border-t border-white/10 space-y-3">
      <p className="text-xs text-muted-foreground text-center">Didn&apos;t receive the email?</p>
      <p className="text-xs text-muted-foreground/60 text-center">Check your spam or junk folder</p>
      <Button variant="outline" className="w-full glass bg-transparent" onClick={handleResend} disabled={isResending}>
        {isResending ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Resending...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Resend confirmation email
          </>
        )}
      </Button>

      {resendMessage && <p className="text-xs text-green-500 text-center">{resendMessage}</p>}
      {resendError && <p className="text-xs text-destructive text-center">{resendError}</p>}
    </div>
  )
}
