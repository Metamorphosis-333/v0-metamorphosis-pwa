"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Fingerprint, Loader2, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { isWebAuthnSupported, isPlatformAuthenticatorAvailable } from "@/lib/webauthn"
import { startAuthentication, startRegistration } from "@simplewebauthn/browser"

interface PasskeyAuthProps {
  mode: "signup" | "login"
}

export function PasskeyAuth({ mode }: PasskeyAuthProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const router = useRouter()

  useState(() => {
    if (typeof window !== "undefined") {
      const checkSupport = async () => {
        const supported = isWebAuthnSupported() && (await isPlatformAuthenticatorAvailable())
        setIsSupported(supported)
      }
      checkSupport()
    }
  })

  const handlePasskeySignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Start registration
      const optionsResponse = await fetch("/api/passkey/register/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      })

      if (!optionsResponse.ok) {
        throw new Error("Failed to start passkey registration")
      }

      const options = await optionsResponse.json()

      // Create credential
      const credential = await startRegistration(options)

      // Finish registration
      const finishResponse = await fetch("/api/passkey/register/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          credential,
          challenge: options.challenge,
          deviceName: navigator.userAgent.includes("iPhone")
            ? "iPhone"
            : navigator.userAgent.includes("Mac")
              ? "Mac"
              : "Device",
        }),
      })

      if (!finishResponse.ok) {
        throw new Error("Failed to complete passkey registration")
      }

      router.push("/onboarding")
    } catch (err) {
      console.error("[v0] Passkey signup error:", err)
      setError(err instanceof Error ? err.message : "Failed to create passkey")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasskeyLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Start authentication
      const optionsResponse = await fetch("/api/passkey/authenticate/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json()
        throw new Error(errorData.error || "Failed to start authentication")
      }

      const options = await optionsResponse.json()

      // Get credential
      const credential = await startAuthentication(options)

      // Finish authentication
      const finishResponse = await fetch("/api/passkey/authenticate/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          credential,
          challenge: options.challenge,
        }),
      })

      if (!finishResponse.ok) {
        throw new Error("Failed to complete authentication")
      }

      const result = await finishResponse.json()
      router.push(result.redirectUrl || "/dashboard")
    } catch (err) {
      console.error("[v0] Passkey login error:", err)
      setError(err instanceof Error ? err.message : "Failed to authenticate with passkey")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Card className="glass border-yellow-500/20">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Passkeys are not supported on this device. Please use email and password authentication.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-strong border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Fingerprint className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {mode === "signup" ? "Create Account with Passkey" : "Login with Passkey"}
            </CardTitle>
            <CardDescription>
              {mode === "signup" ? "Use Face ID, Touch ID, or device biometrics" : "Quick and secure authentication"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={mode === "signup" ? handlePasskeySignup : handlePasskeyLogin}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass"
              />
            </div>
            {mode === "signup" && (
              <div className="grid gap-2">
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass"
                />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "signup" ? "Setting up..." : "Authenticating..."}
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {mode === "signup" ? "Create Passkey" : "Login with Passkey"}
                </>
              )}
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-primary/5">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <p>Your biometric data never leaves your device. Passkeys are stored securely on your iPhone or Mac.</p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
