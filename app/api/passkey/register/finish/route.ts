import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, credential, challenge, deviceName } = await request.json()

    if (!email || !credential || !challenge) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify challenge
    const { data: storedChallenge } = await supabase
      .from("webauthn_challenges")
      .select("*")
      .eq("email", email)
      .eq("challenge", challenge)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (!storedChallenge) {
      return NextResponse.json({ error: "Invalid or expired challenge" }, { status: 400 })
    }

    // Create or get user
    let userId: string

    const {
      data: { users },
    } = await supabase.auth.admin.listUsers()
    const existingUser = users.find((u) => u.email === email)

    if (existingUser) {
      userId = existingUser.id
    } else {
      // Create new user with a random password (won't be used for passkey auth)
      const randomPassword = crypto.randomUUID()
      const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true, // Auto-confirm for passkey users
      })

      if (signUpError || !newUser.user) {
        throw new Error("Failed to create user")
      }

      userId = newUser.user.id
    }

    // Store passkey credential
    const { error: insertError } = await supabase.from("passkeys").insert({
      user_id: userId,
      credential_id: credential.id,
      public_key: JSON.stringify(credential.response.publicKey),
      counter: 0,
      transports: credential.response.transports,
      device_name: deviceName || "Unknown device",
    })

    if (insertError) {
      throw insertError
    }

    // Delete used challenge
    await supabase.from("webauthn_challenges").delete().eq("id", storedChallenge.id)

    // Sign in the user
    const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    })

    if (sessionError) {
      throw sessionError
    }

    return NextResponse.json({
      success: true,
      userId,
      message: "Passkey registered successfully",
    })
  } catch (error) {
    console.error("[v0] Passkey registration finish error:", error)
    return NextResponse.json({ error: "Failed to complete registration" }, { status: 500 })
  }
}
