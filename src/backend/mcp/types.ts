import type { McpServer } from "@modelcontextprotocol/server";

export type McpAuthMode = "oauth" | "none";

export interface McpServerConfig {
  name: string;
  version: string;
  description: string;
  authMode: McpAuthMode;
  supportedScopes: string[];
  enabledCapabilities: string[];
}

export interface McpCapabilityDefinition {
  id: string;
  toolName: string;
  description: string;
  requiredScopes: string[];
}

export interface McpCapability {
  definition: McpCapabilityDefinition;
  register(server: McpServer): void;
}

export type McpCapabilityFactory = (config: Readonly<McpServerConfig>) => McpCapability;

export type McpCapabilityRegistry = Readonly<Record<string, McpCapabilityFactory>>;
