"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { saveProfile } from "@/lib/local-storage"

const WORKOUT_TYPES = [
  { id: "hike", label: "Hike", icon: "🥾" },
  { id: "walk", label: "Walk", icon: "🚶" },
  { id: "gym", label: "Gym", icon: "💪" },
  { id: "yoga", label: "Yoga", icon: "🧘" },
  { id: "run", label: "Run", icon: "🏃" },
  { id: "swim", label: "Swim", icon: "🏊" },
  { id: "bike", label: "Bike", icon: "🚴" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "dance", label: "Dance", icon: "💃" },
  { id: "other", label: "Other", icon: "🎯" },
]

const EVOLUTION_PATHS = [
  { id: "beast_mode", label: "Beast Mode", description: "Maximum performance focus" },
  { id: "balanced", label: "Balanced", description: "Health and wellness blend" },
  { id: "mindful", label: "Mindful", description: "Sustainability and peace" },
  { id: "custom", label: "Custom", description: "Your own unique path" },
]

interface ProfileData {
  gender?: string
  evolution_path?: string
  journal_name?: string
  accessibility_notes?: string
}

export function ProfileEnhancements({ profile }: { profile: any }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null)
  const [workoutDuration, setWorkoutDuration] = useState("")
  const [data, setData] = useState<ProfileData>({
    gender: profile?.gender || "",
    evolution_path: profile?.evolution_path || "balanced",
    journal_name: profile?.journal_name || "",
    accessibility_notes: profile?.accessibility_notes || "",
  })

  const handleLogWorkout = () => {
    if (!selectedWorkout || !workoutDuration) {
      toast({
        title: "Missing fields",
        description: "Please select a workout and duration",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Save workout to localStorage
      const workouts = JSON.parse(localStorage.getItem("metamorphosis_workouts") || "[]")
      workouts.push({
        id: `workout_${Date.now()}`,
        workout_type: selectedWorkout,
        duration_minutes: Number.parseInt(workoutDuration),
        logged_at: new Date().toISOString(),
      })
      localStorage.setItem("metamorphosis_workouts", JSON.stringify(workouts))

      toast({
        title: "Workout logged",
        description: `${WORKOUT_TYPES.find((w) => w.id === selectedWorkout)?.label} workout recorded!`,
      })

      setSelectedWorkout(null)
      setWorkoutDuration("")
    } catch (error) {
      console.error("Error logging workout:", error)
      toast({
        title: "Error",
        description: "Failed to log workout",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = () => {
    setLoading(true)
    try {
      // Save to localStorage using the saveProfile function - merge with existing data
      saveProfile({
        gender: data.gender,
        evolution_path: data.evolution_path,
        journal_name: data.journal_name,
        accessibility_notes: data.accessibility_notes,
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been saved",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Evolution Path */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your Evolution Path</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {EVOLUTION_PATHS.map((path) => (
            <button
              key={path.id}
              onClick={() => setData({ ...data, evolution_path: path.id })}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                data.evolution_path === path.id
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-600 bg-slate-800/30 hover:border-slate-500"
              }`}
            >
              <div className="font-semibold text-white">{path.label}</div>
              <div className="text-xs text-slate-400 mt-1">{path.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Workout Logging */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Log Today's Activity</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-3">Select Activity</label>
            <div className="grid grid-cols-5 gap-2">
              {WORKOUT_TYPES.map((workout) => (
                <button
                  key={workout.id}
                  onClick={() => setSelectedWorkout(workout.id)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    selectedWorkout === workout.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-600 hover:border-slate-500 bg-slate-800/30"
                  }`}
                  title={workout.label}
                >
                  <div className="text-xl">{workout.icon}</div>
                  <div className="text-xs text-slate-300">{workout.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Duration (minutes)</label>
            <Input
              type="number"
              min="1"
              max="480"
              value={workoutDuration}
              onChange={(e) => setWorkoutDuration(e.target.value)}
              placeholder="30"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <Button
            onClick={handleLogWorkout}
            disabled={loading || !selectedWorkout || !workoutDuration}
            className="w-full"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Log Activity
          </Button>
        </div>
      </div>

      {/* Personal Details */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Personal Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Gender</label>
            <select
              value={data.gender || ""}
              onChange={(e) => setData({ ...data, gender: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Not specified</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Journal Name</label>
            <Input
              value={data.journal_name || ""}
              onChange={(e) => setData({ ...data, journal_name: e.target.value })}
              placeholder='e.g., "My Transformation Journal"'
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Accessibility Notes</label>
            <textarea
              value={data.accessibility_notes || ""}
              onChange={(e) => setData({ ...data, accessibility_notes: e.target.value })}
              placeholder="Any mobility or physical considerations we should know about?"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              rows={3}
            />
          </div>

          <Button onClick={handleUpdateProfile} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  )
}
