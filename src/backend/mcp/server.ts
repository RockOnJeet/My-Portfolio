import { McpServer } from "@modelcontextprotocol/server";
import { registerEnabledCapabilities } from "./capabilities/registry";
import { loadMcpConfig, type McpConfigProvider } from "./config";

export async function createMcpServer(provider?: McpConfigProvider): Promise<McpServer> {
  const config = await loadMcpConfig(provider);
  const server = new McpServer({
    name: config.name,
    version: config.version,
  });

  registerEnabledCapabilities(server, config);

  return server;
}
