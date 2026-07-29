import {
  D1SessionStore,
  type AuthDatabaseEnv,
} from "../../../src/backend/auth/d1-session-store";
import { loadGitHubOAuthConfig, type GitHubOAuthEnv } from "../../../src/backend/auth/github/config";
import {
  exchangeGitHubCode,
  getGitHubIdentity,
  isGitHubOwner,
} from "../../../src/backend/auth/github/oauth";
import { clearOAuthStateCookie, verifyOAuthState } from "../../../src/backend/auth/oauth-state";
import {
  createSessionCookie,
  createSessionToken,
  hashSessionToken,
  SESSION_TTL_SECONDS,
} from "../../../src/backend/auth/session";

interface Env extends GitHubOAuthEnv, AuthDatabaseEnv {}

function json(payload: unknown, status: number, sessionCookie?: string): Response {
  const headers = new Headers({ "Cache-Control": "no-store" });
  headers.append("Set-Cookie", clearOAuthStateCookie());
  if (sessionCookie) headers.append("Set-Cookie", sessionCookie);
  return Response.json(payload, { status, headers });
}

export async function onRequestGet({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const config = loadGitHubOAuthConfig(env);
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) return json({ authorized: false, error }, 400);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return json({ authorized: false, error: "Missing OAuth code or state." }, 400);
  }

  if (!(await verifyOAuthState(request, state, config.cookieSecret))) {
    return json({ authorized: false, error: "Invalid OAuth state." }, 400);
  }

  const accessToken = await exchangeGitHubCode(config, code);
  const identity = await getGitHubIdentity(accessToken);
  if (!isGitHubOwner(identity, config)) {
    return json({ authorized: false, error: "GitHub identity is not authorized." }, 403);
  }

  const token = createSessionToken();
  const now = Math.floor(Date.now() / 1000);
  await new D1SessionStore(env.AUTH_DB).create({
    tokenHash: await hashSessionToken(token),
    identity,
    createdAt: now,
    expiresAt: now + SESSION_TTL_SECONDS,
  });

  return json({ authorized: true, identity }, 200, createSessionCookie(token));
}