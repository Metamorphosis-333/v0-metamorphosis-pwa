export const EVOLUTION_STAGES = {
  caterpillar: {
    name: "Caterpillar",
    emoji: "🐛",
    description: "Beginning your transformation",
    xpRequired: 0,
    benefits: "Building healthy habits",
  },
  chrysalis: {
    name: "Chrysalis",
    emoji: "🫗",
    description: "Deep in metamorphosis",
    xpRequired: 500,
    benefits: "Habits becoming stronger",
  },
  butterfly: {
    name: "Butterfly",
    emoji: "🦋",
    description: "Emerging transformed",
    xpRequired: 1500,
    benefits: "Peak consistency & discipline",
  },
  monarch: {
    name: "Monarch",
    emoji: "👑",
    description: "Master of metamorphosis",
    xpRequired: 3000,
    benefits: "Full lifestyle transformation",
  },
}

export const ACHIEVEMENTS = {
  protein_goal: {
    title: "Protein Champion",
    description: "Hit your daily protein goal 7 days in a row",
    icon: "🥩",
    points: 50,
  },
  workout_streak: {
    title: "Unstoppable",
    description: "Complete 5 workouts in one week",
    icon: "💪",
    points: 75,
  },
  meditation: {
    title: "Zen Master",
    description: "Complete 10 meditation/mindfulness sessions",
    icon: "🧘",
    points: 40,
  },
  consistency: {
    title: "Iron Discipline",
    description: "Log activities for 30 consecutive days",
    icon: "⛓️",
    points: 100,
  },
  challenge: {
    title: "Challenge Accepted",
    description: "Complete a 7-day fitness challenge",
    icon: "🎯",
    points: 85,
  },
}

export function calculateStageProgress(xp: number): { stage: keyof typeof EVOLUTION_STAGES; progress: number } {
  for (const stage of Object.keys(EVOLUTION_STAGES).reverse()) {
    const stageKey = stage as keyof typeof EVOLUTION_STAGES
    if (xp >= EVOLUTION_STAGES[stageKey].xpRequired) {
      const currentStageXp = EVOLUTION_STAGES[stageKey].xpRequired
      const nextStageXp =
        Object.values(EVOLUTION_STAGES).find((s) => s.xpRequired > currentStageXp)?.xpRequired || currentStageXp + 2000
      const progress = Math.min(100, Math.round(((xp - currentStageXp) / (nextStageXp - currentStageXp)) * 100))
      return { stage: stageKey, progress }
    }
  }
  return { stage: "caterpillar", progress: Math.round((xp / 500) * 100) }
}

export function getNextStage(currentStage: keyof typeof EVOLUTION_STAGES): keyof typeof EVOLUTION_STAGES | null {
  const stages = Object.keys(EVOLUTION_STAGES) as Array<keyof typeof EVOLUTION_STAGES>
  const currentIndex = stages.indexOf(currentStage)
  return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null
}
