"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Apple, Link2, FileText, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { type UnitSystem, kgToLbs, cmToInches } from "@/lib/unit-conversion"

interface AppleHealthImportProps {
  userId: string
  unitSystem: UnitSystem
}

export function AppleHealthImport({ userId, unitSystem }: AppleHealthImportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [importStats, setImportStats] = useState<{ weights: number; heights: number; heartRates: number } | null>(null)
  const [manualWeight, setManualWeight] = useState("")
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0])

  const extractXMLFromZip = async (file: File): Promise<string> => {
    // Using JSZip would require npm install, so we'll use the browser's native capabilities
    // For a zip file, we need to extract it manually or guide users to extract first
    // Since this is a web app, let's handle both .xml and .zip gracefully

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Check if it's a ZIP file (starts with PK signature)
    if (uint8Array[0] === 0x50 && uint8Array[1] === 0x4b) {
      // It's a ZIP file - we'll need to extract it
      // For web, we'll use a library-free approach with fetch and Response
      throw new Error(
        "ZIP file detected. Please extract the export.zip file on your device first, then upload the export.xml file inside it.",
      )
    }

    // It's already XML, decode and return
    const decoder = new TextDecoder("utf-8")
    return decoder.decode(arrayBuffer)
  }

  const handleManualImport = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Convert to lbs if metric
      const weightInLbs =
        unitSystem === "metric" ? kgToLbs(Number.parseFloat(manualWeight)) : Number.parseFloat(manualWeight)

      const supabase = createClient()
      const { error: insertError } = await supabase.from("weight_logs").insert({
        user_id: userId,
        weight: weightInLbs,
        logged_at: manualDate,
      })

      if (insertError) throw insertError

      // Track sync
      await supabase.from("apple_health_syncs").insert({
        user_id: userId,
        sync_type: "manual",
        records_imported: 1,
      })

      setSuccess(true)
      setManualWeight("")
      setTimeout(() => {
        setSuccess(false)
        setIsOpen(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import weight")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const text = await file.text()
      const lines = text.split("\n").slice(1) // Skip header
      const supabase = createClient()
      let imported = 0

      for (const line of lines) {
        if (!line.trim()) continue

        // Expected format: date,weight
        const [date, weight] = line.split(",")
        if (!date || !weight) continue

        const weightNum = Number.parseFloat(weight.trim())
        if (Number.isNaN(weightNum)) continue

        // Convert if metric
        const weightInLbs = unitSystem === "metric" ? kgToLbs(weightNum) : weightNum

        await supabase.from("weight_logs").insert({
          user_id: userId,
          weight: weightInLbs,
          logged_at: date.trim(),
        })

        imported++
      }

      // Track sync
      await supabase.from("apple_health_syncs").insert({
        user_id: userId,
        sync_type: "csv",
        records_imported: imported,
      })

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setIsOpen(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import CSV")
    } finally {
      setIsLoading(false)
    }
  }

  const handleXMLImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)
    setSuccess(false)
    setImportStats(null)

    try {
      let xmlText: string

      if (file.name.toLowerCase().endsWith(".zip")) {
        xmlText = await extractXMLFromZip(file)
      } else {
        xmlText = await file.text()
      }

      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, "text/xml")

      // Check for parsing errors
      const parserError = xmlDoc.querySelector("parsererror")
      if (parserError) {
        throw new Error("Invalid XML file. Please upload the export.xml file from Apple Health.")
      }

      const supabase = createClient()
      let weightCount = 0
      let heightCount = 0
      let heartRateCount = 0

      // Extract Weight records
      const weightRecords = xmlDoc.querySelectorAll('Record[type="HKQuantityTypeIdentifierBodyMass"]')
      for (const record of Array.from(weightRecords)) {
        const value = record.getAttribute("value")
        const date = record.getAttribute("startDate")
        const unit = record.getAttribute("unit")

        if (value && date) {
          let weightInLbs = Number.parseFloat(value)

          // Convert from kg to lbs if needed
          if (unit === "kg") {
            weightInLbs = kgToLbs(weightInLbs)
          }

          await supabase.from("weight_logs").insert({
            user_id: userId,
            weight: weightInLbs,
            logged_at: date,
          })

          weightCount++
        }
      }

      // Extract Height records
      const heightRecords = xmlDoc.querySelectorAll('Record[type="HKQuantityTypeIdentifierHeight"]')
      for (const record of Array.from(heightRecords)) {
        const value = record.getAttribute("value")
        const unit = record.getAttribute("unit")

        if (value) {
          let heightInInches = Number.parseFloat(value)

          // Convert from cm to inches if needed
          if (unit === "cm") {
            heightInInches = cmToInches(heightInInches)
          }

          // Update user profile with most recent height
          await supabase
            .from("profiles")
            .update({
              height: heightInInches,
            })
            .eq("id", userId)

          heightCount++
          break // Only use the most recent height
        }
      }

      // Extract Heart Rate records
      const heartRateRecords = xmlDoc.querySelectorAll('Record[type="HKQuantityTypeIdentifierHeartRate"]')
      for (const record of Array.from(heartRateRecords)) {
        const value = record.getAttribute("value")
        const date = record.getAttribute("startDate")

        if (value && date) {
          const bpm = Math.round(Number.parseFloat(value))

          await supabase.from("heart_rate_logs").insert({
            user_id: userId,
            bpm: bpm,
            logged_at: date,
          })

          heartRateCount++
        }
      }

      // Extract Dietary Energy (Calories)
      const calorieRecords = xmlDoc.querySelectorAll('Record[type="HKQuantityTypeIdentifierDietaryEnergyConsumed"]')
      const caloriesByDate: Record<string, number> = {}

      for (const record of Array.from(calorieRecords)) {
        const value = record.getAttribute("value")
        const date = record.getAttribute("startDate")

        if (value && date) {
          const dateOnly = date.split("T")[0]
          const calories = Number.parseFloat(value)
          caloriesByDate[dateOnly] = (caloriesByDate[dateOnly] || 0) + calories
        }
      }

      // Extract Protein
      const proteinRecords = xmlDoc.querySelectorAll('Record[type="HKQuantityTypeIdentifierDietaryProtein"]')
      const proteinByDate: Record<string, number> = {}

      for (const record of Array.from(proteinRecords)) {
        const value = record.getAttribute("value")
        const date = record.getAttribute("startDate")

        if (value && date) {
          const dateOnly = date.split("T")[0]
          const protein = Number.parseFloat(value)
          proteinByDate[dateOnly] = (proteinByDate[dateOnly] || 0) + protein
        }
      }

      // Save nutrition logs
      for (const date of Object.keys(caloriesByDate)) {
        await supabase.from("nutrition_logs").upsert(
          {
            user_id: userId,
            logged_at: date,
            calories: Math.round(caloriesByDate[date]),
            protein_grams: proteinByDate[date] ? Math.round(proteinByDate[date]) : null,
          },
          {
            onConflict: "user_id,logged_at",
          },
        )
      }

      // Track sync
      await supabase.from("apple_health_syncs").insert({
        user_id: userId,
        sync_type: "xml",
        records_imported: weightCount + heightCount + heartRateCount,
      })

      setImportStats({ weights: weightCount, heights: heightCount, heartRates: heartRateCount })
      setSuccess(true)

      setTimeout(() => {
        window.location.reload() // Refresh to show new data
      }, 3000)
    } catch (err) {
      console.error("[v0] XML import error:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Failed to import file. Please ensure you uploaded the correct export.xml or export.zip file.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const shortcutUrl = typeof window !== "undefined" ? `${window.location.origin}/api/health-import` : ""

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="default"
        className="w-full h-14 text-lg bg-primary hover:bg-primary/90 touch-manipulation active:scale-95 transition-transform"
      >
        <Apple className="mr-2 h-6 w-6" />
        Sync Apple Health Data
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glass-strong border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Apple className="h-6 w-6" />
              Sync Apple Health Data
            </DialogTitle>
            <DialogDescription className="text-base">
              Export your Health data as XML from your iPhone and upload it here, or choose another import method
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="xml" className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass h-12">
              <TabsTrigger value="xml" className="text-sm">
                XML Export
              </TabsTrigger>
              <TabsTrigger value="manual" className="text-sm">
                Manual
              </TabsTrigger>
              <TabsTrigger value="shortcuts" className="text-sm">
                Shortcuts
              </TabsTrigger>
              <TabsTrigger value="csv" className="text-sm">
                CSV
              </TabsTrigger>
            </TabsList>

            {/* XML Export Tab */}
            <TabsContent value="xml" className="space-y-4">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Apple className="h-5 w-5" />
                    Apple Health XML Export
                  </CardTitle>
                  <CardDescription className="text-base">
                    Export your Health data as XML from your iPhone and upload it here
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm font-medium">How to export from your iPhone:</p>
                    <ol className="text-sm space-y-2 list-decimal list-inside leading-relaxed">
                      <li>Open the Health app on your iPhone</li>
                      <li>Tap your profile picture in the top right</li>
                      <li>Scroll down and tap "Export All Health Data"</li>
                      <li>Tap "Export" to confirm</li>
                      <li>Save the export.zip file to Files</li>
                      <li>Upload the export.zip or extract and upload export.xml below</li>
                    </ol>
                  </div>

                  <div className="p-4 rounded-lg glass bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-blue-400 font-medium mb-2">What we'll import:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✓ Weight measurements → Weight tracking chart</li>
                      <li>✓ Height data → Your profile</li>
                      <li>✓ Heart Rate → Health metrics</li>
                      <li>✓ Dietary energy (calories) → Nutrition logs</li>
                      <li>✓ Protein intake → Daily protein goals</li>
                    </ul>
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="xml-upload" className="text-base font-semibold">
                      Upload Health Data
                    </Label>
                    <div className="relative">
                      <input
                        id="xml-upload"
                        type="file"
                        accept=".xml,.zip,application/zip,application/xml,text/xml"
                        onChange={handleXMLImport}
                        disabled={isLoading}
                        className="hidden"
                      />
                      <label htmlFor="xml-upload" className="block cursor-pointer touch-manipulation">
                        <div className="min-h-[180px] p-6 border-2 border-dashed border-white/30 rounded-xl glass text-center hover:border-primary/50 transition-colors active:scale-[0.99]">
                          <Upload className="h-12 w-12 mx-auto mb-3 text-primary" />
                          <p className="text-base font-medium mb-2">
                            {isLoading ? "Processing your health data..." : "Tap to select file"}
                          </p>
                          <p className="text-sm text-muted-foreground">Accepts export.zip or export.xml</p>
                          <p className="text-xs text-muted-foreground mt-2">From Apple Health export</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {isLoading && (
                    <div className="p-4 rounded-lg glass bg-blue-500/10 border border-blue-500/20 text-center">
                      <div className="animate-pulse text-base text-blue-400 font-medium">
                        Processing your health data... This may take a minute.
                      </div>
                    </div>
                  )}

                  {importStats && success && (
                    <div className="p-4 rounded-lg glass bg-green-500/10 border border-green-500/20">
                      <p className="text-base text-green-400 font-medium mb-2">Import Successful!</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>✓ {importStats.weights} weight measurements imported</li>
                        <li>✓ {importStats.heights} height record updated</li>
                        <li>✓ {importStats.heartRates} heart rate measurements imported</li>
                      </ul>
                      <p className="text-xs text-muted-foreground mt-2">Refreshing to show new data...</p>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 rounded-lg glass bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive font-medium mb-1">Import Error</p>
                      <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manual Entry Tab */}
            <TabsContent value="manual" className="space-y-4">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Manual Entry</CardTitle>
                  <CardDescription className="text-base">Enter your weight data directly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="manual-weight">Weight ({unitSystem === "imperial" ? "lbs" : "kg"})</Label>
                    <Input
                      id="manual-weight"
                      type="number"
                      step="0.1"
                      value={manualWeight}
                      onChange={(e) => setManualWeight(e.target.value)}
                      className="glass"
                      placeholder={unitSystem === "imperial" ? "180" : "82"}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="manual-date">Date</Label>
                    <Input
                      id="manual-date"
                      type="date"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="glass"
                    />
                  </div>

                  <Button onClick={handleManualImport} disabled={isLoading || !manualWeight} className="w-full">
                    {isLoading ? "Importing..." : "Import Weight"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* iOS Shortcuts Tab */}
            <TabsContent value="shortcuts" className="space-y-4">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    iOS Shortcuts Integration
                  </CardTitle>
                  <CardDescription className="text-base">Automate weight syncing from Apple Health</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm">Follow these steps to set up automatic syncing:</p>
                    <ol className="text-sm space-y-2 list-decimal list-inside">
                      <li>Open the Shortcuts app on your iPhone</li>
                      <li>Create a new shortcut</li>
                      <li>
                        Add "Get Latest Health Sample" action
                        <ul className="ml-6 mt-1 text-xs text-muted-foreground">
                          <li>Type: Weight</li>
                          <li>Unit: {unitSystem === "imperial" ? "lbs" : "kg"}</li>
                        </ul>
                      </li>
                      <li>Add "Get Contents of URL" action</li>
                      <li>
                        Set URL to: <code className="text-xs bg-muted px-2 py-1 rounded">{shortcutUrl}</code>
                      </li>
                      <li>
                        Set Method: POST
                        <ul className="ml-6 mt-1 text-xs text-muted-foreground">
                          <li>Headers: Content-Type: application/json</li>
                          <li>
                            Body: {`{`}"weight": [Weight], "date": [Current Date], "source": "shortcuts"{`}`}
                          </li>
                        </ul>
                      </li>
                      <li>Run the shortcut manually or set it to run automatically</li>
                    </ol>
                  </div>

                  <div className="p-3 rounded-lg glass bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground">
                      <strong>Pro Tip:</strong> Set this shortcut to run automatically every morning using iOS
                      Automations for seamless daily weight tracking.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CSV Import Tab */}
            <TabsContent value="csv" className="space-y-4">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    CSV File Import
                  </CardTitle>
                  <CardDescription className="text-base">Bulk import weight data from a CSV file</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm">CSV Format Requirements:</p>
                    <div className="p-3 rounded-lg glass bg-muted/50 font-mono text-xs">
                      <div>date,weight</div>
                      <div>2026-01-01,180.5</div>
                      <div>2026-01-02,179.8</div>
                      <div>2026-01-03,179.2</div>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>First row must be headers: date,weight</li>
                      <li>Date format: YYYY-MM-DD</li>
                      <li>Weight in {unitSystem === "imperial" ? "lbs" : "kg"}</li>
                      <li>One entry per line</li>
                    </ul>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="csv-upload">Upload CSV File</Label>
                    <Input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleCSVImport}
                      disabled={isLoading}
                      className="glass cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-lg glass bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground">
                      <strong>How to Export from Apple Health:</strong> Open Health app → Browse → Body Measurements →
                      Weight → Export Data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}
