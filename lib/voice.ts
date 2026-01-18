export class VoiceInput {
  private recognition: any
  private isListening = false
  private abortTimeout: NodeJS.Timeout | null = null

  constructor() {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      this.recognition = new (window as any).webkitSpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = "en-US"
    }
  }

  start(onResult: (transcript: string) => void, onError?: (error: string) => void) {
    if (!this.recognition) {
      onError?.("Speech recognition not supported in this browser")
      return
    }

    // Clear any existing timeout
    if (this.abortTimeout) {
      clearTimeout(this.abortTimeout)
    }

    this.recognition.onresult = (event: any) => {
      if (this.abortTimeout) clearTimeout(this.abortTimeout)
      const transcript = event.results[0]?.[0]?.transcript || ""
      if (transcript) {
        onResult(transcript)
      }
      this.isListening = false
    }

    this.recognition.onerror = (event: any) => {
      if (this.abortTimeout) clearTimeout(this.abortTimeout)
      // Only report errors that are not "aborted" (which happens on normal stop)
      if (event.error !== "aborted") {
        // Provide user-friendly error messages
        const errorMessages: Record<string, string> = {
          network: "Voice recognition requires internet connection. Please type instead.",
          "not-allowed": "Microphone access denied. Please enable microphone permissions.",
          "no-speech": "No speech detected. Please try again.",
          "audio-capture": "No microphone found. Please check your device.",
          "service-not-allowed": "Voice service not available. Please type instead.",
        }
        const friendlyMessage = errorMessages[event.error] || `Voice error: ${event.error}`
        onError?.(friendlyMessage)
      }
      this.isListening = false
    }

    this.recognition.onend = () => {
      if (this.abortTimeout) clearTimeout(this.abortTimeout)
      this.isListening = false
    }

    try {
      this.recognition.start()
      this.isListening = true
      // Auto-stop after 10 seconds to prevent long listening sessions
      this.abortTimeout = setTimeout(() => {
        this.stop()
      }, 10000)
    } catch (error) {
      if (this.abortTimeout) clearTimeout(this.abortTimeout)
      onError?.("Failed to start voice recognition")
    }
  }

  stop() {
    if (this.abortTimeout) {
      clearTimeout(this.abortTimeout)
      this.abortTimeout = null
    }
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop()
      } catch (error) {
        console.error("[v0] Error stopping recognition:", error)
      }
      this.isListening = false
    }
  }

  getIsListening() {
    return this.isListening
  }
}
