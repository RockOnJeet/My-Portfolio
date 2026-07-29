import {
  getOAuthProtectedResourceMetadataUrl,
  oauthMetadataResponse,
  type AuthMetadataOptions,
  type OAuthMetadata,
} from "@modelcontextprotocol/server";
import type { McpServerConfig } from "../types";

const MCP_PATH = "/mcp";
const AUTHORIZE_PATH = "/oauth/authorize";
const TOKEN_PATH = "/oauth/token";

export function getMcpResourceUrl(request: Request): URL {
  return new URL(MCP_PATH, new URL(request.url).origin);
}

export function getMcpProtectedResourceMetadataUrl(request: Request): string {
  return getOAuthProtectedResourceMetadataUrl(getMcpResourceUrl(request));
}

export function buildMcpOAuthMetadata(request: Request, config: McpServerConfig): OAuthMetadata {
  const origin = new URL(request.url).origin;
  return {
    issuer: origin,
    authorization_endpoint: new URL(AUTHORIZE_PATH, origin).href,
    token_endpoint: new URL(TOKEN_PATH, origin).href,
    scopes_supported: [...config.supportedScopes],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    token_endpoint_auth_methods_supported: ["none"],
    code_challenge_methods_supported: ["S256"],
    client_id_metadata_document_supported: true,
  };
}

export function mcpOAuthMetadataResponse(
  request: Request,
  config: McpServerConfig,
): Response | undefined {
  const options: AuthMetadataOptions = {
    oauthMetadata: buildMcpOAuthMetadata(request, config),
    resourceServerUrl: getMcpResourceUrl(request),
    scopesSupported: [...config.supportedScopes],
    resourceName: config.name,
  };

  return oauthMetadataResponse(request, options);
}
