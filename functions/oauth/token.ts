import type { AuthDatabaseEnv } from "../../src/backend/auth/d1-session-store";
import { ACCESS_TOKEN_TTL_SECONDS, OAuthAuthorizationStore } from "../../src/backend/mcp/auth/authorization";

function oauthError(error: string, description: string, status = 400): Response {
  return Response.json({ error, error_description: description }, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
  });
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function pkceS256(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64Url(new Uint8Array(digest));
}

export async function onRequestPost({ request, env }: { request: Request; env: AuthDatabaseEnv }): Promise<Response> {
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/x-www-form-urlencoded")) {
    return oauthError("invalid_request", "Token requests must use application/x-www-form-urlencoded.");
  }

  const form = await request.formData();
  const grantType = form.get("grant_type");
  const code = form.get("code");
  const clientId = form.get("client_id");
  const redirectUri = form.get("redirect_uri");
  const codeVerifier = form.get("code_verifier");
  if (grantType !== "authorization_code") {
    return oauthError("unsupported_grant_type", "Only authorization_code is supported.");
  }
  if ([code, clientId, redirectUri, codeVerifier].some((value) => typeof value !== "string" || !value)) {
    return oauthError("invalid_request", "code, client_id, redirect_uri, and code_verifier are required.");
  }

  const store = new OAuthAuthorizationStore(env.AUTH_DB);
  const authorizationCode = await store.consumeAuthorizationCode(code as string);
  if (!authorizationCode) {
    return oauthError("invalid_grant", "Authorization code is invalid or expired.");
  }

  // The code is deliberately consumed before validation: a failed exchange cannot replay the grant.
  if (authorizationCode.clientId !== clientId || authorizationCode.redirectUri !== redirectUri) {
    return oauthError("invalid_grant", "Authorization code is not valid for this client or redirect URI.");
  }
  if (await pkceS256(codeVerifier as string) !== authorizationCode.codeChallenge) {
    return oauthError("invalid_grant", "PKCE verification failed.");
  }

  if (!await store.isClientGrantActive(authorizationCode.grantId, authorizationCode.subject)) {
    return oauthError("invalid_grant", "Client authorization has been revoked.");
  }

  const { token } = await store.createAccessToken(authorizationCode);
  return Response.json({
    access_token: token,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
    scope: authorizationCode.scope,
  }, { headers: { "Cache-Control": "no-store", Pragma: "no-cache" } });
}
