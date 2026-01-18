// Mock food database - in production, connect to USDA FoodData Central or similar
export const SAMPLE_FOODS = [
  {
    name: "Chicken Breast",
    brand: "Generic",
    calories_per_serving: 165,
    protein_grams: 31,
    carbs_grams: 0,
    fat_grams: 3.6,
    fiber_grams: 0,
    serving_size_grams: 100,
    serving_unit: "grams",
    upf_score: 1,
    upf_category: "unprocessed",
    barcode: "chicken_breast_100g",
  },
  {
    name: "Banana",
    brand: "Generic",
    calories_per_serving: 89,
    protein_grams: 1.1,
    carbs_grams: 23,
    fat_grams: 0.3,
    fiber_grams: 2.6,
    serving_size_grams: 100,
    serving_unit: "grams",
    upf_score: 1,
    upf_category: "unprocessed",
    barcode: "banana_100g",
  },
  {
    name: "Protein Bar",
    brand: "Quest",
    calories_per_serving: 170,
    protein_grams: 20,
    carbs_grams: 8,
    fat_grams: 9,
    fiber_grams: 6,
    serving_size_grams: 60,
    serving_unit: "bar",
    upf_score: 3,
    upf_category: "ultra_processed",
    barcode: "quest_bar_60g",
  },
]

export const UPF_INFO = {
  1: { name: "Unprocessed", color: "green", description: "Natural foods with minimal processing" },
  2: { name: "Processed", color: "yellow", description: "Foods with added oils, sugar, or salt" },
  3: { name: "Ultra-Processed", color: "orange", description: "Foods with artificial additives" },
  4: { name: "Highly Ultra-Processed", color: "red", description: "Foods designed to be hyper-palatable" },
}

export const SERVING_CONVERSIONS = {
  grams: 1,
  ounces: 28.3495,
  pounds: 453.592,
  cups: 240,
  tablespoons: 15,
  teaspoons: 5,
}

export function convertServingSize(amount: number, fromUnit: string, toUnit: string, foodWeight = 100): number {
  if (fromUnit === toUnit) return amount
  if (fromUnit === "grams" && toUnit in SERVING_CONVERSIONS) {
    return amount / (SERVING_CONVERSIONS[toUnit as keyof typeof SERVING_CONVERSIONS] || 1)
  }
  if (toUnit === "grams" && fromUnit in SERVING_CONVERSIONS) {
    return amount * (SERVING_CONVERSIONS[fromUnit as keyof typeof SERVING_CONVERSIONS] || 1)
  }
  return amount
}
