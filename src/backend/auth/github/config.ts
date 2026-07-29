export interface GitHubOAuthEnv {
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GITHUB_OWNER_ID?: string;
  AUTH_COOKIE_SECRET?: string;
}

export interface GitHubOAuthConfig {
  clientId: string;
  clientSecret: string;
  ownerId: string;
  cookieSecret: string;
}

function requireEnv(env: GitHubOAuthEnv, key: keyof GitHubOAuthEnv): string {
  const value = env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function loadGitHubOAuthConfig(env: GitHubOAuthEnv): GitHubOAuthConfig {
  const ownerId = requireEnv(env, "GITHUB_OWNER_ID");
  if (!/^\d+$/.test(ownerId)) {
    throw new Error("GITHUB_OWNER_ID must be the immutable numeric GitHub user ID.");
  }

  return {
    clientId: requireEnv(env, "GITHUB_CLIENT_ID"),
    clientSecret: requireEnv(env, "GITHUB_CLIENT_SECRET"),
    ownerId,
    cookieSecret: requireEnv(env, "AUTH_COOKIE_SECRET"),
  };
}
