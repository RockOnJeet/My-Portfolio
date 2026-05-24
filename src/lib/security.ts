// Minimal client-side encryption helpers for anonymized message storage.
// NOTE: This is not a substitute for server-side security, but it makes stored
// messages unreadable without the session key.

function toBase64(bytes: Uint8Array) {
  let binary = ""
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

function fromBase64(base64: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function generateSessionKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  )
}

export async function exportSessionKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key)
  return toBase64(new Uint8Array(raw))
}

export async function importSessionKey(base64Key: string): Promise<CryptoKey> {
  const raw = fromBase64(base64Key)
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"],
  )
}

export async function encryptMessage(
  key: CryptoKey,
  message: string,
): Promise<{ iv: string; data: string }> {
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(message),
  )
  return { iv: toBase64(iv), data: toBase64(new Uint8Array(ciphertext)) }
}

export async function decryptMessage(
  key: CryptoKey,
  ivBase64: string,
  dataBase64: string,
): Promise<string | null> {
  try {
    const iv = fromBase64(ivBase64)
    const data = fromBase64(dataBase64)
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data,
    )
    return new TextDecoder().decode(decrypted)
  } catch {
    return null
  }
}

const SAFE_EXTERNAL_PROTOCOLS = new Set(["http:", "https:"])

/**
 * Returns a normalized URL string when the input is a safe absolute http(s) URL.
 * Returns null for empty, malformed, relative, or non-http(s) values.
 */
export function safeExternalUrl(raw: string): string | null {
  const candidate = raw.trim()
  if (!candidate) return null

  try {
    const url = new URL(candidate)
    if (!SAFE_EXTERNAL_PROTOCOLS.has(url.protocol)) return null
    return url.toString()
  } catch {
    return null
  }
}

/**
 * Returns a safe mailto href for a basic email address, otherwise null.
 */
export function safeMailtoHref(rawEmail: string): string | null {
  const email = rawEmail.trim()
  if (!email) return null

  const hasControlChars = /[\r\n\u0000-\u001F\u007F]/.test(email)
  if (hasControlChars) return null

  const isBasicEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!isBasicEmail) return null

  return `mailto:${email}`
}

/**
 * Sanitize free-form user input for safe storage/display:
 * - strips HTML tags
 * - removes control characters (optionally allowing newlines)
 * - collapses excessive whitespace
 * - enforces an optional max length
 */
export function sanitizeUserText(
  raw: string,
  options?: { allowNewlines?: boolean; maxLen?: number }
): string {
  const allowNewlines = options?.allowNewlines ?? false;
  const maxLen = options?.maxLen ?? Infinity;

  let s = raw.replace(/\u0000/g, "");

  // Remove HTML tags (basic) to avoid accidental HTML injection
  s = s.replace(/<[^>]*>/g, "");

  // Remove control chars except optional newlines
  if (allowNewlines) {
    s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g, "");
  } else {
    s = s.replace(/[\x00-\x1F\x7F]+/g, " ");
  }

  // Normalize line endings and collapse multiple whitespace characters
  if (allowNewlines) {
    s = s.replace(/\r\n?/g, "\n");
    s = s.replace(/[ \t\f\v]+/g, " ");
    // collapse multiple newlines to max two
    s = s.replace(/\n{3,}/g, "\n\n");
  } else {
    s = s.replace(/\s+/g, " ");
  }

  s = s.trim();

  if (s.length > maxLen) {
    s = s.slice(0, maxLen);
  }

  return s;
}
