import type { AuthDatabaseEnv } from "../../src/backend/auth/d1-session-store";
import { resolveApplicationSession } from "../../src/backend/auth/session-lookup";
import { OAuthAuthorizationStore } from "../../src/backend/mcp/auth/authorization";
import { resolveClientMetadata } from "../../src/backend/mcp/auth/client-metadata";
import { getMcpResourceUrl } from "../../src/backend/mcp/auth/metadata";
import { loadMcpConfig } from "../../src/backend/mcp/config";

function error(message: string, status = 400): Response {
  return Response.json({ error: "invalid_request", error_description: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function onRequestGet({ request, env }: { request: Request; env: AuthDatabaseEnv }): Promise<Response> {
  const url = new URL(request.url);
  const responseType = url.searchParams.get("response_type");
  const clientId = url.searchParams.get("client_id");
  const redirectUri = url.searchParams.get("redirect_uri");
  const state = url.searchParams.get("state");
  const codeChallenge = url.searchParams.get("code_challenge");
  const codeChallengeMethod = url.searchParams.get("code_challenge_method");
  const resource = url.searchParams.get("resource");
  const scope = url.searchParams.get("scope") ?? "";

  if (responseType !== "code" || !clientId || !redirectUri || !codeChallenge || codeChallengeMethod !== "S256" || !resource) {
    return error("Authorization Code with PKCE S256, client_id, redirect_uri, and resource are required.");
  }
  if (resource !== getMcpResourceUrl(request).href) return error("Invalid resource.");

  const config = await loadMcpConfig();
  const requestedScopes = scope.split(/\s+/).filter(Boolean);
  if (requestedScopes.some((value) => !config.supportedScopes.includes(value))) return error("Unsupported scope.");

  let client;
  try {
    client = await resolveClientMetadata(clientId);
  } catch (cause) {
    // TODO(auth-cleanup): Remove test-only CIMD diagnostic detail after interoperability is validated.
    const diagnostic = cause instanceof Error ? cause.message : "Unknown CIMD validation failure.";
    console.error("CIMD validation failed", { clientId, diagnostic });
    return Response.json({ error: "invalid_request", error_description: "Unable to validate client metadata.", diagnostic }, {
      status: 400, headers: { "Cache-Control": "no-store" },
    });
  }
  if (!client.redirectUris.includes(redirectUri)) return error("redirect_uri is not registered by the client metadata document.");

  const transactionId = await new OAuthAuthorizationStore(env.AUTH_DB).createTransaction({
    clientId,
    clientName: client.clientName,
    redirectUri,
    state,
    codeChallenge,
    resource,
    scope: requestedScopes.join(" "),
  });

  const session = await resolveApplicationSession(request, env.AUTH_DB);
  const next = new URL("/oauth/confirm", url.origin);
  next.searchParams.set("transaction", transactionId);
  if (session) return Response.redirect(next, 302);

  const login = new URL("/oauth/github/login", url.origin);
  login.searchParams.set("return_to", next.pathname + next.search);
  return Response.redirect(login, 302);
}
