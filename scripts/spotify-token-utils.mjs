#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { randomBytes, webcrypto } from "node:crypto";
import { resolve } from "node:path";

const SALT = "spotify-token-key-salt-v1";
const IV_LENGTH = 12;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function parseArgs(args) {
  const flags = {};
  const positional = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i += 1;
      } else {
        flags[key] = "true";
      }
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags };
}

async function loadDotEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env");
    const content = await readFile(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const equalsIndex = trimmed.indexOf("=");
      if (equalsIndex === -1) continue;
      const key = trimmed.slice(0, equalsIndex).trim();
      let value = trimmed.slice(equalsIndex + 1).trim();
      if ((value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
        process.env[key] = value;
      }
    }
  } catch {
    // ignore missing .env
  }
}

function normalizeBase64(value) {
  const trimmed = value.trim();
  const compact = trimmed.replace(/\s+/g, "");
  const standardBase64 = compact.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = standardBase64.length % 4;
  if (remainder === 0) {
    return standardBase64;
  }
  return `${standardBase64}${"=".repeat(4 - remainder)}`;
}

function base64Encode(bytes) {
  return Buffer.from(bytes).toString("base64");
}

function base64UrlEncode(bytes) {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function generateRandomString(length) {
  return randomBytes(length).toString("hex").slice(0, length);
}

function base64Decode(value) {
  return new Uint8Array(Buffer.from(normalizeBase64(value), "base64"));
}

async function sha256(input) {
  const data = encoder.encode(input);
  return new Uint8Array(await webcrypto.subtle.digest("SHA-256", data));
}

async function buildPkceChallenge(verifier) {
  return base64UrlEncode(await sha256(verifier));
}

function buildSpotifyAuthUrl({
  clientId,
  redirectUri,
  scope,
  state,
  codeChallenge,
}) {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope,
    state,
    show_dialog: "true",
  });

  if (codeChallenge) {
    params.set("code_challenge_method", "S256");
    params.set("code_challenge", codeChallenge);
  }

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function fetchSpotifyToken({
  code,
  redirectUri,
  clientId,
  clientSecret,
  codeVerifier,
}) {
  const tokenUrl = "https://accounts.spotify.com/api/token";
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
  });

  if (clientSecret) {
    const credentials = `${clientId}:${clientSecret}`;
    const auth = Buffer.from(credentials, "utf8").toString("base64");
    return fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: body.toString(),
    });
  }

  if (!codeVerifier) {
    throw new Error("PKCE mode requires --code-verifier when SPOTIFY_CLIENT_SECRET is not set.");
  }

  body.set("code_verifier", codeVerifier);

  return fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
}

async function deriveKey(secret) {
  const subtle = webcrypto.subtle;

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

export async function encryptToken(token, secret) {
  const key = await deriveKey(secret);
  const iv = randomBytes(IV_LENGTH);
  const cipherBuffer = await webcrypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(token),
  );

  return `${base64Encode(iv)}.${base64Encode(new Uint8Array(cipherBuffer))}`;
}

export async function decryptToken(encrypted, secret) {
  const [ivBase64, cipherBase64] = encrypted.split(".");

  if (!ivBase64 || !cipherBase64) {
    throw new Error("Invalid encrypted token format. Expected '<iv>.<cipher>'.");
  }

  const iv = base64Decode(ivBase64);
  const cipher = base64Decode(cipherBase64);
  const key = await deriveKey(secret);

  const plainBuffer = await webcrypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipher,
  );

  return decoder.decode(plainBuffer);
}

function printHelp() {
  console.log(`
Usage:
  node scripts/spotify-token-utils.mjs auth-url [--client-id <id>] [--redirect-uri <uri>] [--scope <scope>] [--state <state>] [--pkce]
  node scripts/spotify-token-utils.mjs exchange --code <code> [--client-id <id>] [--client-secret <secret>] [--redirect-uri <uri>] [--code-verifier <verifier>]
  node scripts/spotify-token-utils.mjs encrypt --token <refresh_token> --key <secret> [--out <path>] [--stdout]
  node scripts/spotify-token-utils.mjs decrypt --encrypted <value> --key <secret>

Options:
  --client-id        Spotify client ID (default from SPOTIFY_CLIENT_ID).
  --client-secret    Spotify client secret (default from SPOTIFY_CLIENT_SECRET).
  --redirect-uri     Spotify redirect URI (default from SPOTIFY_REDIRECT_URI).
  --scope            OAuth scopes separated by spaces.
  --state            Optional OAuth state value.
  --pkce             Force PKCE flow instead of client-secret auth.
  --code             Authorization code returned by Spotify.
  --code-verifier    PKCE code verifier used for token exchange.
  --token            Spotify refresh token to encrypt.
  --encrypted        Encrypted token string to decrypt.
  --key              Secret key used for encryption/decryption.
  --out              Output file path for encrypted token.
  --stdout           Print encrypted output to stdout instead of writing a file.
  --help             Show this help text.

Environment variables are also supported:
  SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI,
  SPOTIFY_REFRESH_TOKEN, SPOTIFY_TOKEN_KEY, SPOTIFY_TOKEN_ENCRYPTED

Default behavior:
  encrypt writes to scripts/spotify-token.encrypted when --out is omitted.
`);
}

async function main() {
  await loadDotEnv();
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const command = positional[0];

  if (!command || flags.help === "true") {
    printHelp();
    process.exit(0);
  }

  if (command === "auth-url") {
    const clientId = flags["client-id"] || process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = flags["redirect-uri"] || process.env.SPOTIFY_REDIRECT_URI;
    const scope = flags.scope || "user-read-playback-state user-read-currently-playing user-read-private";
    const state = flags.state || generateRandomString(16);
    const usePkce = flags.pkce === "true" || !process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !redirectUri) {
      console.error("Error: --client-id and --redirect-uri are required, or set SPOTIFY_CLIENT_ID and SPOTIFY_REDIRECT_URI.");
      process.exit(1);
    }

    let codeVerifier;
    let codeChallenge;

    if (usePkce) {
      codeVerifier = generateRandomString(96);
      codeChallenge = await buildPkceChallenge(codeVerifier);
    }

    const authUrl = buildSpotifyAuthUrl({
      clientId,
      redirectUri,
      scope,
      state,
      codeChallenge,
    });

    console.log("Open this URL in your browser:");
    console.log(authUrl);
    if (codeVerifier) {
      console.log("\nPKCE code_verifier (save this for exchange):");
      console.log(codeVerifier);
    }

    return;
  }

  if (command === "exchange") {
    const code = flags.code;
    const clientId = flags["client-id"] || process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = flags["client-secret"] || process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = flags["redirect-uri"] || process.env.SPOTIFY_REDIRECT_URI;
    const codeVerifier = flags["code-verifier"];

    if (!code || !clientId || !redirectUri) {
      console.error("Error: --code, --client-id, and --redirect-uri are required, or set SPOTIFY_CLIENT_ID and SPOTIFY_REDIRECT_URI.");
      process.exit(1);
    }

    const response = await fetchSpotifyToken({
      code,
      redirectUri,
      clientId,
      clientSecret,
      codeVerifier,
    });

    const body = await response.text();
    if (!response.ok) {
      console.error(`Token exchange failed: ${response.status} ${body}`);
      process.exit(1);
    }

    console.log(body);
    return;
  }

  if (command === "encrypt") {
    const token = flags.token || process.env.SPOTIFY_REFRESH_TOKEN;
    const key = flags.key || process.env.SPOTIFY_TOKEN_KEY;
    const output = flags.out || "scripts/spotify-token.encrypted";
    const stdout = flags.stdout === "true";

    if (!token || !key) {
      console.error("Error: --token and --key are required, or set SPOTIFY_REFRESH_TOKEN and SPOTIFY_TOKEN_KEY.");
      process.exit(1);
    }

    const encrypted = await encryptToken(token, key);

    if (stdout) {
      console.log(encrypted);
      return;
    }

    await writeFile(output, encrypted, "utf8");
    console.log(`Encrypted token written to ${output}`);
    return;
  }

  if (command === "decrypt") {
    const encrypted = flags.encrypted || process.env.SPOTIFY_TOKEN_ENCRYPTED;
    const key = flags.key || process.env.SPOTIFY_TOKEN_KEY;

    if (!encrypted || !key) {
      console.error("Error: --encrypted and --key are required, or set SPOTIFY_TOKEN_ENCRYPTED and SPOTIFY_TOKEN_KEY.");
      process.exit(1);
    }

    const decrypted = await decryptToken(encrypted, key);
    console.log(decrypted);
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

main().catch((error) => {
  console.error("Error:", error.message || error);
  process.exit(1);
});
