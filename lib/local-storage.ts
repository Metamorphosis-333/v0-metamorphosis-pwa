"use client"

// Local storage keys
const STORAGE_KEYS = {
  PROFILE: "metamorphosis_profile",
  WEIGHT_LOGS: "metamorphosis_weight_logs",
  NUTRITION_LOGS: "metamorphosis_nutrition_logs",
  MOOD_CHECKS: "metamorphosis_mood_checks",
  ONBOARDING_COMPLETE: "metamorphosis_onboarding_complete",
} as const

// Profile type
export interface LocalProfile {
  id: string
  name: string
  age: number
  weight: number
  height: number
  why?: string
  goal?: "weight_loss" | "weight_gain" | "muscle_building" | "maintaining"
  unit_preference?: "imperial" | "metric"
  trainer_personality?: string
  psychiatrist_personality?: string
  gender?: string
  evolution_path?: string
  journal_name?: string
  accessibility_notes?: string
  created_at: string
  updated_at: string
}

// Weight log type
export interface LocalWeightLog {
  id: string
  weight: number
  logged_at: string
}

// Nutrition log type
export interface LocalNutritionLog {
  id: string
  calories: number
  protein: number
  carbs: number
  fat: number
  logged_at: string
}

// Mood check type
export interface LocalMoodCheck {
  id: string
  mood: string
  energy_level: number
  notes?: string
  checked_at: string
}

// Generate a unique ID
export function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Profile functions
export function getProfile(): LocalProfile | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE)
  return data ? JSON.parse(data) : null
}

export function saveProfile(profile: Partial<LocalProfile>): LocalProfile {
  const existing = getProfile()
  const updated: LocalProfile = {
    id: existing?.id || generateId(),
    name: profile.name ?? existing?.name ?? "",
    age: profile.age ?? existing?.age ?? 0,
    weight: profile.weight ?? existing?.weight ?? 0,
    height: profile.height ?? existing?.height ?? 0,
    why: profile.why ?? existing?.why ?? "",
    goal: profile.goal ?? existing?.goal,
    unit_preference: profile.unit_preference ?? existing?.unit_preference ?? "imperial",
    trainer_personality: profile.trainer_personality ?? existing?.trainer_personality ?? "balanced",
    psychiatrist_personality: profile.psychiatrist_personality ?? existing?.psychiatrist_personality ?? "philosophical",
    gender: profile.gender ?? existing?.gender,
    evolution_path: profile.evolution_path ?? existing?.evolution_path ?? "balanced",
    journal_name: profile.journal_name ?? existing?.journal_name,
    accessibility_notes: profile.accessibility_notes ?? existing?.accessibility_notes,
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated))
  return updated
}

export function deleteProfile(): void {
  localStorage.removeItem(STORAGE_KEYS.PROFILE)
}

// Weight logs functions
export function getWeightLogs(): LocalWeightLog[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS)
  return data ? JSON.parse(data) : []
}

export function addWeightLog(weight: number): LocalWeightLog {
  const logs = getWeightLogs()
  const newLog: LocalWeightLog = {
    id: generateId(),
    weight,
    logged_at: new Date().toISOString(),
  }
  logs.push(newLog)
  localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs))
  return newLog
}

export function getWeightLogsLast30Days(): LocalWeightLog[] {
  const logs = getWeightLogs()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return logs
    .filter((log) => new Date(log.logged_at) >= thirtyDaysAgo)
    .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
}

// Nutrition logs functions
export function getNutritionLogs(): LocalNutritionLog[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.NUTRITION_LOGS)
  return data ? JSON.parse(data) : []
}

export function getTodayNutrition(): LocalNutritionLog | null {
  const logs = getNutritionLogs()
  const today = new Date().toISOString().split("T")[0]
  return logs.find((log) => log.logged_at.startsWith(today)) || null
}

export function saveNutritionLog(nutrition: Omit<LocalNutritionLog, "id" | "logged_at">): LocalNutritionLog {
  const logs = getNutritionLogs()
  const today = new Date().toISOString().split("T")[0]
  const existingIndex = logs.findIndex((log) => log.logged_at.startsWith(today))

  const newLog: LocalNutritionLog = {
    id: existingIndex >= 0 ? logs[existingIndex].id : generateId(),
    ...nutrition,
    logged_at: new Date().toISOString(),
  }

  if (existingIndex >= 0) {
    logs[existingIndex] = newLog
  } else {
    logs.push(newLog)
  }

  localStorage.setItem(STORAGE_KEYS.NUTRITION_LOGS, JSON.stringify(logs))
  return newLog
}

// Mood checks functions
export function getMoodChecks(): LocalMoodCheck[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.MOOD_CHECKS)
  return data ? JSON.parse(data) : []
}

export function getTodayMoodCheck(): LocalMoodCheck | null {
  const checks = getMoodChecks()
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  return (
    checks
      .filter((check) => new Date(check.checked_at) >= startOfDay)
      .sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime())[0] || null
  )
}

export function saveMoodCheck(mood: string, energyLevel: number, notes?: string): LocalMoodCheck {
  const checks = getMoodChecks()
  const newCheck: LocalMoodCheck = {
    id: generateId(),
    mood,
    energy_level: energyLevel,
    notes,
    checked_at: new Date().toISOString(),
  }
  checks.push(newCheck)
  localStorage.setItem(STORAGE_KEYS.MOOD_CHECKS, JSON.stringify(checks))
  return newCheck
}

// Onboarding status
export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === "true"
}

export function setOnboardingComplete(): void {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, "true")
}

// Clear all local data
export function clearAllLocalData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
}

// Export all data (for backup)
export function exportAllData(): string {
  const data = {
    profile: getProfile(),
    weightLogs: getWeightLogs(),
    nutritionLogs: getNutritionLogs(),
    moodChecks: getMoodChecks(),
    exportedAt: new Date().toISOString(),
  }
  return JSON.stringify(data, null, 2)
}

// Import data (for restore)
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString)
    if (data.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile))
    if (data.weightLogs) localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(data.weightLogs))
    if (data.nutritionLogs) localStorage.setItem(STORAGE_KEYS.NUTRITION_LOGS, JSON.stringify(data.nutritionLogs))
    if (data.moodChecks) localStorage.setItem(STORAGE_KEYS.MOOD_CHECKS, JSON.stringify(data.moodChecks))
    if (data.profile) setOnboardingComplete()
    return true
  } catch {
    return false
  }
}
