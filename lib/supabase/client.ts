import { createBrowserClient } from "@supabase/ssr"

export function createClient(persistSession: "local" | "session" = "local") {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: true,
      storage: persistSession === "local" ? undefined : sessionStorage,
    },
  })
}
