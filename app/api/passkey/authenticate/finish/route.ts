import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, credential, challenge } = await request.json()

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

    // Get user
    const {
      data: { users },
    } = await supabase.auth.admin.listUsers()
    const user = users.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify the passkey exists
    const { data: passkey } = await supabase
      .from("passkeys")
      .select("*")
      .eq("user_id", user.id)
      .eq("credential_id", credential.id)
      .single()

    if (!passkey) {
      return NextResponse.json({ error: "Invalid passkey" }, { status: 400 })
    }

    // Update last used timestamp
    await supabase.from("passkeys").update({ last_used_at: new Date().toISOString() }).eq("id", passkey.id)

    // Delete used challenge
    await supabase.from("webauthn_challenges").delete().eq("id", storedChallenge.id)

    // Create session token
    const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    })

    if (sessionError) {
      throw sessionError
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      redirectUrl: "/dashboard",
    })
  } catch (error) {
    console.error("[v0] Passkey authentication finish error:", error)
    return NextResponse.json({ error: "Failed to complete authentication" }, { status: 500 })
  }
}
