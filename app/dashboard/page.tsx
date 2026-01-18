import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  // If no profile or missing required onboarding data, redirect to onboarding
  if (!profile || !profile.name || !profile.age || !profile.weight || !profile.height) {
    redirect("/onboarding")
  }

  // Get weight logs (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: weightLogs } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("logged_at", thirtyDaysAgo.toISOString())
    .order("logged_at", { ascending: true })

  // Get today's nutrition
  const today = new Date().toISOString().split("T")[0]
  const { data: todayNutrition } = await supabase
    .from("nutrition_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("logged_at", today)
    .maybeSingle()

  // Get today's mood check
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const { data: todayMood } = await supabase
    .from("mood_checks")
    .select("*")
    .eq("user_id", user.id)
    .gte("checked_at", startOfDay.toISOString())
    .order("checked_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <DashboardContent
      profile={profile}
      weightLogs={weightLogs || []}
      todayNutrition={todayNutrition}
      hasMoodCheck={!!todayMood}
    />
  )
}
