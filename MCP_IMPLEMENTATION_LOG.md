# MCP Implementation Log

This file tracks implementation work and architectural decisions for the MCP server only. Keep it current after each MCP implementation batch.

## Baseline

- Working branch: `test/mcp`.
- Local implementation intentionally starts from commit `b15e167` rather than the discarded upstream `test/mcp` implementation.
- Existing application architecture uses Cloudflare Pages Functions under `functions/` with backend logic under `src/backend/`.
- MCP implementation lives under `src/backend/mcp/`, with the HTTP request boundary under `functions/mcp.ts`.
- The Pages project is dashboard-configured rather than Wrangler-configured. Cloudflare Pages `Secrets and Variables` are already available to Functions and are used elsewhere in the project.

## Current Architecture

```text
GitHub OAuth App
       |
       | upstream identity proof only
       v
Application auth layer
       |
       +---- future browser session -> /admin
       |
       `---- future MCP Authorization Server
                     |
                     v
Cloudflare Pages /mcp Resource Server
       |
       v
loadMcpConfig() -> authMode dispatch
       |
       v
MCP handler -> server factory -> capability registry
```

MCP behavioral configuration is intentionally file-backed for now. Runtime-managed behavioral configuration will be introduced later with Wrangler/Cloudflare infrastructure. Migration seams must be marked with `TODO(wrangler)`.

Deployment-specific secrets/variables are separate from MCP behavioral configuration and may use the existing Cloudflare Pages `env` bindings immediately.

## Completed Work

### Phase 1 - Data model and configuration surface

- Added `McpServerConfig` with server identity, auth mode, supported scopes, and enabled capabilities.
- Added the current file-backed defaults and `loadMcpConfig()` provider seam.
- Added the canonical capability registry.

### Phase 2 - MCP v2 foundation

- Removed MCP SDK v1 and migrated to `@modelcontextprotocol/server@2.0.0` with Zod 4.
- Added configuration-aware capability contracts, registry orchestration, and fresh MCP server construction.
- Added the deterministic read-only `server_info` capability.

### Phase 3A - Cloudflare HTTP boundary

- Added `functions/mcp.ts` using MCP v2 `createMcpHandler()` and Web-standard `fetch()`.
- Test deployment validated Streamable HTTP initialization, server identity, `tools/list`, `server_info`, and route ownership.

### Phase 3B - Explicit auth-mode boundary

- Current file-backed default is `authMode: "none"`, matching deployed behavior.
- `none` forwards to MCP; `oauth` fails closed with HTTP 503 until implemented.
- Configuration is loaded once per request and passed into server construction.
- MCP SDK server identity receives configured name, version, and description.

### Superseded Phase 3C1 - Cloudflare Access exploration

- Cloudflare Access was evaluated as a shared authentication layer for `/admin` and `/mcp`.
- The direction was superseded before integration/deployment after clarifying that the application should own authorization and MCP OAuth.
- Cleanup completed: all temporary Access-specific source modules and the `@cloudflare/pages-plugin-cloudflare-access` dependency were removed.

### Phase 3C2 - GitHub upstream identity foundation

- Chose a GitHub OAuth App intentionally rather than a GitHub App: this application only needs upstream human identity, not GitHub installation/repository semantics.
- Added provider-neutral `ApplicationIdentity` with GitHub provider, immutable numeric subject, and informational login.
- Added typed GitHub OAuth deployment configuration for `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_OWNER_ID`, and `AUTH_COOKIE_SECRET`.
- Added `/oauth/github/login` to create a cryptographically random OAuth state, bind it to an HMAC-signed HttpOnly/Secure/SameSite=Lax cookie, and redirect to GitHub.
- Added `/oauth/github/callback` to validate state, exchange the authorization code server-side, query the authenticated GitHub user, and authorize only the configured immutable numeric owner ID.
- GitHub OAuth requests intentionally request no additional scope; public identity is sufficient for the owner check.
- The temporary successful callback response contains only safe application identity fields. GitHub access tokens are never returned to the browser or MCP client.
- `/mcp` remains `authMode: "none"`; this identity foundation does not alter the proven MCP path.

## Architectural Decisions

### MCP SDK and OAuth responsibility

Use MCP TypeScript SDK v2 through `@modelcontextprotocol/server`. MCP v2 remains the Resource Server implementation. Do not restore the frozen v1-style Authorization Server helpers for new OAuth code.

The application owns authentication state, authorization policy, MCP OAuth behavior, sessions/tokens, scopes, and capability authorization. Infrastructure does not become the authorization control plane.

### GitHub OAuth App as upstream IdP

GitHub proves human identity only. The application authorizes the returned immutable numeric GitHub user ID against `GITHUB_OWNER_ID`.

The GitHub access token is backend-only and exists only to retrieve the authenticated GitHub identity. It must never become an MCP bearer token or be exposed to the browser.

GitHub OAuth scopes and future MCP scopes are separate namespaces.

### Future identity-provider flexibility

Keep upstream identity verification behind an application-owned boundary. MCP capabilities and admin authorization must not depend directly on GitHub token semantics. Another upstream IdP can later be added/replaced without redesigning the MCP Resource Server.

### Shared admin + MCP authentication

The future admin portal and MCP OAuth authorization UI should share the same application identity/session foundation where practical:

```text
GitHub login
    |
    v
application identity/session
    |
    +---- /admin authorization
    |
    `---- MCP authorization/consent
             |
             v
       application-issued MCP token
```

### OAuth transaction state

The GitHub identity bootstrap uses a short-lived signed browser cookie for OAuth `state`, avoiding persistence solely for the upstream login handshake. Durable application sessions and MCP authorization transactions are separate concerns and may require runtime storage.

### Deployment configuration

MCP behavioral settings remain file-backed until the planned runtime-config/admin migration.

Phase 3C2 deployment requires these Cloudflare Pages Variables and Secrets:

```text
GITHUB_CLIENT_ID=<GitHub OAuth App client ID>
GITHUB_CLIENT_SECRET=<secret>
GITHUB_OWNER_ID=<immutable numeric GitHub user ID>
AUTH_COOKIE_SECRET=<high-entropy secret>
```

`GITHUB_CLIENT_SECRET` and `AUTH_COOKIE_SECRET` must be Secrets. Client ID and owner ID may be ordinary Variables.

The GitHub OAuth App authorization callback for the test deployment is:

```text
https://test-mcp.rockonjeet.pages.dev/oauth/github/callback
```

### Configuration storage

Do not introduce KV, D1, or other Wrangler-managed persistence for MCP behavioral configuration yet. OAuth/session persistence may independently require Cloudflare storage and will be selected based on those requirements.

## Verification History

Each implemented code batch is followed by workspace diagnostics and repository typecheck/build validation.

Current verification commands:

```text
npm run typecheck -- --pretty false
npm run build
```

## Deferred Work

- Establish durable application sessions reusable by `/admin` and MCP authorization.
- Select persistence for sessions/OAuth grants/authorization transactions as needed.
- Implement MCP protected-resource and Authorization Server metadata.
- Implement MCP Authorization Code + PKCE flow and application token issuance.
- Switch `/mcp` to Resource Server bearer-token enforcement.
- Connect MCP scopes to capability authorization.
- Add additional capabilities.
- Port file-backed MCP behavioral configuration to runtime-managed storage through Wrangler when requested.
- Add the future admin-console configuration surface.

## Next Step

Commit/deploy Phase 3C2 independently. Configure the GitHub OAuth App and Pages environment variables, then validate `/oauth/github/login` -> GitHub -> `/oauth/github/callback`. A successful callback must report only the safe application identity and `authorized: true`. Keep `/mcp` in `none` mode throughout this checkpoint.
