"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { type UnitSystem, formatWeight } from "@/lib/unit-conversion"

interface WeightChartProps {
  data: Array<{
    weight: number
    logged_at: string
  }>
  unitSystem?: UnitSystem
}

export function WeightChart({ data, unitSystem = "imperial" }: WeightChartProps) {
  const chartData = data.map((log) => ({
    date: new Date(log.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weight: log.weight,
    displayWeight: formatWeight(log.weight, unitSystem),
  }))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Start logging your weight to see progress</p>
      </div>
    )
  }

  const weightLabel = unitSystem === "imperial" ? "Weight (lbs)" : "Weight (kg)"

  return (
    <ChartContainer
      config={{
        weight: {
          label: weightLabel,
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={["dataMin - 5", "dataMax + 5"]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="weight" stroke="var(--color-weight)" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
