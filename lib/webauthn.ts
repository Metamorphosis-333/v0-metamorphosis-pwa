export interface PasskeyRegistrationOptions {
  userId: string
  userName: string
  userDisplayName: string
}

export interface PasskeyCredential {
  id: string
  user_id: string
  credential_id: string
  public_key: string
  counter: number
  transports?: string[]
  device_name?: string
}

// Convert ArrayBuffer to Base64 URL-safe string
export function bufferToBase64URLString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let str = ""
  for (const charCode of bytes) {
    str += String.fromCharCode(charCode)
  }
  const base64String = btoa(str)
  return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

// Convert Base64 URL-safe string to ArrayBuffer
export function base64URLStringToBuffer(base64URLString: string): ArrayBuffer {
  const base64 = base64URLString.replace(/-/g, "+").replace(/_/g, "/")
  const padLength = (4 - (base64.length % 4)) % 4
  const padded = base64.padEnd(base64.length + padLength, "=")
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

// Generate a random challenge
export function generateChallenge(): string {
  const buffer = new Uint8Array(32)
  crypto.getRandomValues(buffer)
  return bufferToBase64URLString(buffer)
}

// Check if browser supports WebAuthn
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === "function"
  )
}

// Check if platform authenticator is available (Face ID, Touch ID, Windows Hello)
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}
