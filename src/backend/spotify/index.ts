import { decryptToken } from "./crypto";
import { fetchWithRetry } from "./fetch";
import type { SpotifyConsolePayload, SpotifyRefreshTokenResponse } from "./types";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

type EnvVars = Record<string, string | undefined>;

interface SpotifyConfig {
  clientId: string;
  clientSecret?: string;
  tokenEncrypted: string;
  tokenKey: string;
}

function getEnvVariable(name: string, env: EnvVars, required = true): string {
  const value = env[name];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value as string;
}

function getSpotifyConfig(env?: EnvVars): SpotifyConfig {
  const source = env ?? (process.env as EnvVars);

  return {
    clientId: getEnvVariable("SPOTIFY_CLIENT_ID", source),
    clientSecret: source.SPOTIFY_CLIENT_SECRET,
    tokenEncrypted: getEnvVariable("SPOTIFY_TOKEN_ENCRYPTED", source),
    tokenKey: getEnvVariable("SPOTIFY_TOKEN_KEY", source),
  };
}

function encodeBase64(input: string) {
  if (typeof btoa === "function") {
    return btoa(input);
  }

  return Buffer.from(input, "binary").toString("base64");
}

export async function getSpotifyRefreshToken(env?: EnvVars) {
  const config = getSpotifyConfig(env);
  return decryptToken(config.tokenEncrypted, config.tokenKey);
}

export async function refreshSpotifyAccessToken(refreshToken: string, env?: EnvVars) {
  const config = getSpotifyConfig(env);
  const requestBody = new URLSearchParams();
  requestBody.set("grant_type", "refresh_token");
  requestBody.set("refresh_token", refreshToken);

  if (!config.clientSecret) {
    requestBody.set("client_id", config.clientId);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (config.clientSecret) {
    const credentials = `${config.clientId}:${config.clientSecret}`;
    headers.Authorization = `Basic ${encodeBase64(credentials)}`;
  }

  const response = await fetchWithRetry(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers,
    body: requestBody,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Spotify token refresh failed: ${response.status} ${body}`);
  }

  return (await response.json()) as SpotifyRefreshTokenResponse;
}

async function fetchSpotify(endpoint: string, accessToken: string) {
  return fetchWithRetry(`${SPOTIFY_API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getSpotifyConsolePayload(env?: EnvVars): Promise<SpotifyConsolePayload> {
  const refreshToken = await getSpotifyRefreshToken(env);
  const tokenResponse = await refreshSpotifyAccessToken(refreshToken, env);
  const accessToken = tokenResponse.access_token;

  const [playerResponse, queueResponse] = await Promise.all([
    fetchSpotify("/me/player", accessToken),
    fetchSpotify("/me/player/queue", accessToken),
  ]);

  const playbackData = playerResponse.ok
    ? await playerResponse.json()
    : { error: `Player request failed with ${playerResponse.status}` };

  const queueData = queueResponse.ok
    ? await queueResponse.json()
    : { error: `Queue request failed with ${queueResponse.status}` };

  return {
    playbackData,
    queueData,
  };
}
