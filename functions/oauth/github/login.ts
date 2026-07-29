import { loadGitHubOAuthConfig, type GitHubOAuthEnv } from "../../../src/backend/auth/github/config";
import { createGitHubAuthorizationUrl } from "../../../src/backend/auth/github/oauth";
import { createOAuthReturnCookie, createOAuthStateCookie } from "../../../src/backend/auth/oauth-state";

export async function onRequestGet({ request, env }: { request: Request; env: GitHubOAuthEnv }): Promise<Response> {
  const config = loadGitHubOAuthConfig(env);
  const { state, cookie } = await createOAuthStateCookie(config.cookieSecret);
  const headers = new Headers({
    Location: createGitHubAuthorizationUrl(config, state),
    "Cache-Control": "no-store",
  });
  headers.append("Set-Cookie", cookie);

  const returnTo = new URL(request.url).searchParams.get("return_to");
  if (returnTo) headers.append("Set-Cookie", await createOAuthReturnCookie(returnTo, config.cookieSecret));

  return new Response(null, { status: 302, headers });
}
