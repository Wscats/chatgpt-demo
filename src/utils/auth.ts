import { sha256 } from 'js-sha256'

/** Payload for request signature generation and verification. */
interface AuthPayload {
  /** Timestamp of the request. */
  t: number
  /** Last message content. */
  m: string
}

/**
 * Compute SHA-256 hash of a message.
 * Uses Web Crypto API when available, falls back to js-sha256.
 */
async function digestMessage(message: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto?.subtle?.digest) {
    const msgUint8 = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  return sha256(message).toString()
}

/** Generate a SHA-256 signature for the given auth payload. */
export const generateSignature = async(payload: AuthPayload): Promise<string> => {
  const { t: timestamp, m: lastMessage } = payload
  const secretKey = import.meta.env.PUBLIC_SECRET_KEY as string
  const signText = `${timestamp}:${lastMessage}:${secretKey}`
  return digestMessage(signText)
}

/** Verify that a signature matches the expected hash for the given payload. */
export const verifySignature = async(payload: AuthPayload, sign: string): Promise<boolean> => {
  const payloadSign = await generateSignature(payload)
  return payloadSign === sign
}
