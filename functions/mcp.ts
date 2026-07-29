import { createMcpHandler } from "@modelcontextprotocol/server";
import { loadMcpConfig } from "../src/backend/mcp/config";
import { createMcpServerFromConfig } from "../src/backend/mcp/server";
import type { McpServerConfig } from "../src/backend/mcp/types";

function createHandler(config: Readonly<McpServerConfig>) {
  return createMcpHandler(() => createMcpServerFromConfig(config));
}

export async function onRequest({ request }: { request: Request }): Promise<Response> {
  const config = await loadMcpConfig();

  switch (config.authMode) {
    case "none":
      return createHandler(config).fetch(request);
    case "oauth":
      return new Response("MCP OAuth authentication is not implemented yet.", { status: 503 });
  }
}
