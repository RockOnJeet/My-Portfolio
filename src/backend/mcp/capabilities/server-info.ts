import { z } from "zod";
import type { McpCapability, McpCapabilityDefinition, McpServerConfig } from "../types";

const SERVER_INFO_DEFINITION: McpCapabilityDefinition = {
  id: "server_info",
  toolName: "server_info",
  description: "Return public identity and descriptive metadata for this MCP server.",
  requiredScopes: [],
};

export function createServerInfoCapability(
  config: Readonly<McpServerConfig>,
): McpCapability {
  const outputSchema = z.object({
    name: z.string(),
    version: z.string(),
    description: z.string(),
  });

  return {
    definition: SERVER_INFO_DEFINITION,
    register(server) {
      server.registerTool(
        SERVER_INFO_DEFINITION.toolName,
        {
          description: SERVER_INFO_DEFINITION.description,
          inputSchema: z.object({}),
          outputSchema,
        },
        async () => {
          const output = {
            name: config.name,
            version: config.version,
            description: config.description,
          };

          return {
            content: [{ type: "text", text: JSON.stringify(output) }],
            structuredContent: output,
          };
        },
      );
    },
  };
}
