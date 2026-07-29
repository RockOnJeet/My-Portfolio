import { McpServer } from "@modelcontextprotocol/server";
import { registerEnabledCapabilities } from "./capabilities/registry";
import { loadMcpConfig, type McpConfigProvider } from "./config";
import type { McpServerConfig } from "./types";

export function createMcpServerFromConfig(
  config: Readonly<McpServerConfig>,
  grantedScopes?: ReadonlySet<string>,
): McpServer {
  const server = new McpServer({
    name: config.name,
    version: config.version,
    description: config.description,
  });

  registerEnabledCapabilities(server, config, grantedScopes);

  return server;
}

export async function createMcpServer(provider?: McpConfigProvider): Promise<McpServer> {
  const config = await loadMcpConfig(provider);
  return createMcpServerFromConfig(config);
}
