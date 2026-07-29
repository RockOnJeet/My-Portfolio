export interface ClientMetadata {
  clientId: string;
  clientName: string | null;
  redirectUris: string[];
}

const MAX_METADATA_BYTES = 32 * 1024;
const FETCH_TIMEOUT_MS = 5_000;

function isForbiddenHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (host === "::1" || host === "[::1]") return true;
  const parts = host.split(".").map(Number);
  if (parts.length === 4 && parts.every(Number.isInteger)) {
    const [a, b] = parts;
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  return false;
}

function validateClientId(clientId: string): URL {
  const url = new URL(clientId);
  if (url.protocol !== "https:" || url.username || url.password || url.hash || isForbiddenHostname(url.hostname)) {
    throw new Error("Invalid CIMD client_id URL.");
  }
  return url;
}

export async function resolveClientMetadata(clientId: string): Promise<ClientMetadata> {
  const url = validateClientId(clientId);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      redirect: "error",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) throw new Error(`CIMD lookup failed with HTTP ${response.status}.`);
  const length = Number(response.headers.get("Content-Length") ?? 0);
  if (length > MAX_METADATA_BYTES) throw new Error("CIMD document is too large.");
  const text = await response.text();
  if (new TextEncoder().encode(text).byteLength > MAX_METADATA_BYTES) {
    throw new Error("CIMD document is too large.");
  }

  const data = JSON.parse(text) as Record<string, unknown>;
  if (data.client_id !== clientId) throw new Error("CIMD client_id does not match the requested client_id.");
  if (!Array.isArray(data.redirect_uris) || !data.redirect_uris.every((value) => typeof value === "string")) {
    throw new Error("CIMD redirect_uris is invalid.");
  }

  return {
    clientId,
    clientName: typeof data.client_name === "string" ? data.client_name : null,
    redirectUris: data.redirect_uris,
  };
}
