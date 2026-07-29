import type { McpServerConfig } from "../types";

/**
 * Bootstrap configuration used when no runtime-managed configuration exists.
 * Runtime configuration will be introduced separately and should override these
 * values rather than requiring changes to the MCP server implementation.
 */
export const DEFAULT_MCP_CONFIG: Readonly<McpServerConfig> = {
  name: "RockOnJeet MCP",
  version: "1.0.0",
  description: "MCP server for RockOnJeet services and capabilities.",
  authMode: "none",
  supportedScopes: [],
  enabledCapabilities: ["server_info"],
};
