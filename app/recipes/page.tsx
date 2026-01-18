import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecipesContent } from "@/components/recipes-content"

export default async function RecipesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all recipes
  const { data: recipes } = await supabase.from("recipes").select("*").order("title")

  // Get today's mood check to personalize recommendations
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const { data: todayMood } = await supabase
    .from("mood_checks")
    .select("*")
    .eq("user_id", user.id)
    .gte("checked_at", startOfDay.toISOString())
    .order("checked_at", { ascending: false })
    .limit(1)
    .single()

  return <RecipesContent recipes={recipes || []} mood={todayMood?.mood} />
}
