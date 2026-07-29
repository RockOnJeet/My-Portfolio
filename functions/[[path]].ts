import { loadMcpConfig } from "../src/backend/mcp/config";
import { mcpOAuthMetadataResponse } from "../src/backend/mcp/auth/metadata";

const PROTECTED_RESOURCE_METADATA_PATH = "/.well-known/oauth-protected-resource/mcp";
const AUTHORIZATION_SERVER_METADATA_PATH = "/.well-known/oauth-authorization-server";

interface PagesContext {
  request: Request;
  next(): Promise<Response>;
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const pathname = new URL(context.request.url).pathname.replace(/\/$/, "");
  if (
    pathname !== PROTECTED_RESOURCE_METADATA_PATH &&
    pathname !== AUTHORIZATION_SERVER_METADATA_PATH
  ) {
    return context.next();
  }

  if (context.request.method !== "GET") {
    return new Response(null, { status: 405, headers: { Allow: "GET" } });
  }

  const response = mcpOAuthMetadataResponse(context.request, await loadMcpConfig());
  return response ?? new Response(null, { status: 404 });
}
