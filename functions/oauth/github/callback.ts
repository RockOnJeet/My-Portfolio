import { loadGitHubOAuthConfig, type GitHubOAuthEnv } from "../../../src/backend/auth/github/config";
import {
  exchangeGitHubCode,
  getGitHubIdentity,
  isGitHubOwner,
} from "../../../src/backend/auth/github/oauth";
import { clearOAuthStateCookie, verifyOAuthState } from "../../../src/backend/auth/oauth-state";

function json(payload: unknown, status: number): Response {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Set-Cookie": clearOAuthStateCookie(),
    },
  });
}

export async function onRequestGet({
  request,
  env,
}: {
  request: Request;
  env: GitHubOAuthEnv;
}): Promise<Response> {
  const config = loadGitHubOAuthConfig(env);
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) {
    return json({ authorized: false, error }, 400);
  }

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

  return json(
    {
      authorized: true,
      identity,
    },
    200,
  );
}
