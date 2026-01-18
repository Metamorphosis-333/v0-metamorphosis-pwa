import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TherapyContent } from "@/components/therapy-content"

export default async function TherapyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <TherapyContent profile={profile} />
}
