"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, X, Search } from "lucide-react"

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanning, setScanning] = useState(false)
  const [manualBarcode, setManualBarcode] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!scanning) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        setError("Unable to access camera. Please check permissions.")
        setScanning(false)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [scanning])

  const handleManualBarcode = () => {
    if (manualBarcode.trim()) {
      onScan(manualBarcode)
      setManualBarcode("")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-md">
        {scanning ? (
          <div className="space-y-4 p-6">
            <div className="relative bg-black rounded-lg overflow-hidden h-64">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-green-500 rounded-lg opacity-50" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-400">Can't scan? Enter barcode manually:</p>
              <div className="flex gap-2">
                <Input
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualBarcode()}
                  placeholder="1234567890"
                  className="bg-slate-800 border-slate-600"
                  autoFocus
                />
                <Button onClick={handleManualBarcode} size="sm">
                  <Search size={16} />
                </Button>
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button onClick={() => setScanning(false)} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <Camera className="h-12 w-12 mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-400">Scan food barcode or enter manually</p>
            </div>

            <div className="space-y-2">
              <Input
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualBarcode()}
                placeholder="Enter barcode..."
                className="bg-slate-800 border-slate-600"
              />
              <Button onClick={handleManualBarcode} className="w-full">
                Search Barcode
              </Button>
            </div>

            <Button onClick={() => setScanning(true)} variant="outline" className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              Scan with Camera
            </Button>

            <Button onClick={onClose} variant="ghost" className="w-full">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
