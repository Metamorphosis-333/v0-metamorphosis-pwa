export interface CoachResponse {
  message: string
  emoji: string
  tone: string
}

export const COACH_PERSONALITIES = {
  drill_sergeant: {
    name: "Drill Sergeant",
    description: "Direct, challenging, no-nonsense",
    prompts: {
      motivation: [
        "Drop and give me 20! You're stronger than you think.",
        "No excuses. Your future self will thank you.",
        "Pain is weakness leaving the body. Keep pushing!",
      ],
      protein: [
        "Get that protein in NOW! Your muscles won't build themselves.",
        "You're short on protein soldier. Fuel up!",
        "Every gram of protein is a rep toward victory.",
      ],
      snack: [
        "Hungry? Grab some chicken, eggs, or Greek yogurt. Make it count!",
        "Snack smart or don't snack at all.",
        "Your body is a machine. Feed it quality fuel.",
      ],
    },
  },
  zen_master: {
    name: "Zen Master",
    description: "Calm, philosophical, holistic",
    prompts: {
      motivation: [
        "The journey of a thousand miles begins with one step. Be present.",
        "Your body whispers before it screams. Listen to it.",
        "Transformation is not a destination, but a way of being.",
      ],
      protein: [
        "Nourish your body with intention. Protein is sacred energy.",
        "Balance in all things. Your protein intake reflects balance.",
        "Feed the temple that carries your spirit.",
      ],
      snack: [
        "Choose with mindfulness. What does your body truly need?",
        "A mindful snack is better than mindless eating.",
        "Find the harmony between nourishment and presence.",
      ],
    },
  },
  cheerleader: {
    name: "Cheerleader",
    description: "Enthusiastic, supportive, empowering",
    prompts: {
      motivation: [
        "YOU'VE GOT THIS! Look how far you've come!",
        "Every day is a new opportunity to be stronger. YOU'RE AMAZING!",
        "I believe in you more than you believe in yourself!",
      ],
      protein: [
        "You're crushing your goals! Let's hit that protein target!",
        "Your dedication is INSPIRING! Keep fueling up!",
        "So close on protein! You got this, champion!",
      ],
      snack: [
        "Smart snacking? That's what champions do! Go you!",
        "Treat yourself to something delicious AND healthy. You deserve it!",
        "Every healthy choice is a WIN in my book!",
      ],
    },
  },
  sage: {
    name: "Sage",
    description: "Philosophical, witty, Stoic wisdom",
    prompts: {
      motivation: [
        "Marcus Aurelius didn't skip leg day. Neither should you.",
        "The obstacle is the way. Embrace the struggle.",
        "Memento mori - you have today. Make it count.",
      ],
      protein: [
        "The Stoics knew: discipline in small things leads to greatness.",
        "Your protein goal is not a burden—it's a practice in excellence.",
        "Virtue is the highest good. Let that protein be virtuous.",
      ],
      snack: [
        "What would the Stoics eat? Probably something simple and nourishing.",
        "Choose the apple, not the escape. Your future self will thank you.",
        "A simple, nutritious snack. That's all you truly need.",
      ],
    },
  },
}

export function getCoachResponse(
  personality: keyof typeof COACH_PERSONALITIES,
  context: "motivation" | "protein" | "snack",
): CoachResponse {
  const coach = COACH_PERSONALITIES[personality]
  const options = coach.prompts[context]
  const message = options[Math.floor(Math.random() * options.length)]

  return {
    message,
    emoji: context === "motivation" ? "💪" : context === "protein" ? "🥩" : "🥗",
    tone: coach.description,
  }
}

export function generateMealAdvice(
  personality: keyof typeof COACH_PERSONALITIES,
  proteinIntake: number,
  proteinGoal: number,
  mood: string,
): string {
  const proteinRatio = proteinIntake / proteinGoal

  if (proteinRatio < 0.7) {
    const response = getCoachResponse(personality, "protein")
    return response.message
  }

  if (mood === "stressed") {
    const advice = {
      drill_sergeant: "Stressed? Push through it. Fuel up with easy foods and get back to work.",
      zen_master: "Stress is temporary. Nourish yourself with gentle, comforting foods.",
      cheerleader: "You're handling stress like a champ! Treat yourself to a delicious, healthy meal!",
      sage: "The mind troubles itself more than the body. Eat simple, stay focused.",
    }
    return advice[personality]
  }

  if (mood === "high-energy") {
    const advice = {
      drill_sergeant: "That's the energy! Channel it. Fuel up for performance.",
      zen_master: "Beautiful energy. Harness it mindfully with nourishing foods.",
      cheerleader: "YES! That energy is CONTAGIOUS! Fuel it with awesomeness!",
      sage: "Strike while the iron is hot. Feed this energy wisely.",
    }
    return advice[personality]
  }

  return getCoachResponse(personality, "motivation").message
}
