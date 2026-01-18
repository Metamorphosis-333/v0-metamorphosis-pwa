export const philosophicalQuotes = [
  {
    text: "The obstacle is the way. Your body is just really committed to the bit.",
    author: "Marcus Aurelius (but make it gym)",
  },
  {
    text: "We suffer more often in imagination than in reality. Like that burpee you're dreading.",
    author: "Seneca",
  },
  {
    text: "Discipline is choosing between what you want now and what you want most. Usually protein.",
    author: "Ancient Wisdom",
  },
  {
    text: "The only way out is through. Preferably through the squat rack.",
    author: "Robert Frost (Gains Edition)",
  },
  {
    text: "Change is the only constant. Especially your weight. That's why we track it.",
    author: "Heraclitus",
  },
  {
    text: "Know thyself. Including your macros.",
    author: "Socrates",
  },
  {
    text: "What doesn't kill you makes you stronger. Rest days included.",
    author: "Nietzsche",
  },
  {
    text: "The journey of a thousand miles begins with meal prep Sunday.",
    author: "Lao Tzu",
  },
  {
    text: "You cannot step into the same river twice. But you can hit the same PR twice.",
    author: "Heraclitus",
  },
  {
    text: "I think, therefore I am... sore tomorrow.",
    author: "Descartes (Bro Science)",
  },
  {
    text: "Comparison is the thief of joy. Also terrible math.",
    author: "Theodore Roosevelt",
  },
  {
    text: "Excellence is not a gift but a skill that takes practice. Especially meal prep.",
    author: "Plato",
  },
  {
    text: "He who has a why can bear almost any how. Even leg day.",
    author: "Viktor Frankl",
  },
  {
    text: "The unexamined life is not worth living. Also, log your macros.",
    author: "Socrates",
  },
  {
    text: "In the midst of winter, I found there was, within me, an invincible summer. And protein powder.",
    author: "Albert Camus",
  },
]

export function getRandomQuote() {
  return philosophicalQuotes[Math.floor(Math.random() * philosophicalQuotes.length)]
}
