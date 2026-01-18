"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QuoteBanner } from "@/components/quote-banner"
import { Mail } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { CheckEmailContent } from "@/components/check-email-content"

export default function CheckEmailPage() {
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Metamorphosis
          </h1>
        </div>

        <QuoteBanner />

        <Card className="glass-strong border-white/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>We&apos;ve sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Click the link in your email to confirm your account and begin your transformation journey.
            </p>

            <Suspense fallback={null}>
              <CheckEmailContent
                email={email}
                handleResend={handleResend}
                isResending={isResending}
                resendMessage={resendMessage}
                resendError={resendError}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
