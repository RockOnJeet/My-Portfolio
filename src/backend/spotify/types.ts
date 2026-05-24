export interface SpotifyRefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  refresh_token?: string;
}

export interface SpotifyErrorResponse {
  error: string;
  error_description?: string;
}

export interface SpotifyConsolePayload {
  playbackData: unknown;
  queueData: unknown;
}

export interface SpotifyConsoleResult {
  success: boolean;
  payload?: SpotifyConsolePayload;
  error?: string;
}
