import { D1SessionStore, type AuthDatabaseEnv } from "../../../src/backend/auth/d1-session-store";
import { loadGitHubOAuthConfig, type GitHubOAuthEnv } from "../../../src/backend/auth/github/config";
import { exchangeGitHubCode, getGitHubIdentity, isGitHubOwner } from "../../../src/backend/auth/github/oauth";
import {
  clearOAuthReturnCookie,
  clearOAuthStateCookie,
  readOAuthReturnCookie,
  verifyOAuthState,
} from "../../../src/backend/auth/oauth-state";
import { createSessionCookie, createSessionToken, hashSessionToken, SESSION_TTL_SECONDS } from "../../../src/backend/auth/session";

interface Env extends GitHubOAuthEnv, AuthDatabaseEnv {}

function responseHeaders(sessionCookie?: string): Headers {
  const headers = new Headers({ "Cache-Control": "no-store" });
  headers.append("Set-Cookie", clearOAuthStateCookie());
  headers.append("Set-Cookie", clearOAuthReturnCookie());
  if (sessionCookie) headers.append("Set-Cookie", sessionCookie);
  return headers;
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const config = loadGitHubOAuthConfig(env);
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) return Response.json({ authorized: false, error }, { status: 400, headers: responseHeaders() });

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return Response.json({ authorized: false, error: "Missing OAuth code or state." }, { status: 400, headers: responseHeaders() });
  if (!(await verifyOAuthState(request, state, config.cookieSecret))) {
    return Response.json({ authorized: false, error: "Invalid OAuth state." }, { status: 400, headers: responseHeaders() });
  }

  const accessToken = await exchangeGitHubCode(config, code);
  const identity = await getGitHubIdentity(accessToken);
  if (!isGitHubOwner(identity, config)) {
    return Response.json({ authorized: false, error: "GitHub identity is not authorized." }, { status: 403, headers: responseHeaders() });
  }

  const token = createSessionToken();
  const now = Math.floor(Date.now() / 1000);
  await new D1SessionStore(env.AUTH_DB).create({
    tokenHash: await hashSessionToken(token), identity, createdAt: now, expiresAt: now + SESSION_TTL_SECONDS,
  });

  const returnTo = await readOAuthReturnCookie(request, config.cookieSecret);
  const headers = responseHeaders(createSessionCookie(token));
  if (returnTo) {
    headers.set("Location", new URL(returnTo, url.origin).href);
    return new Response(null, { status: 302, headers });
  }
  return Response.json({ authorized: true, identity }, { status: 200, headers });
}
