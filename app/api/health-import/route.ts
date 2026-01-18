import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { weight, date, source } = body

    // Validate input
    if (!weight || !date) {
      return NextResponse.json({ error: "Missing required fields: weight and date" }, { status: 400 })
    }

    // Insert weight log
    const { error: weightError } = await supabase.from("weight_logs").insert({
      user_id: user.id,
      weight: Number.parseFloat(weight),
      logged_at: date,
    })

    if (weightError) throw weightError

    // Track the sync
    const { error: syncError } = await supabase.from("apple_health_syncs").insert({
      user_id: user.id,
      sync_type: source || "shortcuts",
      records_imported: 1,
    })

    if (syncError) console.error("Sync tracking error:", syncError)

    return NextResponse.json({ success: true, message: "Weight data imported successfully" })
  } catch (error) {
    console.error("Health import error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import health data" },
      { status: 500 },
    )
  }
}
