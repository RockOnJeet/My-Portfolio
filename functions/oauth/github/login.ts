import { loadGitHubOAuthConfig, type GitHubOAuthEnv } from "../../../src/backend/auth/github/config";
import { createGitHubAuthorizationUrl } from "../../../src/backend/auth/github/oauth";
import { createOAuthStateCookie } from "../../../src/backend/auth/oauth-state";

export async function onRequestGet({ env }: { env: GitHubOAuthEnv }): Promise<Response> {
  const config = loadGitHubOAuthConfig(env);
  const { state, cookie } = await createOAuthStateCookie(config.cookieSecret);

  return new Response(null, {
    status: 302,
    headers: {
      Location: createGitHubAuthorizationUrl(config, state),
      "Set-Cookie": cookie,
      "Cache-Control": "no-store",
    },
  });
}
