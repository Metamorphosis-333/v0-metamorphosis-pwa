import { createClient } from "@/lib/supabase/server"
import { generateChallenge } from "@/lib/webauthn"
import { NextResponse } from "next/server"
import type { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user's passkeys
    const {
      data: { users },
    } = await supabase.auth.admin.listUsers()
    const user = users.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { data: passkeys } = await supabase
      .from("passkeys")
      .select("credential_id, transports")
      .eq("user_id", user.id)

    if (!passkeys || passkeys.length === 0) {
      return NextResponse.json({ error: "No passkeys found for this user" }, { status: 404 })
    }

    const challenge = generateChallenge()

    // Store challenge
    await supabase.from("webauthn_challenges").insert({
      email,
      challenge,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })

    const options: PublicKeyCredentialRequestOptionsJSON = {
      challenge,
      rpId: process.env.NEXT_PUBLIC_RP_ID || "localhost",
      timeout: 60000,
      userVerification: "preferred",
      allowCredentials: passkeys.map((pk) => ({
        id: pk.credential_id,
        type: "public-key",
        transports: pk.transports as AuthenticatorTransport[],
      })),
    }

    return NextResponse.json(options)
  } catch (error) {
    console.error("[v0] Passkey authentication start error:", error)
    return NextResponse.json({ error: "Failed to start authentication" }, { status: 500 })
  }
}
