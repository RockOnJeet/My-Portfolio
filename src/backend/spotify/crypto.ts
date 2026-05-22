const encoder = new TextEncoder();
const decoder = new TextDecoder();
const SALT = "spotify-token-key-salt-v1";
const IV_LENGTH = 12;

function base64Encode(bytes: Uint8Array) {
  if (typeof btoa === "function") {
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  return Buffer.from(bytes).toString("base64");
}

function base64Decode(value: string) {
  const normalized = normalizeBase64(value);

  if (typeof atob === "function") {
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  return new Uint8Array(Buffer.from(normalized, "base64"));
}

function normalizeBase64(value: string) {
  const trimmed = value.trim();
  const withoutQuotes =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;

  const compact = withoutQuotes.replace(/\s+/g, "");
  const standardBase64 = compact.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = standardBase64.length % 4;

  if (remainder === 0) {
    return standardBase64;
  }

  return `${standardBase64}${"=".repeat(4 - remainder)}`;
}

async function getWebCrypto() {
  if (typeof crypto !== "undefined" && "subtle" in crypto) {
    return crypto as Crypto;
  }

  const nodeCrypto = await import("node:crypto");
  return nodeCrypto.webcrypto;
}

export async function deriveKey(secret: string) {
  const webCrypto = await getWebCrypto();
  const subtle = (webCrypto as unknown as Crypto).subtle as SubtleCrypto;
  const baseKey = await subtle.importKey(
    "raw",
    encoder.encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(SALT),
      iterations: 100000,
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptToken(token: string, secret: string) {
  const webCrypto = await getWebCrypto();
  const subtle = (webCrypto as unknown as Crypto).subtle as SubtleCrypto;
  const key = (await deriveKey(secret)) as CryptoKey;
  const iv = (webCrypto as unknown as Crypto).getRandomValues(new Uint8Array(IV_LENGTH));
  const cipherBuffer = await subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(token),
  );

  return `${base64Encode(iv)}.${base64Encode(new Uint8Array(cipherBuffer))}`;
}

export async function decryptToken(encrypted: string, secret: string) {
  const webCrypto = await getWebCrypto();
  const subtle = (webCrypto as unknown as Crypto).subtle as SubtleCrypto;
  const [ivBase64, cipherBase64] = encrypted.split(".");

  if (!ivBase64 || !cipherBase64) {
    throw new Error("Invalid encrypted token format. Expected '<iv>.<cipher>'.");
  }

  const iv = base64Decode(ivBase64);
  const cipher = base64Decode(cipherBase64);
  const key = (await deriveKey(secret)) as CryptoKey;
  const plainBuffer = await subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipher,
  );

  return decoder.decode(plainBuffer);
}
