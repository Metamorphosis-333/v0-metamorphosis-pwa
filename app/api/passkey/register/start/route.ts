import { createClient } from "@/lib/supabase/server"
import { generateChallenge } from "@/lib/webauthn"
import { NextResponse } from "next/server"
import type { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types"

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user exists
    const { data: authUser } = await supabase.auth.admin.listUsers()
    const existingUser = authUser?.users.find((u) => u.email === email)

    const userId = existingUser?.id || crypto.randomUUID()
    const challenge = generateChallenge()

    // Store challenge
    await supabase.from("webauthn_challenges").insert({
      email,
      challenge,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    })

    // Clean up old challenges
    await supabase.from("webauthn_challenges").delete().lt("expires_at", new Date().toISOString())

    const options: PublicKeyCredentialCreationOptionsJSON = {
      challenge,
      rp: {
        name: "Metamorphosis",
        id: process.env.NEXT_PUBLIC_RP_ID || "localhost",
      },
      user: {
        id: userId,
        name: email,
        displayName: name || email.split("@")[0],
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      timeout: 60000,
      attestation: "none",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        requireResidentKey: false,
        residentKey: "preferred",
        userVerification: "preferred",
      },
    }

    return NextResponse.json(options)
  } catch (error) {
    console.error("[v0] Passkey registration start error:", error)
    return NextResponse.json({ error: "Failed to start registration" }, { status: 500 })
  }
}
