export class VoiceInput {
  private recognition: any
  private isListening = false

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

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
      this.isListening = false
    }

    this.recognition.onerror = (event: any) => {
      onError?.(event.error)
      this.isListening = false
    }

    this.recognition.onend = () => {
      this.isListening = false
    }

    try {
      this.recognition.start()
      this.isListening = true
    } catch (error) {
      onError?.("Failed to start voice recognition")
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  getIsListening() {
    return this.isListening
  }
}
