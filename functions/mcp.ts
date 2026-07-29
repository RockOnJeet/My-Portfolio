import { createMcpHandler } from "@modelcontextprotocol/server";
import { createMcpServer } from "../src/backend/mcp/server";

const mcpHandler = createMcpHandler(() => createMcpServer());

export function onRequest({ request }: { request: Request }): Promise<Response> {
  return mcpHandler.fetch(request);
}
