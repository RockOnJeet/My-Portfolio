import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Decode a string encoded with window.btoa (base64). */
export function decodeBase64(input: string) {
  try {
    return decodeURIComponent(
      atob(input)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
  } catch {
    return ""
  }
}

/** Encode a string as base64 so it is not stored in plain text in source files. */
export function encodeBase64(input: string) {
  return btoa(
    encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p) =>
      String.fromCharCode(parseInt(p, 16))
    )
  )
}
