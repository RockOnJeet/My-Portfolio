import type { McpServer } from "@modelcontextprotocol/server";
import { createServerInfoCapability } from "./server-info";
import type { McpCapabilityRegistry, McpServerConfig } from "../types";

/**
 * Canonical registry of capabilities implemented by the MCP server.
 *
 * A capability being present here means the server knows how to expose it;
 * whether it is active for a deployment is controlled independently by
 * McpServerConfig.enabledCapabilities.
 */
export const MCP_CAPABILITY_REGISTRY: McpCapabilityRegistry = {
  server_info: createServerInfoCapability,
};

export function registerEnabledCapabilities(
  server: McpServer,
  config: Readonly<McpServerConfig>,
  registry: McpCapabilityRegistry = MCP_CAPABILITY_REGISTRY,
): void {
  const seenCapabilityIds = new Set<string>();

  for (const capabilityId of config.enabledCapabilities) {
    if (seenCapabilityIds.has(capabilityId)) {
      throw new Error(`Duplicate MCP capability configured: ${capabilityId}`);
    }
    seenCapabilityIds.add(capabilityId);

    const capabilityFactory = registry[capabilityId];
    if (!capabilityFactory) {
      throw new Error(`Unknown MCP capability configured: ${capabilityId}`);
    }

    const capability = capabilityFactory(config);
    if (capability.definition.id !== capabilityId) {
      throw new Error(
        `MCP capability registry key "${capabilityId}" does not match definition id "${capability.definition.id}"`,
      );
    }

    capability.register(server);
  }
}
