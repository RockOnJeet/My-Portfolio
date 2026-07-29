import type { ApplicationIdentity } from "../identity";
import type { GitHubOAuthConfig } from "./config";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";

interface GitHubTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GitHubUserResponse {
  id: number;
  login: string;
}

interface GitHubErrorResponse {
  message?: string;
}

export function createGitHubAuthorizationUrl(config: GitHubOAuthConfig, state: string): string {
  const url = new URL(GITHUB_AUTHORIZE_URL);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeGitHubCode(
  config: GitHubOAuthConfig,
  code: string,
): Promise<string> {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed with HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as GitHubTokenResponse;
  if (!payload.access_token) {
    throw new Error(payload.error_description ?? payload.error ?? "GitHub token exchange failed.");
  }

  return payload.access_token;
}

export async function getGitHubIdentity(accessToken: string): Promise<ApplicationIdentity> {
  const response = await fetch(GITHUB_USER_URL, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2026-03-10",
      "User-Agent": "RockOnJeet-Portfolio-Auth",
    },
  });

  if (!response.ok) {
    // TODO(auth-cleanup): Reduce this deployment diagnostic once GitHub identity lookup is validated end-to-end.
    const payload = (await response.json().catch(() => ({}))) as GitHubErrorResponse;
    const details = [
      `HTTP ${response.status}`,
      payload.message && `message=${payload.message}`,
      response.headers.get("X-GitHub-Request-Id") &&
        `request_id=${response.headers.get("X-GitHub-Request-Id")}`,
      response.headers.get("X-OAuth-Scopes") !== null &&
        `oauth_scopes=${response.headers.get("X-OAuth-Scopes") || "(none)"}`,
      response.headers.get("X-RateLimit-Remaining") &&
        `rate_remaining=${response.headers.get("X-RateLimit-Remaining")}`,
    ].filter(Boolean);

    throw new Error(`GitHub user lookup failed: ${details.join(", ")}.`);
  }

  const user = (await response.json()) as GitHubUserResponse;
  return {
    provider: "github",
    subject: String(user.id),
    login: user.login,
  };
}

export function isGitHubOwner(identity: ApplicationIdentity, config: GitHubOAuthConfig): boolean {
  return identity.provider === "github" && identity.subject === config.ownerId;
}
