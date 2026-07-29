const STATE_COOKIE_NAME = "oauth_github_state";
const STATE_TTL_SECONDS = 10 * 60;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function utf8(value: string): ArrayBuffer {
  return new TextEncoder().encode(value).buffer as ArrayBuffer;
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    utf8(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, utf8(value))));
}

function parseCookies(request: Request): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const part of (request.headers.get("Cookie") ?? "").split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    cookies.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
  }
  return cookies;
}

export async function createOAuthStateCookie(secret: string): Promise<{ state: string; cookie: string }> {
  const random = crypto.getRandomValues(new Uint8Array(32));
  const state = toBase64Url(random);
  const signature = await sign(state, secret);
  const value = `${state}.${signature}`;

  return {
    state,
    cookie: `${STATE_COOKIE_NAME}=${value}; Path=/oauth/github; Max-Age=${STATE_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`,
  };
}

export async function verifyOAuthState(
  request: Request,
  returnedState: string,
  secret: string,
): Promise<boolean> {
  const cookie = parseCookies(request).get(STATE_COOKIE_NAME);
  if (!cookie) return false;

  const separator = cookie.lastIndexOf(".");
  if (separator < 0) return false;
  const state = cookie.slice(0, separator);
  const signature = cookie.slice(separator + 1);
  if (state !== returnedState) return false;

  return signature === (await sign(state, secret));
}

export function clearOAuthStateCookie(): string {
  return `${STATE_COOKIE_NAME}=; Path=/oauth/github; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}
