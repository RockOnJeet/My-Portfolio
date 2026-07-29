import { DEFAULT_MCP_CONFIG } from "./defaults";
import type { McpServerConfig } from "../types";

// TODO(wrangler): Back this provider with runtime-managed configuration storage.
export interface McpConfigProvider {
  getConfig(): Promise<Partial<McpServerConfig> | null>;
}

function copyConfig(config: McpServerConfig): McpServerConfig {
  return {
    ...config,
    supportedScopes: [...config.supportedScopes],
    enabledCapabilities: [...config.enabledCapabilities],
  };
}

export async function loadMcpConfig(provider?: McpConfigProvider): Promise<McpServerConfig> {
  const defaults = copyConfig(DEFAULT_MCP_CONFIG);
  if (!provider) {
    return defaults;
  }

  const runtimeConfig = await provider.getConfig();
  if (!runtimeConfig) {
    return defaults;
  }

  return {
    ...defaults,
    ...runtimeConfig,
    supportedScopes: runtimeConfig.supportedScopes
      ? [...runtimeConfig.supportedScopes]
      : defaults.supportedScopes,
    enabledCapabilities: runtimeConfig.enabledCapabilities
      ? [...runtimeConfig.enabledCapabilities]
      : defaults.enabledCapabilities,
  };
}

export { DEFAULT_MCP_CONFIG } from "./defaults";
