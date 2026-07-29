# MCP Implementation Log

This file tracks implementation work and architectural decisions for the MCP server only. Keep it current after each MCP implementation batch.

## Baseline

- Working branch: `test/mcp`.
- Local implementation intentionally starts from commit `b15e167` rather than the nine discarded upstream `test/mcp` commits.
- Existing application architecture uses Cloudflare Pages Functions under `functions/` with backend logic under `src/backend/`.
- MCP implementation lives under `src/backend/mcp/`, with the HTTP request boundary under `functions/mcp.ts`.

## Current Architecture

```text
Cloudflare Pages /mcp request
        |
        v
functions/mcp.ts
        |
        v
createMcpHandler()
        |
        v
createMcpServer()
        |
        v
loadMcpConfig()
        |
        v
registerEnabledCapabilities(config)
        |
        v
Capability factories receive loaded config
        |
        v
Individual capability modules register MCP tools
```

Configuration is intentionally file-backed for now. Runtime-managed configuration will be introduced later with Wrangler/Cloudflare infrastructure. Migration seams must be marked with `TODO(wrangler)`.

## Completed Work

### Phase 1 - Data model and configuration surface

- Added `src/backend/mcp/types.ts`.
- Added `McpServerConfig` with server name, version, description, auth mode, supported scopes, and enabled capability IDs.
- Added capability metadata types.
- Added `src/backend/mcp/config/defaults.ts` as the current file-backed configuration source.
- Added `src/backend/mcp/config/index.ts` with `loadMcpConfig()` and a future runtime-provider seam.
- Marked the runtime provider boundary with `TODO(wrangler)`.
- Added the canonical capability registry.

### Phase 2 - MCP v2 foundation

- Initially evaluated `@modelcontextprotocol/sdk` v1, then removed it before building server logic.
- Audited the workspace for MCP SDK v2 compatibility.
- Confirmed the project uses ESM, TypeScript bundler resolution, a compatible Node development environment, and no existing source-level Zod API usage.
- Migrated dependencies to `@modelcontextprotocol/server@2.0.0` and Zod 4.
- Current installed Zod version after migration: `4.4.3`.
- Added `version: "1.0.0"` to the file-backed MCP server identity.
- Added executable `McpCapability` contract with `register(server: McpServer)`.
- Added configuration-aware `McpCapabilityFactory` contract so capabilities can consume the already-loaded configuration without importing file defaults directly.
- Added `registerEnabledCapabilities()` orchestration.
- Capability registration rejects duplicate configured IDs, unknown IDs, and registry-key/definition-ID mismatches.
- Added `src/backend/mcp/server.ts` with a fresh-server factory using `loadMcpConfig()` and `registerEnabledCapabilities()`.
- The server factory accepts the future configuration-provider seam while remaining file-backed when called normally.

### Phase 2B - First capability

- Added `src/backend/mcp/capabilities/server-info.ts`.
- Added the deterministic, read-only `server_info` MCP tool.
- `server_info` returns the loaded server name, version, and description as both text content and structured content.
- Tool input and output use the MCP v2 Standard Schema-compatible Zod 4 object form.
- Added `server_info` to the canonical capability registry.
- Enabled `server_info` through `DEFAULT_MCP_CONFIG.enabledCapabilities`.
- The capability receives loaded configuration through its factory rather than importing `DEFAULT_MCP_CONFIG`, preserving the future runtime-config boundary.

### Phase 3A - Cloudflare HTTP boundary

- Added `functions/mcp.ts`, exposing the MCP server at the Cloudflare Pages `/mcp` route.
- Uses MCP v2 `createMcpHandler()` and delegates each request to its Web-standard `fetch()` interface.
- The handler factory uses `createMcpServer()`, preserving fresh server construction and the existing config/capability pipeline.
- Kept the SDK's default stateless legacy compatibility posture for now.
- Authentication is intentionally absent from this boundary so Cloudflare/MCP transport compatibility can be validated independently before auth routing and OAuth are introduced.
- This phase is a commit + deploy checkpoint because local Vite builds do not execute or bundle Cloudflare Pages Functions.

## Architectural Decisions

### MCP SDK

Use MCP TypeScript SDK v2 through `@modelcontextprotocol/server`. Do not build new MCP code against the removed v1 `@modelcontextprotocol/sdk` package.

### Server lifecycle

Follow the v2 server-factory architecture: create/configure an `McpServer`, register enabled capabilities, and expose it through the v2 HTTP handler. Do not create a global persistent MCP server unless a later requirement specifically justifies it.

### Capability ownership

Each capability module owns its MCP-facing schema, handler, and call to the SDK registration API. The central registry maps internal capability IDs to capability factories and controls which modules are enabled.

Capability factories receive the already-loaded `McpServerConfig`; capability modules must not import file-backed defaults to obtain runtime behavior.

Internal capability IDs and public MCP tool names are separate concepts.

### Authentication boundary

OAuth and no-auth switching belong at the HTTP/request boundary, not inside capability implementations. Capability metadata may declare required scopes, but bearer-token mechanics must not leak into tool modules.

Phase 3A deliberately exposes the transport without authentication. This is temporary and exists to isolate runtime/transport validation before Phase 3B makes auth-mode routing explicit.

### Configuration storage

Keep configuration in files for the current implementation. Do not introduce KV, D1, or other Wrangler-managed persistence yet. Mark future runtime-storage migration points with `TODO(wrangler)`.

## Verification History

Each implemented code batch has been followed by workspace diagnostics and the repository typecheck.

Current verification commands:

```text
npm run typecheck -- --pretty false
npm run build
```

Latest Phase 3A result: diagnostics clean; TypeScript typecheck passes; Vite production build passes with only the repository's existing large-chunk warning.

## Deferred Work

- Implement explicit OAuth/no-auth request-boundary switching.
- Implement OAuth protected-resource metadata and scope enforcement.
- Add additional real capabilities/tools as required.
- Port file-backed configuration to runtime-managed storage through Wrangler when requested.
- Add/administer the future admin-console configuration surface.

## Next Step

Commit and deploy Phase 3A, then validate the deployed `/mcp` route, MCP initialization, `tools/list`, and `server_info` invocation. Once transport/runtime behavior is proven, implement explicit no-auth mode routing as Phase 3B before adding OAuth.
