import { createMcpHandler, type AuthInfo } from "@modelcontextprotocol/server";
import type { AuthDatabaseEnv } from "../src/backend/auth/d1-session-store";
import { OAuthAuthorizationStore } from "../src/backend/mcp/auth/authorization";
import { loadMcpConfig } from "../src/backend/mcp/config";
import { getMcpProtectedResourceMetadataUrl, getMcpResourceUrl } from "../src/backend/mcp/auth/metadata";
import { createMcpServerFromConfig } from "../src/backend/mcp/server";
import type { McpServerConfig } from "../src/backend/mcp/types";

function createHandler(config: Readonly<McpServerConfig>) {
  return createMcpHandler(() => createMcpServerFromConfig(config));
}

function unauthorized(request: Request): Response {
  const metadata = getMcpProtectedResourceMetadataUrl(request);
  return Response.json({ error: "invalid_token", error_description: "A valid Bearer access token is required." }, {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "WWW-Authenticate": `Bearer resource_metadata="${metadata}"`,
    },
  });
}

async function resolveAuthInfo(request: Request, env: AuthDatabaseEnv): Promise<AuthInfo | null> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const rawToken = authorization.slice(7).trim();
  if (!rawToken) return null;

  const access = await new OAuthAuthorizationStore(env.AUTH_DB).findAccessToken(rawToken);
  if (!access || access.resource !== getMcpResourceUrl(request).href) return null;
  return {
    token: rawToken,
    clientId: access.clientId,
    scopes: access.scope.split(/\s+/).filter(Boolean),
    expiresAt: access.expiresAt,
    resource: new URL(access.resource),
    extra: { subject: access.subject },
  };
}

export async function onRequest({ request, env }: { request: Request; env: AuthDatabaseEnv }): Promise<Response> {
  const config = await loadMcpConfig();
  const handler = createHandler(config);

  if (config.authMode === "none") return handler.fetch(request);

  const authInfo = await resolveAuthInfo(request, env);
  console.info("MCP bearer authentication", {
    authorizationHeaderPresent: request.headers.has("Authorization"),
    bearerTokenAccepted: authInfo !== null,
  });
  if (!authInfo) return unauthorized(request);
  return handler.fetch(request, { authInfo });
}
