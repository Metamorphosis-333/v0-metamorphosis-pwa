import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HealthSyncContent } from "@/components/health-sync-content"

export default async function HealthSyncPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get nutrition logs for last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoDate = sevenDaysAgo.toISOString().split("T")[0]

  const { data: nutritionLogs } = await supabase
    .from("nutrition_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("logged_at", sevenDaysAgoDate)
    .order("logged_at", { ascending: true })

  return <HealthSyncContent profile={profile} nutritionLogs={nutritionLogs || []} />
}
