import { loadMcpConfig } from "../../src/backend/mcp/config";
import { mcpOAuthMetadataResponse } from "../../src/backend/mcp/auth/metadata";

export async function onRequestGet({ request }: { request: Request }): Promise<Response> {
  const response = mcpOAuthMetadataResponse(request, await loadMcpConfig());
  return response ?? new Response(null, { status: 404 });
}
