// Unit conversion utilities
export type UnitSystem = "imperial" | "metric"

export interface UnitLabels {
  weight: string
  height: string
}

export const getUnitLabels = (system: UnitSystem): UnitLabels => {
  return system === "imperial" ? { weight: "lbs", height: "inches" } : { weight: "kg", height: "cm" }
}

// Convert weight from lbs to kg
export const lbsToKg = (lbs: number): number => {
  return lbs * 0.453592
}

// Convert weight from kg to lbs
export const kgToLbs = (kg: number): number => {
  return kg * 2.20462
}

// Convert height from inches to cm
export const inchesToCm = (inches: number): number => {
  return inches * 2.54
}

// Convert height from cm to inches
export const cmToInches = (cm: number): number => {
  return cm / 2.54
}

// Format weight for display based on unit preference
export const formatWeight = (weight: number, system: UnitSystem): string => {
  const labels = getUnitLabels(system)
  if (system === "metric") {
    return `${lbsToKg(weight).toFixed(1)} ${labels.weight}`
  }
  return `${weight.toFixed(1)} ${labels.weight}`
}

// Format height for display based on unit preference
export const formatHeight = (height: number, system: UnitSystem): string => {
  const labels = getUnitLabels(system)
  if (system === "metric") {
    return `${inchesToCm(height).toFixed(0)} ${labels.height}`
  }
  return `${height.toFixed(0)} ${labels.height}`
}

// Get protein goal multiplier based on unit system
// Imperial: 0.8g per lb, Metric: 1.76g per kg (equivalent)
export const getProteinMultiplier = (system: UnitSystem): number => {
  return system === "imperial" ? 0.8 : 1.76
}
