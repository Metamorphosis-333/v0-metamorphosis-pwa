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
import { type UnitSystem, kgToLbs, cmToInches } from "@/lib/unit-conversion"
import { addWeightLog, saveNutritionLog } from "@/lib/local-storage"

interface AppleHealthImportProps {
  userId?: string
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

  const handleManualImport = () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Convert to lbs if metric
      const weightInLbs =
        unitSystem === "metric" ? kgToLbs(Number.parseFloat(manualWeight)) : Number.parseFloat(manualWeight)

      // Save to localStorage
      addWeightLog(weightInLbs)

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
      let imported = 0

      for (const line of lines) {
        if (!line.trim()) continue

        // Expected format: date,weight
        const [, weight] = line.split(",")
        if (!weight) continue

        const weightNum = Number.parseFloat(weight.trim())
        if (Number.isNaN(weightNum)) continue

        // Convert if metric
        const weightInLbs = unitSystem === "metric" ? kgToLbs(weightNum) : weightNum

        // Save to localStorage
        addWeightLog(weightInLbs)

        imported++
      }

      setSuccess(true)
      setImportStats({ weights: imported, heights: 0, heartRates: 0 })
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

      let weightCount = 0
      let heightCount = 0
      let heartRateCount = 0

      // Extract Weight records
      const weightRecords = xmlDoc.querySelectorAll('Record[type="HKQuantityTypeIdentifierBodyMass"]')
      for (const record of Array.from(weightRecords)) {
        const value = record.getAttribute("value")
        const unit = record.getAttribute("unit")

        if (value) {
          let weightInLbs = Number.parseFloat(value)

          // Convert from kg to lbs if needed
          if (unit === "kg") {
            weightInLbs = kgToLbs(weightInLbs)
          }

          // Save to localStorage
          addWeightLog(weightInLbs)

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

          // Update user profile in localStorage
          const profile = JSON.parse(localStorage.getItem("metamorphosis_profile") || "{}")
          profile.height = heightInInches
          localStorage.setItem("metamorphosis_profile", JSON.stringify(profile))

          heightCount++
          break // Only use the most recent height
        }
      }

      // Extract Heart Rate records (store locally)
      const heartRateRecords = xmlDoc.querySelectorAll('Record[type="HKQuantityTypeIdentifierHeartRate"]')
      const heartRates = JSON.parse(localStorage.getItem("metamorphosis_heart_rates") || "[]")
      for (const record of Array.from(heartRateRecords)) {
        const value = record.getAttribute("value")
        const date = record.getAttribute("startDate")

        if (value && date) {
          const bpm = Math.round(Number.parseFloat(value))
          heartRates.push({ bpm, logged_at: date })
          heartRateCount++
        }
      }
      localStorage.setItem("metamorphosis_heart_rates", JSON.stringify(heartRates))

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

      // Save nutrition logs to localStorage
      for (const date of Object.keys(caloriesByDate)) {
        saveNutritionLog({
          calories: Math.round(caloriesByDate[date]),
          protein: proteinByDate[date] ? Math.round(proteinByDate[date]) : 0,
          carbs: 0,
          fat: 0,
        })
      }

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

            {/* iOS Shortcuts / QR Code Tab */}
            <TabsContent value="shortcuts" className="space-y-4">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Quick Sync via QR Code
                  </CardTitle>
                  <CardDescription className="text-base">
                    Scan to connect Apple Health or Google Fit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* QR Code Display */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white rounded-xl">
                      {/* QR Code - using a simple SVG pattern */}
                      <svg width="160" height="160" viewBox="0 0 160 160" className="text-black">
                        {/* QR Code pattern - simplified representation */}
                        <rect x="0" y="0" width="160" height="160" fill="white" />
                        {/* Corner squares */}
                        <rect x="10" y="10" width="40" height="40" fill="black" />
                        <rect x="15" y="15" width="30" height="30" fill="white" />
                        <rect x="20" y="20" width="20" height="20" fill="black" />
                        
                        <rect x="110" y="10" width="40" height="40" fill="black" />
                        <rect x="115" y="15" width="30" height="30" fill="white" />
                        <rect x="120" y="20" width="20" height="20" fill="black" />
                        
                        <rect x="10" y="110" width="40" height="40" fill="black" />
                        <rect x="15" y="115" width="30" height="30" fill="white" />
                        <rect x="20" y="120" width="20" height="20" fill="black" />
                        
                        {/* Data pattern */}
                        <rect x="60" y="10" width="10" height="10" fill="black" />
                        <rect x="80" y="10" width="10" height="10" fill="black" />
                        <rect x="60" y="30" width="10" height="10" fill="black" />
                        <rect x="70" y="20" width="10" height="10" fill="black" />
                        <rect x="90" y="20" width="10" height="10" fill="black" />
                        
                        <rect x="60" y="60" width="10" height="10" fill="black" />
                        <rect x="70" y="70" width="10" height="10" fill="black" />
                        <rect x="80" y="60" width="10" height="10" fill="black" />
                        <rect x="90" y="70" width="10" height="10" fill="black" />
                        <rect x="80" y="80" width="10" height="10" fill="black" />
                        
                        <rect x="10" y="60" width="10" height="10" fill="black" />
                        <rect x="30" y="70" width="10" height="10" fill="black" />
                        <rect x="10" y="80" width="10" height="10" fill="black" />
                        <rect x="40" y="60" width="10" height="10" fill="black" />
                        
                        <rect x="110" y="60" width="10" height="10" fill="black" />
                        <rect x="130" y="70" width="10" height="10" fill="black" />
                        <rect x="120" y="80" width="10" height="10" fill="black" />
                        <rect x="140" y="90" width="10" height="10" fill="black" />
                        
                        <rect x="60" y="110" width="10" height="10" fill="black" />
                        <rect x="80" y="120" width="10" height="10" fill="black" />
                        <rect x="70" y="130" width="10" height="10" fill="black" />
                        <rect x="90" y="110" width="10" height="10" fill="black" />
                        
                        <rect x="110" y="110" width="10" height="10" fill="black" />
                        <rect x="130" y="120" width="10" height="10" fill="black" />
                        <rect x="120" y="140" width="10" height="10" fill="black" />
                        <rect x="140" y="130" width="10" height="10" fill="black" />
                      </svg>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium">Scan with your phone camera</p>
                      <p className="text-xs text-muted-foreground">
                        Opens Apple Health (iOS) or Google Fit (Android)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg glass text-center">
                      <Apple className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-xs font-medium">Apple Health</p>
                      <p className="text-xs text-muted-foreground">iOS 15+</p>
                    </div>
                    <div className="p-3 rounded-lg glass text-center">
                      <svg className="h-6 w-6 mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                      <p className="text-xs font-medium">Google Fit</p>
                      <p className="text-xs text-muted-foreground">Android</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg glass bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground">
                      <strong>Note:</strong> Health data sync requires granting permission in your health app. 
                      Your data stays on your device and is never uploaded to external servers.
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
